import { NextResponse } from 'next/server';
import { getAdminSession, MANAGEMENT_ROLES } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { logActivity } from '@/lib/activity';

export async function GET(req: Request) {
  const session = await getAdminSession(MANAGEMENT_ROLES);
  if (!session) {
    return NextResponse.json({ error: { code: 'FORBIDDEN' } }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim().toLowerCase();
  const status = searchParams.get('status') || '';

  let query = supabaseAdmin
    .from('registrations')
    .select(
      'reference, status, amount_inr, preferred_slot, start_date, end_date, created_at, notes, ' +
        'clients(full_name, phone, email, member_code), packages(name), payments(method, status, paid_at, utr_number)'
    )
    .order('created_at', { ascending: false })
    .limit(5000);
  if (status === 'PENDING') query = query.in('status', ['PENDING', 'PENDING_CASH_COLLECTION']);
  else if (status && status !== 'ALL') query = query.eq('status', status);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: { code: 'DB_ERROR', message: error.message } }, { status: 500 });
  }

  const one = <T,>(v: T | T[] | null | undefined): T | undefined => (Array.isArray(v) ? v[0] : v ?? undefined);
  type Row = {
    reference: string; status: string; amount_inr: number | string; preferred_slot: string | null;
    start_date: string | null; end_date: string | null; created_at: string; notes: string | null;
    clients: unknown; packages: unknown; payments: unknown;
  };
  let rows = ((data || []) as unknown as Row[]).map((r) => {
    const c = one(r.clients as { full_name?: string; phone?: string; email?: string; member_code?: string });
    const p = one(r.packages as { name?: string });
    const pay = one(r.payments as { method?: string; status?: string; paid_at?: string; utr_number?: string });
    return { r, c, p, pay };
  });
  if (q) {
    rows = rows.filter(({ r, c }) =>
      [r.reference, c?.full_name, c?.phone, c?.email, c?.member_code].some((v) => (v || '').toLowerCase().includes(q))
    );
  }

  const esc = (val: unknown) => `"${String(val ?? '').replace(/"/g, '""')}"`;
  const header = ['Reference', 'Member ID', 'Name', 'Phone', 'Email', 'Plan', 'Amount (INR)', 'Status', 'Payment', 'Payment status', 'Paid on', 'UTR', 'Start date', 'End date', 'Registered on', 'Notes'];
  const lines = rows.map(({ r, c, p, pay }) =>
    [
      r.reference, c?.member_code, c?.full_name, c?.phone, c?.email, p?.name,
      Number(r.amount_inr || 0).toFixed(2), r.status, pay?.method, pay?.status, pay?.paid_at?.slice(0, 10),
      pay?.utr_number, r.start_date, r.end_date, r.created_at?.slice(0, 10), r.notes,
    ].map(esc).join(',')
  );
  const csv = '﻿' + [header.map(esc).join(','), ...lines].join('\r\n');

  await logActivity({
    adminId: session.id,
    adminName: session.name,
    adminRole: session.role,
    action: 'EXPORTED_CSV',
    entityType: 'REGISTRATION',
    entityId: 'export',
    details: { count: rows.length, status: status || 'ALL' },
  });

  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="vyomi-members-${stamp}.csv"`,
    },
  });
}
