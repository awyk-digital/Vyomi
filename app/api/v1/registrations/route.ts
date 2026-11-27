import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { logActivity } from '@/lib/activity';
import { supabaseAdmin } from '@/lib/supabase';
import { db } from '@/lib/db';
import { sendMembershipReceiptEmail } from '@/lib/email';
import { generatePdfReceipt, receiptNumberFor } from '@/lib/pdfReceipt';
import { RECEIPT_LOGO_JPEG } from '@/lib/receiptLogo';

export async function POST(req: Request) {
  const staff = await getAdminSession();
  if (!staff) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Front desk sign-in required.' } },
      { status: 401 }
    );
  }
  try {
    const body = await req.json();
    const {
      packageId,
      fullName: rawFullName,
      phone: rawPhone,
      email: rawEmail,
      preferredSlot,
      startDate: rawStartDate,
      gender = 'Prefer not to say',
      fitnessGoal: rawFitnessGoal,
      paymentMethod = 'UPI',
      utrNumber: rawUtr,
      acceptedTerms,
      // Backwards-compatibility with previous nested client format if passed
      client,
    } = body;

    const sanitize = (str: string) => (str || '').replace(/<[^>]*>?/gm, '').trim();

    const fullName = sanitize(rawFullName || client?.fullName || '');
    const phone = sanitize(rawPhone || client?.phone || '').replace(/\D/g, '');
    const email = sanitize(rawEmail || client?.email || '').toLowerCase();
    const slot = sanitize(preferredSlot || client?.preferredSlot || '06:00 – 09:00 AM (Morning Prime)');
    const fitnessGoal = sanitize(rawFitnessGoal || body.fitnessGoal || client?.fitnessGoal || 'Weight Loss & Fat Reduction');
    const startDate = sanitize(rawStartDate || client?.startDate || new Date().toISOString().split('T')[0]);
    const utr = sanitize(rawUtr || body.utrNumber || body.transactionRef || '');

    // 1. Validation
    if (!acceptedTerms) {
      return NextResponse.json(
        { error: { code: 'TERMS_REQUIRED', message: 'Please accept the membership terms and conditions.' } },
        { status: 400 }
      );
    }

    if (!fullName || fullName.length < 3 || fullName.split(/\s+/).length < 2) {
      return NextResponse.json(
        { error: { code: 'INVALID_NAME', message: 'Full legal name requires both first and last name (e.g. Rajesh Kumar).' } },
        { status: 400 }
      );
    }

    if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
      return NextResponse.json(
        { error: { code: 'INVALID_PHONE', message: 'Please provide a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.' } },
        { status: 400 }
      );
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: { code: 'INVALID_EMAIL', message: 'Please provide a valid, active email address.' } },
        { status: 400 }
      );
    }

    // 2. Fetch package from Supabase (or fallback)
    let pkg: { id: string; name: string; slug: string; price_inr: number; duration_days: number } | null = null;

    try {
      const { data: supPkg } = await supabaseAdmin
        .from('packages')
        .select('*')
        .eq('id', packageId || 'pkg-vip-1y')
        .single();

      if (supPkg) {
        pkg = {
          id: supPkg.id,
          name: supPkg.name,
          slug: supPkg.slug,
          price_inr: Number(supPkg.price_inr),
          duration_days: supPkg.duration_days,
        };
      }
    } catch { }

    if (!pkg) {
      // Fallback
      pkg = {
        id: packageId || 'pkg-vip-1y',
        name: packageId === 'pkg-founding-1y' ? 'Founding Membership' : packageId === 'pkg-vvip-1y' ? 'VVIP Membership' : 'VIP Membership',
        slug: packageId === 'pkg-founding-1y' ? 'founding' : packageId === 'pkg-vvip-1y' ? 'vvip' : 'vip',
        price_inr: packageId === 'pkg-founding-1y' ? 25000 : packageId === 'pkg-vvip-1y' ? 60000 : 50000,
        duration_days: 365,
      };
    }

    // 2b. Price: the plan price, or a custom amount the front desk typed
    //     (family / special discount). Staff-only route, so this is trusted
    //     to signed-in staff and recorded in notes + the activity log.
    const planPriceInr = pkg.price_inr;
    let amountInr = planPriceInr;
    const rawCustom = body.customAmountInr;
    if (rawCustom !== undefined && rawCustom !== null && rawCustom !== '') {
      const c = Math.round(Number(rawCustom));
      if (!Number.isFinite(c) || c < 1 || c > 1000000) {
        return NextResponse.json(
          { error: { code: 'INVALID_AMOUNT', message: 'Custom amount must be between ₹1 and ₹10,00,000.' } },
          { status: 400 }
        );
      }
      amountInr = c;
    }
    const priceNote =
      amountInr !== planPriceInr
        ? `Custom price ₹${amountInr.toLocaleString('en-IN')} (plan ₹${planPriceInr.toLocaleString('en-IN')}) set by ${staff.name}`
        : '';

    // 3. Generate Codes
    const randomSeq = Math.floor(100000 + Math.random() * 900000);
    const memberCode = `VYO-2026-${randomSeq}`;
    const refSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const reference = `REG-${new Date().toISOString().replace(/\D/g, '').slice(0, 8)}-${refSuffix}`;
    const receiptNumber = receiptNumberFor(reference);

    // End Date (365 days from startDate)
    const startObj = new Date(startDate);
    const endObj = new Date(startObj);
    endObj.setDate(endObj.getDate() + (pkg.duration_days || 365));
    const endDate = endObj.toISOString().split('T')[0];

    const isCash = paymentMethod.toUpperCase() === 'CASH';
    const regStatus = isCash ? 'PENDING_CASH_COLLECTION' : 'CONFIRMED';
    const payStatus = isCash ? 'PENDING_COLLECTION' : 'PAID';

    // 4. Upsert Client in Supabase
    let clientId: string | null = null;

    try {
      const { data: clientData, error: clientErr } = await supabaseAdmin
        .from('clients')
        .upsert(
          {
            full_name: fullName,
            phone,
            email,
            gender,
            fitness_goal: fitnessGoal,
            member_code: memberCode,
            is_phone_verified: true,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'phone' }
        )
        .select('id')
        .single();

      if (clientData) {
        clientId = clientData.id;
      }
      if (clientErr) {
        console.warn('Supabase client upsert notice:', clientErr);
      }
    } catch (e) {
      console.warn('Supabase client error:', e);
    }

    // 5. Insert Registration in Supabase
    let registrationId: string | null = null;

    if (clientId) {
      try {
        const { data: regData } = await supabaseAdmin
          .from('registrations')
          .insert({
            reference,
            client_id: clientId,
            package_id: pkg.id,
            package_name: pkg.name,
            amount_inr: amountInr,
            status: regStatus,
            preferred_slot: slot,
            start_date: startDate,
            end_date: endDate,
            notes: priceNote || null,
          })
          .select('id')
          .single();

        if (regData) {
          registrationId = regData.id;
        }
      } catch (e) {
        console.warn('Supabase registration insert error:', e);
      }
    }

    // 6. Insert Payment in Supabase
    if (registrationId) {
      try {
        await supabaseAdmin.from('payments').insert({
          registration_id: registrationId,
          method: isCash ? 'CASH' : 'UPI_QR',
          amount_inr: amountInr,
          status: payStatus,
          utr_number: utr || null,
          upi_handle: isCash ? null : '9666636563@axisbank',
          notes: isCash ? 'Payment pending cash collection at reception' : 'Direct UPI QR settlement',
          paid_at: isCash ? null : new Date().toISOString(),
        });
      } catch (e) {
        console.warn('Supabase payment insert error:', e);
      }

      // 7. Insert Receipt Record in Supabase
      try {
        await supabaseAdmin.from('receipts').insert({
          registration_reference: reference,
          client_email: email,
          receipt_number: receiptNumber,
          payload: {
            reference,
            memberCode,
            clientName: fullName,
            packageName: pkg.name,
            amountInr: amountInr,
            timeSlot: slot,
            fitnessGoal,
            startDate,
            endDate,
            paymentMethod: isCash ? 'CASH' : 'UPI',
            paymentStatus: payStatus,
            utrNumber: utr,
          },
          is_emailed: false,
        });

        // Asynchronously dispatch PDF receipt via Resend
        try {
          const pdfDoc = generatePdfReceipt({
            logoDataUrl: RECEIPT_LOGO_JPEG,
            planPriceInr: planPriceInr,
            receiptNumber,
            reference,
            memberCode,
            clientName: fullName,
            phone,
            email,
            packageName: pkg.name,
            durationDays: pkg.duration_days,
            timeSlot: slot,
            fitnessGoal,
            startDate,
            endDate,
            amountInr: amountInr,
            paymentMethod: isCash ? 'CASH' : 'UPI',
            paymentStatus: regStatus === 'CONFIRMED' ? 'PAID' : 'PENDING_CASH_COLLECTION',
            utrNumber: utr || undefined,
            paymentDate: startDate,
          });
          const pdfBase64 = Buffer.from(pdfDoc.output('arraybuffer')).toString('base64');

          sendMembershipReceiptEmail({
            toEmail: email,
            planPriceInr,
            clientName: fullName,
            memberCode,
            receiptNumber,
            reference,
            packageName: pkg.name,
            amountInr: amountInr,
            timeSlot: slot,
            fitnessGoal,
            startDate,
            endDate,
            paymentMethod: isCash ? 'CASH' : 'UPI',
            paymentStatus: regStatus === 'CONFIRMED' ? 'PAID' : 'PENDING_CASH_COLLECTION',
            utrNumber: utr || undefined,
            pdfBase64,
          }).then((res) => {
            if (res.sent) {
              supabaseAdmin
                .from('receipts')
                .update({ is_emailed: true, emailed_at: new Date().toISOString() })
                .eq('receipt_number', receiptNumber)
                .then();
            }
          }).catch(console.warn);
        } catch (pdfErr) {
          console.warn('PDF email generation notice:', pdfErr);
        }
      } catch (e) {
        console.warn('Supabase receipt insert error:', e);
      }
    }

    // 8. Mirror to Local Database so existing Admin Dashboards work concurrently
    try {
      const clientData = {
        fullName,
        phone,
        email,
        dateOfBirth: startDate,
        gender,
        address: 'Vijayawada',
        photoUrl: null,
        idProofType: null,
        idProofNumber: null,
        fitnessGoal,
        medicalNotes: null,
        emergencyContactName: 'Self',
        emergencyContactPhone: phone,
        guardianName: null,
      };

      const localClient = db.createOrUpdateClient(clientData);
      db.assignMemberCode(localClient.id);

      db.createRegistration({
        clientData,
        packageId: pkg.id,
        startDate,
        preferredSlot: slot,
        acceptedIp: '127.0.0.1',
        reference,
        paid: !isCash,
        method: isCash ? 'CASH' : 'BANK_TRANSFER',
      });
    } catch (e) {
      console.warn('Local registration mirror failed:', e);
    }

    await logActivity({
      adminId: staff.id,
      adminName: staff.name,
      adminRole: staff.role,
      action: 'MEMBER_REGISTERED',
      entityType: 'REGISTRATION',
      entityId: reference,
      details: { member: fullName, plan: pkg.name, amountInr, planPriceInr, payment: isCash ? 'CASH' : 'UPI' },
    });

    return NextResponse.json({
      success: true,
      reference,
      memberCode,
      status: regStatus,
      receiptNumber,
      client: {
        fullName,
        phone,
        email,
        memberCode,
        fitnessGoal,
      },
      package: {
        id: pkg.id,
        name: pkg.name,
        priceInr: planPriceInr,
        durationDays: pkg.duration_days,
      },
      preferredSlot: slot,
      fitnessGoal,
      startDate,
      endDate,
      paymentMethod: isCash ? 'CASH' : 'UPI',
      amountInr: amountInr,
      utrNumber: utr || null,
      message: isCash
        ? 'Membership registered! Please complete cash payment at the front desk.'
        : 'Payment received! Membership successfully activated.',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Registration creation failed';
    return NextResponse.json({ error: { code: 'SERVER_ERROR', message } }, { status: 500 });
  }
}
