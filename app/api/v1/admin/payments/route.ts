import { NextResponse } from 'next/server';
import { getAdminSession, MANAGEMENT_ROLES } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { db } from '@/lib/db';

export async function GET() {
  const session = await getAdminSession(MANAGEMENT_ROLES);
  if (!session) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }

  // 1. Try Supabase
  try {
    const { data: supaPayments, error } = await supabaseAdmin
      .from('payments')
      .select(`
        id,
        registration_id,
        method,
        amount_inr,
        status,
        utr_number,
        paid_at,
        created_at,
        registrations (
          id,
          reference,
          amount_inr,
          status,
          package_name,
          clients (
            id,
            full_name,
            phone,
            member_code
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (!error && supaPayments) {
      const payments = supaPayments.map((p: any) => {
        const reg = Array.isArray(p.registrations) ? p.registrations[0] : p.registrations;
        const client = reg ? (Array.isArray(reg.clients) ? reg.clients[0] : reg.clients) : null;
        const amountPaise = Math.round(Number(p.amount_inr || reg?.amount_inr || 0) * 100);

        return {
          id: p.id,
          registrationId: p.registration_id,
          method: p.method || (reg?.status === 'PENDING_CASH_COLLECTION' ? 'CASH' : 'UPI'),
          amountPaise,
          currency: 'INR',
          status: p.status,
          failureReason: null,
          paidAt: p.paid_at,
          createdAt: p.created_at,
          registration: reg ? {
            reference: reg.reference,
            totalPaise: amountPaise,
            status: reg.status,
          } : undefined,
          client: client ? {
            fullName: client.full_name || 'Valued Member',
            phone: client.phone || '',
            memberCode: client.member_code || null,
          } : undefined,
          package: reg?.package_name ? {
            name: reg.package_name,
          } : undefined,
        };
      });

      return NextResponse.json({ payments });
    }
  } catch (err) {
    console.warn('Supabase payments query fell back to local DB:', err);
  }

  // 2. Fallback to local DB
  const payments = db.getPaymentsList();
  return NextResponse.json({ payments });
}
