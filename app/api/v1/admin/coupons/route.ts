import { NextResponse } from 'next/server';
import { getAdminSession, MANAGEMENT_ROLES } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  const session = await getAdminSession(MANAGEMENT_ROLES);
  if (!session) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }

  const coupons = db.getCoupons();
  return NextResponse.json({ coupons });
}

export async function POST(req: Request) {
  const session = await getAdminSession(MANAGEMENT_ROLES);
  if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'MANAGER')) {
    return NextResponse.json({ error: { code: 'FORBIDDEN' } }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { code, discountType, discountValue, maxUses, validUntil } = body;

    if (!code || !discountType || discountValue === undefined) {
      return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Code, type, and value are required' } }, { status: 400 });
    }

    const coupons = db.getCoupons();
    if (coupons.some((c) => c.code.toUpperCase() === code.trim().toUpperCase())) {
      return NextResponse.json({ error: { code: 'DUPLICATE_CODE', message: 'Coupon code already exists' } }, { status: 400 });
    }

    const newCoupon = {
      id: 'cpn-' + Math.random().toString(36).substring(2, 8),
      code: code.trim().toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      maxUses: maxUses ? Number(maxUses) : null,
      usedCount: 0,
      validFrom: new Date().toISOString(),
      validUntil: validUntil || null,
      isActive: true,
    };

    coupons.push(newCoupon);

    db.logAudit({
      adminId: session.id,
      adminName: session.name,
      action: 'COUPON_CREATED',
      entityType: 'COUPON',
      entityId: newCoupon.id,
      details: newCoupon,
    });

    return NextResponse.json({ success: true, coupon: newCoupon });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Coupon creation failed';
    return NextResponse.json({ error: { code: 'SERVER_ERROR', message } }, { status: 500 });
  }
}
