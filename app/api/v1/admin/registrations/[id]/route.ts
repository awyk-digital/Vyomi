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
    const { data: row, error } = await supabaseAdmin
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
        created_at,
        notes,
        clients (
          id,
          full_name,
          phone,
          email,
          gender,
          member_code,
          created_at
        ),
        packages (
          id,
          name,
          duration_days,
          price_inr
        ),
        payments (
          id,
          method,
          status,
          transaction_ref,
          paid_at,
          amount_inr,
          created_at
        )
      `)
      .or(`reference.eq.${id},id.eq.${id}`)
      .maybeSingle();

    if (row && !error) {
      const clientData = Array.isArray(row.clients) ? row.clients[0] : row.clients;
      const packageData = Array.isArray(row.packages) ? row.packages[0] : row.packages;
      const paymentData = Array.isArray(row.payments) ? row.payments[0] : row.payments;

      const totalPaise = Math.round((row.total_amount_inr || 0) * 100);

      const mappedReg = {
        id: row.id,
        reference: row.reference,
        pricePaise: totalPaise,
        joiningFeePaise: 0,
        discountPaise: 0,
        gstPaise: Math.round(totalPaise * 0.18 / 1.18),
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
          fullName: clientData?.full_name || 'Member',
          phone: clientData?.phone || '',
          email: clientData?.email || '',
          dateOfBirth: '1995-01-01',
          gender: clientData?.gender || 'Prefer not to say',
          address: 'Patamata, Vijayawada',
          memberCode: row.member_code || clientData?.member_code,
          fitnessGoal: 'Luxury Wellness & Conditioning',
          medicalNotes: null,
          emergencyContactName: 'Self',
          emergencyContactPhone: clientData?.phone || '',
          guardianName: null,
        },
        package: {
          id: packageData?.id,
          name: packageData?.name || 'Vyomi Membership',
          durationDays: packageData?.duration_days || 365,
          pricePaise: totalPaise,
        },
        payment: {
          id: paymentData?.id || 'pay-rec',
          method: paymentData?.method || 'UPI',
          razorpayOrderId: null,
          razorpayPaymentId: paymentData?.transaction_ref || null,
          status: paymentData?.status || (row.status === 'CONFIRMED' ? 'PAID' : 'PENDING'),
          amountPaise: totalPaise,
          failureReason: null,
          refundedPaise: 0,
          paidAt: paymentData?.paid_at || null,
          createdAt: paymentData?.created_at || row.created_at,
        },
      };

      return NextResponse.json({ registration: mappedReg });
    }
  } catch (err) {
    console.warn('Supabase single lookup error, fallback to memory db:', err);
  }

  // 2. Fallback to memory db
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

  try {
    const body = await req.json();
    const {
      fullName,
      phone,
      email,
      gender,
      preferredSlot,
      notes,
      startDate,
      endDate,
      status,
    } = body;

    // 1. Try Supabase
    try {
      const { data: row } = await supabaseAdmin
        .from('registrations')
        .select('id, client_id')
        .or(`reference.eq.${id},id.eq.${id}`)
        .maybeSingle();

      if (row) {
        if (notes !== undefined || startDate || endDate || preferredSlot || status) {
          const updates: Record<string, any> = { updated_at: new Date().toISOString() };
          if (notes !== undefined) updates.notes = notes;
          if (startDate) updates.start_date = startDate;
          if (endDate) updates.end_date = endDate;
          if (preferredSlot) updates.preferred_slot = preferredSlot;
          if (status) updates.status = status;

          await supabaseAdmin.from('registrations').update(updates).eq('id', row.id);
        }

        if (row.client_id && (fullName || phone || email || gender)) {
          const clientUpdates: Record<string, any> = {};
          if (fullName) clientUpdates.full_name = fullName.trim();
          if (phone) clientUpdates.phone = phone.trim();
          if (email) clientUpdates.email = email.trim();
          if (gender) clientUpdates.gender = gender;

          await supabaseAdmin.from('clients').update(clientUpdates).eq('id', row.client_id);
        }

        return NextResponse.json({ success: true });
      }
    } catch (supErr) {
      console.warn('Supabase patch skipped:', supErr);
    }

    // 2. Fallback to db
    const reg = db.findRegistrationByRef(id);
    if (!reg) {
      return NextResponse.json({ error: { code: 'NOT_FOUND' } }, { status: 404 });
    }

    const client = db.findClientById(reg.clientId);
    if (client) {
      if (fullName) client.fullName = fullName.trim();
      if (phone) client.phone = phone.trim();
      if (email) client.email = email.trim();
      if (gender) client.gender = gender;
    }

    if (notes !== undefined) reg.notes = notes;
    if (startDate) reg.startDate = startDate;
    if (endDate) reg.endDate = endDate;
    if (preferredSlot) reg.preferredSlot = preferredSlot;
    if (status) reg.status = status;
    reg.updatedAt = new Date().toISOString();
    db.save();

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Update failed';
    return NextResponse.json({ error: { code: 'SERVER_ERROR', message } }, { status: 500 });
  }
}
