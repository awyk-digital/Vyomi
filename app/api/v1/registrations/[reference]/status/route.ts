import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { db } from '@/lib/db';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ reference: string }> }
) {
  try {
    const { reference } = await params;

    // 1. Try Supabase first
    try {
      const { data: reg, error } = await supabaseAdmin
        .from('registrations')
        .select(`
          reference,
          status,
          member_code,
          preferred_slot,
          start_date,
          end_date,
          total_amount_inr,
          clients (
            full_name,
            phone,
            email,
            member_code
          ),
          packages (
            name,
            duration_days
          ),
          payments (
            status,
            method,
            transaction_ref,
            paid_at
          )
        `)
        .eq('reference', reference)
        .maybeSingle();

      if (reg && !error) {
        const clientData = Array.isArray(reg.clients) ? reg.clients[0] : reg.clients;
        const packageData = Array.isArray(reg.packages) ? reg.packages[0] : reg.packages;
        const paymentData = Array.isArray(reg.payments) ? reg.payments[0] : reg.payments;

        return NextResponse.json({
          reference: reg.reference,
          status: reg.status,
          memberCode: reg.member_code || clientData?.member_code || null,
          clientName: clientData?.full_name || 'Valued Member',
          clientPhone: clientData?.phone,
          clientEmail: clientData?.email,
          packageName: packageData?.name || 'Vyomi Membership',
          durationDays: packageData?.duration_days || 365,
          preferredSlot: reg.preferred_slot,
          startDate: reg.start_date,
          endDate: reg.end_date,
          totalPaise: Math.round((reg.total_amount_inr || 0) * 100),
          totalAmount: reg.total_amount_inr,
          paymentStatus: paymentData?.status || (reg.status === 'CONFIRMED' ? 'PAID' : 'PENDING'),
          paymentMethod: paymentData?.method || 'UPI',
        });
      }
    } catch (supErr) {
      console.warn('Supabase status lookup skipped:', supErr);
    }

    // 2. Fallback to in-memory db
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
      clientPhone: reg.client?.phone,
      clientEmail: reg.client?.email,
      packageName: reg.package?.name,
      durationDays: reg.package?.durationDays,
      startDate: reg.startDate,
      endDate: reg.endDate,
      totalPaise: reg.totalPaise,
      totalAmount: reg.totalPaise / 100,
      paymentStatus: reg.payment?.status,
      paymentMethod: reg.payment?.method || 'UPI',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to retrieve status';
    return NextResponse.json({ error: { code: 'SERVER_ERROR', message } }, { status: 500 });
  }
}
