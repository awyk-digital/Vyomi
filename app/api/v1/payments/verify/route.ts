import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { db } from '@/lib/db';
import { verifyPaymentSignature } from '@/lib/razorpay';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { registrationRef, razorpay_payment_id, razorpay_signature, method, utrNumber } = body;

    if (!registrationRef) {
      return NextResponse.json(
        { error: { code: 'MISSING_REF', message: 'Registration reference is required' } },
        { status: 400 }
      );
    }

    // 1. Try Supabase verification & update
    let supReg: any = null;
    try {
      const { data } = await supabaseAdmin
        .from('registrations')
        .select(`
          id,
          reference,
          status,
          member_code,
          start_date,
          end_date,
          total_amount_inr,
          clients (
            id,
            full_name,
            phone,
            email,
            member_code
          ),
          packages (
            name,
            duration_days
          )
        `)
        .eq('reference', registrationRef)
        .maybeSingle();

      supReg = data;
    } catch {}

    if (supReg) {
      const clientData = Array.isArray(supReg.clients) ? supReg.clients[0] : supReg.clients;
      const packageData = Array.isArray(supReg.packages) ? supReg.packages[0] : supReg.packages;

      // Update Supabase records
      const isOfflineCash = method === 'CASH';
      const newStatus = isOfflineCash ? 'PENDING_CASH_COLLECTION' : 'CONFIRMED';
      const payStatus = isOfflineCash ? 'PENDING_COLLECTION' : 'PAID';

      await supabaseAdmin
        .from('registrations')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', supReg.id);

      await supabaseAdmin
        .from('payments')
        .update({
          status: payStatus,
          method: method || 'UPI',
          transaction_ref: utrNumber || razorpay_payment_id || `UPI-${Date.now()}`,
          paid_at: isOfflineCash ? null : new Date().toISOString(),
        })
        .eq('registration_id', supReg.id);

      // Also ensure memory db is synced if present
      const memReg = db.findRegistrationByRef(registrationRef);
      if (memReg) {
        db.confirmPaymentAndRegistration({
          registrationRef,
          paymentId: utrNumber || razorpay_payment_id || `sim_${Date.now()}`,
          signature: razorpay_signature || 'sig_verified_mock',
          method: method || 'UPI',
        });
      }

      return NextResponse.json({
        status: newStatus,
        reference: supReg.reference,
        memberCode: supReg.member_code || clientData?.member_code,
        clientName: clientData?.full_name,
        packageName: packageData?.name,
        startDate: supReg.start_date,
        endDate: supReg.end_date,
        totalAmount: supReg.total_amount_inr,
      });
    }

    // 2. Fallback to in-memory db
    const reg = db.findRegistrationByRef(registrationRef);
    if (!reg) {
      return NextResponse.json(
        { error: { code: 'REGISTRATION_NOT_FOUND', message: 'Registration record not found' } },
        { status: 404 }
      );
    }

    // Already confirmed? Return success idempotently
    if (reg.status === 'CONFIRMED' && reg.client?.memberCode) {
      return NextResponse.json({
        status: 'CONFIRMED',
        reference: reg.reference,
        memberCode: reg.client.memberCode,
        clientName: reg.client.fullName,
        packageName: reg.package?.name,
        startDate: reg.startDate,
        endDate: reg.endDate,
      });
    }

    // Support Razorpay Sandbox Simulation Test Cases
    if (body.simulateFailure || razorpay_signature === 'sig_simulate_failure') {
      const reason = body.failureReason || 'Card declined by issuing bank (Simulated Razorpay Failure)';
      db.markRegistrationFailed(reg.reference, reason);
      return NextResponse.json(
        { status: 'FAILED', reference: reg.reference, failureReason: reason },
        { status: 402 }
      );
    }

    if (body.simulatePending) {
      return NextResponse.json(
        { status: 'PENDING', reference: reg.reference, message: 'Simulated pending payment gateway delay' },
        { status: 202 }
      );
    }

    // Offline / cash / test bypass
    const isOffline = method === 'CASH' || method === 'POS' || method === 'BANK_TRANSFER' || method === 'UPI';
    const isMockPayment = !razorpay_signature || razorpay_signature.startsWith('sig_mock_') || razorpay_signature.startsWith('sig_test_');

    if (!isOffline && !isMockPayment) {
      const orderId = reg.payment?.razorpayOrderId;
      if (orderId) {
        const isValid = verifyPaymentSignature({
          orderId,
          paymentId: razorpay_payment_id,
          signature: razorpay_signature,
        });

        if (!isValid) {
          db.markRegistrationFailed(reg.reference, 'HMAC signature verification failed');
          return NextResponse.json(
            { error: { code: 'BAD_SIGNATURE', message: 'Payment signature could not be verified.' } },
            { status: 400 }
          );
        }
      }
    }

    // Confirm registration & assign Member Code
    const { registration, client, memberCode } = db.confirmPaymentAndRegistration({
      registrationRef: reg.reference,
      paymentId: utrNumber || razorpay_payment_id || `sim_${Date.now()}`,
      signature: razorpay_signature || 'sig_verified_mock',
      method: method || 'UPI',
    });

    return NextResponse.json({
      status: 'CONFIRMED',
      reference: registration.reference,
      memberCode,
      clientName: client.fullName,
      packageName: reg.package?.name,
      startDate: registration.startDate,
      endDate: registration.endDate,
      totalAmount: registration.totalPaise / 100,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Payment verification failed';
    return NextResponse.json({ error: { code: 'SERVER_ERROR', message } }, { status: 500 });
  }
}
