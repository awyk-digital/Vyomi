import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || undefined;
  const status = searchParams.get('status') || undefined;
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);

  // 1. Try Supabase first
  try {
    let query = supabaseAdmin
      .from('registrations')
      .select(`
        id,
        reference,
        status,
        member_code,
        preferred_slot,
        start_date,
        end_date,
        total_amount_inr,
        notes,
        created_at,
        clients (
          id,
          full_name,
          phone,
          email,
          member_code,
          fitness_goal
        ),
        packages (
          name,
          duration_days
        ),
        payments (
          method,
          status,
          transaction_ref,
          paid_at
        )
      `, { count: 'exact' });

    if (status && status !== 'ALL') {
      query = query.eq('status', status);
    }

    query = query.order('created_at', { ascending: false });

    const fromIdx = (page - 1) * pageSize;
    const toIdx = fromIdx + pageSize - 1;
    query = query.range(fromIdx, toIdx);

    const { data: supaRows, count, error } = await query;

    if (!error && supaRows && supaRows.length > 0) {
      let filtered = supaRows;
      if (q && q.trim()) {
        const queryTerm = q.trim().toLowerCase();
        filtered = supaRows.filter((row) => {
          const clientData = Array.isArray(row.clients) ? row.clients[0] : row.clients;
          return (
            row.reference.toLowerCase().includes(queryTerm) ||
            (row.member_code && row.member_code.toLowerCase().includes(queryTerm)) ||
            (clientData?.full_name && clientData.full_name.toLowerCase().includes(queryTerm)) ||
            (clientData?.phone && clientData.phone.includes(queryTerm)) ||
            (clientData?.email && clientData.email.toLowerCase().includes(queryTerm))
          );
        });
      }

      const items = filtered.map((row) => {
        const clientData = Array.isArray(row.clients) ? row.clients[0] : row.clients;
        const packageData = Array.isArray(row.packages) ? row.packages[0] : row.packages;
        const paymentData = Array.isArray(row.payments) ? row.payments[0] : row.payments;
        const fitnessGoal = clientData?.fitness_goal || ((row as any).notes?.startsWith('Goal:') ? (row as any).notes.replace('Goal:', '').trim() : 'General Fitness');

        return {
          id: row.id,
          reference: row.reference,
          pricePaise: Math.round((row.total_amount_inr || 0) * 100),
          totalPaise: Math.round((row.total_amount_inr || 0) * 100),
          status: row.status,
          startDate: row.start_date,
          endDate: row.end_date,
          createdAt: row.created_at,
          client: {
            fullName: clientData?.full_name || 'Member',
            phone: clientData?.phone || '',
            email: clientData?.email || '',
            memberCode: row.member_code || clientData?.member_code || null,
            fitnessGoal,
          },
          package: {
            name: packageData?.name || 'Vyomi Membership',
            durationDays: packageData?.duration_days || 365,
          },
          payment: {
            method: paymentData?.method || 'UPI',
            status: paymentData?.status || (row.status === 'CONFIRMED' ? 'PAID' : 'PENDING'),
            razorpayPaymentId: paymentData?.transaction_ref || null,
          },
        };
      });

      return NextResponse.json({
        items,
        total: count || items.length,
        page,
        pageSize,
        totalPages: Math.ceil((count || items.length) / pageSize),
      });
    }
  } catch (err) {
    console.warn('Admin Supabase fetch fell back to db:', err);
  }

  // 2. Fallback to in-memory db
  const result = db.queryRegistrations({ q, status, page, pageSize });
  return NextResponse.json(result);
}
