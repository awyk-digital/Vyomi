import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { db, PayMethod } from '@/lib/db';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'MANAGER')) {
    return NextResponse.json({ error: { code: 'FORBIDDEN' } }, { status: 403 });
  }

  const { id } = await params;
  const reg = db.findRegistrationByRef(id);
  if (!reg) {
    return NextResponse.json({ error: { code: 'NOT_FOUND' } }, { status: 404 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const method: PayMethod = body.method || 'CASH';

    const result = db.confirmPaymentAndRegistration({
      registrationRef: reg.reference,
      paymentId: `offline_${Date.now()}`,
      method,
    });

    db.logAudit({
      adminId: session.id,
      adminName: session.name,
      action: 'OFFLINE_PAYMENT_RECORDED',
      entityType: 'REGISTRATION',
      entityId: reg.id,
      details: { method, memberCode: result.memberCode, amount: reg.totalPaise / 100 },
    });

    return NextResponse.json({
      success: true,
      memberCode: result.memberCode,
      status: 'CONFIRMED',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Mark paid failed';
    return NextResponse.json({ error: { code: 'SERVER_ERROR', message } }, { status: 500 });
  }
}
