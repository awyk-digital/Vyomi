import { NextResponse } from 'next/server';
import { getAdminSession, MANAGEMENT_ROLES } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { db } from '@/lib/db';

export async function GET() {
  const session = await getAdminSession(MANAGEMENT_ROLES);
  if (!session) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }

  // 1. Try Supabase live telemetry
  try {
    const { data: supaRegs, error } = await supabaseAdmin
      .from('registrations')
      .select(`
        id,
        reference,
        status,
        amount_inr,
        preferred_slot,
        start_date,
        end_date,
        created_at,
        clients (
          id,
          full_name,
          phone,
          member_code
        ),
        packages (
          name,
          duration_days
        ),
        payments (
          method,
          status,
          amount_inr,
          paid_at
        )
      `)
      .order('created_at', { ascending: false });

    if (!error && supaRegs) {
      const now = new Date();
      const todayStr = now.toISOString().slice(0, 10);
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const confirmedRegs = supaRegs.filter((r) => r.status === 'CONFIRMED');
      const newToday = confirmedRegs.filter((r) => r.created_at.startsWith(todayStr)).length;
      const newMonth = confirmedRegs.filter((r) => r.created_at >= startOfMonth).length;

      // Payments revenue
      let revenueTodayPaise = 0;
      let revenueMonthPaise = 0;

      supaRegs.forEach((r) => {
        const paymentList = Array.isArray(r.payments) ? r.payments : r.payments ? [r.payments] : [];
        paymentList.forEach((p: any) => {
          if (p.status === 'PAID') {
            const paidDate = p.paid_at || r.created_at;
            const amtPaise = Math.round(Number(p.amount_inr || r.amount_inr || 0) * 100);
            if (paidDate.startsWith(todayStr)) revenueTodayPaise += amtPaise;
            if (paidDate >= startOfMonth) revenueMonthPaise += amtPaise;
          }
        });
      });

      const activeMembers = confirmedRegs.filter((r) => {
        if (!r.end_date) return false;
        return new Date(r.end_date) >= now;
      }).length;

      const pendingCount = supaRegs.filter((r) =>
        r.status === 'PENDING' || r.status === 'PENDING_CASH_COLLECTION'
      ).length;

      const in7Days = new Date(now);
      in7Days.setDate(in7Days.getDate() + 7);
      const expiringSoon = confirmedRegs.filter((r) => {
        if (!r.end_date) return false;
        const d = new Date(r.end_date);
        return d >= now && d <= in7Days;
      }).length;

      const recent = supaRegs.slice(0, 8).map((r) => {
        const client = Array.isArray(r.clients) ? r.clients[0] : r.clients;
        const pkg = Array.isArray(r.packages) ? r.packages[0] : r.packages;
        const paymentList = Array.isArray(r.payments) ? r.payments : r.payments ? [r.payments] : [];
        const payment = paymentList[0];
        const amountPaise = Math.round(Number(r.amount_inr || 0) * 100);

        return {
          id: r.id,
          reference: r.reference,
          totalPaise: amountPaise,
          status: r.status,
          createdAt: r.created_at,
          preferredSlot: r.preferred_slot,
          client: client ? {
            fullName: client.full_name,
            phone: client.phone,
            memberCode: client.member_code,
          } : undefined,
          package: pkg ? {
            name: pkg.name,
            durationDays: pkg.duration_days,
          } : undefined,
          payment: {
            method: payment?.method || (r.status === 'PENDING_CASH_COLLECTION' ? 'CASH' : 'UPI'),
            status: payment?.status || (r.status === 'CONFIRMED' ? 'PAID' : 'PENDING_COLLECTION'),
          },
        };
      });

      return NextResponse.json({
        stats: {
          newToday,
          newMonth,
          revenueTodayPaise,
          revenueMonthPaise,
          activeMembers,
          pendingCount,
          expiringSoon,
          recent,
        },
      });
    }
  } catch (err) {
    console.warn('Supabase dashboard stats fell back to local DB:', err);
  }

  // 2. Fallback to local DB
  const stats = db.getDashboardStats();
  return NextResponse.json({ stats });
}
