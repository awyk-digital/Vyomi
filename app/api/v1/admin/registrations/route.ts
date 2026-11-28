import { NextResponse } from 'next/server';
import { getAdminSession, MANAGEMENT_ROLES } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { db } from '@/lib/db';
import { signedPhotoUrls } from '@/lib/memberPhoto';

export async function GET(req: Request) {
  const session = await getAdminSession(MANAGEMENT_ROLES);
  if (!session) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || undefined;
  const status = searchParams.get('status') || undefined;
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);

  // 1. Fetch live from Supabase
  try {
    const selectCols = [
      'id',
      'reference',
      'status',
      'preferred_slot',
      'start_date',
      'end_date',
      'amount_inr',
      'notes',
      'created_at',
      'photo_path',
      'clients(id, full_name, phone, email, member_code, fitness_goal, photo_path)',
      'packages(name, duration_days)',
      'payments(id, method, status, amount_inr, utr_number, paid_at)'
    ].join(', ');

    let query = supabaseAdmin
      .from('registrations')
      .select(selectCols, { count: 'exact' });

    if (status && status !== 'ALL') {
      if (status === 'PENDING') {
        query = query.in('status', ['PENDING', 'PENDING_CASH_COLLECTION']);
      } else {
        query = query.eq('status', status);
      }
    }

    query = query.order('created_at', { ascending: false });

    // Searching: filter the whole list, then paginate. Otherwise paginate in the DB.
    const searching = !!(q && q.trim());
    const fromIdx = (page - 1) * pageSize;
    const toIdx = fromIdx + pageSize - 1;
    if (!searching) query = query.range(fromIdx, toIdx);

    const { data: supaRows, count, error } = await query;

    if (!error && supaRows) {
      let filtered = supaRows;
      if (q && q.trim()) {
        const queryTerm = q.trim().toLowerCase();
        filtered = supaRows.filter((row: any) => {
          const clientData = Array.isArray(row.clients) ? row.clients[0] : row.clients;
          return (
            row.reference.toLowerCase().includes(queryTerm) ||
            (clientData?.member_code && clientData.member_code.toLowerCase().includes(queryTerm)) ||
            (clientData?.full_name && clientData.full_name.toLowerCase().includes(queryTerm)) ||
            (clientData?.phone && clientData.phone.includes(queryTerm)) ||
            (clientData?.email && clientData.email.toLowerCase().includes(queryTerm))
          );
        });
      }

      const matchCount = searching ? filtered.length : count || filtered.length;
      if (searching) filtered = filtered.slice(fromIdx, toIdx + 1);

      const items = filtered.map((row: any) => {
        const clientData = Array.isArray(row.clients) ? row.clients[0] : row.clients;
        const packageData = Array.isArray(row.packages) ? row.packages[0] : row.packages;
        const paymentList = Array.isArray(row.payments) ? row.payments : row.payments ? [row.payments] : [];
        const paymentData = paymentList[0];
        const fitnessGoal = clientData?.fitness_goal || (row.notes?.startsWith('Goal:') ? row.notes.replace('Goal:', '').trim() : 'General Wellness');

        const amountNum = Number(row.amount_inr || 0);
        const rawMethod = paymentData?.method || (row.status === 'PENDING_CASH_COLLECTION' ? 'CASH' : 'UPI');

        return {
          id: row.id,
          reference: row.reference,
          pricePaise: Math.round(amountNum * 100),
          totalPaise: Math.round(amountNum * 100),
          status: row.status,
          startDate: row.start_date,
          endDate: row.end_date,
          createdAt: row.created_at,
          client: {
            fullName: clientData?.full_name || 'Valued Member',
            phone: clientData?.phone || '',
            email: clientData?.email || '',
            memberCode: clientData?.member_code || null,
            fitnessGoal,
          },
          package: {
            name: packageData?.name || row.package_name || 'VIP Membership',
            durationDays: packageData?.duration_days || 365,
          },
          payment: {
            method: rawMethod,
            status: paymentData?.status || (row.status === 'CONFIRMED' ? 'PAID' : 'PENDING_COLLECTION'),
            razorpayPaymentId: paymentData?.utr_number || null,
          },
        };
      });

      const urls = await signedPhotoUrls(
        filtered.map((row: any) => row.photo_path || (Array.isArray(row.clients) ? row.clients[0] : row.clients)?.photo_path)
      );
      for (let i = 0; i < items.length; i++) {
        const row: any = filtered[i];
        const c: any = Array.isArray(row.clients) ? row.clients[0] : row.clients;
        const path = row.photo_path || c?.photo_path;
        (items[i] as any).photoUrl = path ? urls[path] || null : null;
      }

      return NextResponse.json({
        items,
        total: matchCount,
        page,
        pageSize,
        totalPages: Math.max(1, Math.ceil(matchCount / pageSize)),
      });
    }
  } catch (err) {
    console.warn('Admin Supabase fetch fell back to db:', err);
  }

  // 2. Fallback to in-memory db
  const result = db.queryRegistrations({ q, status, page, pageSize });
  return NextResponse.json(result);
}
