import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }

  const { id } = await params;
  const reg = db.findRegistrationByRef(id);
  if (!reg) {
    return NextResponse.json({ error: { code: 'NOT_FOUND' } }, { status: 404 });
  }

  return NextResponse.json({ registration: reg });
}

export async function PATCH(
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
    const body = await req.json();
    const { notes, startDate, endDate, status } = body;

    if (notes !== undefined) reg.notes = notes;
    if (startDate) reg.startDate = startDate;
    if (endDate) reg.endDate = endDate;
    if (status && ['PENDING', 'CONFIRMED', 'CANCELLED', 'EXPIRED'].includes(status)) {
      reg.status = status;
    }
    reg.updatedAt = new Date().toISOString();

    db.logAudit({
      adminId: session.id,
      adminName: session.name,
      action: 'REGISTRATION_UPDATED',
      entityType: 'REGISTRATION',
      entityId: reg.id,
      details: { updates: body },
    });

    return NextResponse.json({ success: true, registration: reg });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Update failed';
    return NextResponse.json({ error: { code: 'SERVER_ERROR', message } }, { status: 500 });
  }
}
