import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
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

  // 1. Try Supabase
  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

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
      'clients(id, full_name, phone, email, gender, member_code, fitness_goal, created_at)',
      'packages(id, name, duration_days, price_inr)',
      'payments(id, method, status, utr_number, paid_at, amount_inr, created_at)'
    ].join(', ');

    let query = supabaseAdmin
      .from('registrations')
      .select(selectCols);

    if (isUuid) {
      query = query.eq('id', id);
    } else {
      query = query.eq('reference', id);
    }

    const { data: rawRow, error } = await query.maybeSingle();

    if (rawRow && !error) {
      const row = rawRow as any;
      const clientData = Array.isArray(row.clients) ? row.clients[0] : row.clients;
      const packageData = Array.isArray(row.packages) ? row.packages[0] : row.packages;
      const paymentList = Array.isArray(row.payments) ? row.payments : row.payments ? [row.payments] : [];
      const paymentData = paymentList[0];

      const amountInr = Number(row.amount_inr || 0);
      const totalPaise = Math.round(amountInr * 100);
      const rawMethod = paymentData?.method || (row.status === 'PENDING_CASH_COLLECTION' ? 'CASH' : 'UPI');

      const mappedReg = {
        id: row.id,
        reference: row.reference,
        pricePaise: totalPaise,
        joiningFeePaise: 0,
        discountPaise: 0,
        gstPaise: Math.round((totalPaise * 0.18) / 1.18),
        totalPaise,
        status: row.status,
        startDate: row.start_date,
        endDate: row.end_date,
        preferredSlot: row.preferred_slot,
        referralSource: 'Direct Intake',
        acceptedTermsAt: row.created_at,
        acceptedIp: '127.0.0.1',
        notes: row.notes,
        createdAt: row.created_at,
        client: {
          id: clientData?.id,
          fullName: clientData?.full_name || 'Valued Member',
          phone: clientData?.phone || '',
          email: clientData?.email || '',
          dateOfBirth: row.start_date || '1995-01-01',
          gender: clientData?.gender || 'Prefer not to say',
          address: 'Patamata, Vijayawada',
          memberCode: clientData?.member_code,
          fitnessGoal: clientData?.fitness_goal || 'Luxury Wellness & Conditioning',
          medicalNotes: null,
          emergencyContactName: 'Self',
          emergencyContactPhone: clientData?.phone || '',
          guardianName: null,
        },
        package: {
          id: packageData?.id || 'pkg-vip-1y',
          name: packageData?.name || 'VIP Membership',
          durationDays: packageData?.duration_days || 365,
          pricePaise: totalPaise,
          joiningFeePaise: 0,
          isActive: true,
        },
        payment: {
          id: paymentData?.id || `pay-${row.id.slice(0, 8)}`,
          registrationId: row.id,
          method: rawMethod,
          amountPaise: totalPaise,
          currency: 'INR',
          status: paymentData?.status || (row.status === 'CONFIRMED' ? 'PAID' : 'PENDING_COLLECTION'),
          paidAt: paymentData?.paid_at || (row.status === 'CONFIRMED' ? row.created_at : null),
          createdAt: paymentData?.created_at || row.created_at,
        },
      };

      return NextResponse.json({ registration: mappedReg });
    }
  } catch (err) {
    console.warn('Supabase fetch failed, falling back to local DB:', err);
  }

  // Fallback to local DB
  const reg = db.findRegistrationByRef(id);
  if (!reg) {
    return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Registration record not found' } }, { status: 404 });
  }

  return NextResponse.json({ registration: reg });
}
