import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session || session.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Only Super Admins can issue refunds' } }, { status: 403 });
  }

  const { id } = await params;
  const reg = db.findRegistrationByRef(id);
  if (!reg) {
    return NextResponse.json({ error: { code: 'NOT_FOUND' } }, { status: 404 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const reason = body.reason || 'Requested by client';

    const ok = db.refundRegistration(reg.id, session.id, session.name, reason);
    if (!ok) {
      return NextResponse.json({ error: { code: 'REFUND_FAILED' } }, { status: 400 });
    }

    return NextResponse.json({ success: true, status: 'CANCELLED', message: 'Refund recorded and processed' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Refund processing failed';
    return NextResponse.json({ error: { code: 'SERVER_ERROR', message } }, { status: 500 });
  }
}
