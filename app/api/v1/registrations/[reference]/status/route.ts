import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ reference: string }> }
) {
  try {
    const { reference } = await params;
    const reg = db.findRegistrationByRef(reference);
    if (!reg) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Registration not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      reference: reg.reference,
      status: reg.status,
      memberCode: reg.client?.memberCode || null,
      clientName: reg.client?.fullName,
      packageName: reg.package?.name,
      durationDays: reg.package?.durationDays,
      startDate: reg.startDate,
      endDate: reg.endDate,
      totalPaise: reg.totalPaise,
      paymentStatus: reg.payment?.status,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to retrieve status';
    return NextResponse.json({ error: { code: 'SERVER_ERROR', message } }, { status: 500 });
  }
}
