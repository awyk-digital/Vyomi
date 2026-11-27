import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, packageId } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: { code: 'INVALID_CODE', message: 'Coupon code required' } }, { status: 400 });
    }

    const pkg = db.findPackageById(packageId);
    if (!pkg) {
      return NextResponse.json({ error: { code: 'INVALID_PACKAGE', message: 'Valid package required' } }, { status: 400 });
    }

    const result = db.validateCoupon(code, pkg.pricePaise);
    if (!result.valid || !result.coupon) {
      return NextResponse.json({ error: { code: 'COUPON_REJECTED', message: result.message || 'Invalid coupon' } }, { status: 400 });
    }

    return NextResponse.json({
      valid: true,
      code: result.coupon.code,
      discountType: result.coupon.discountType,
      discountValue: result.coupon.discountValue,
      discountPaise: result.discountPaise,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Coupon validation failed';
    return NextResponse.json({ error: { code: 'SERVER_ERROR', message } }, { status: 500 });
  }
}
