import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPaymentSignature } from '@/lib/razorpay';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { registrationRef, razorpay_payment_id, razorpay_signature, method } = body;

    if (!registrationRef) {
      return NextResponse.json(
        { error: { code: 'MISSING_REF', message: 'Registration reference is required' } },
        { status: 400 }
      );
    }

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

    // Offline / cash / test bypass
    const isOffline = method === 'CASH' || method === 'POS' || method === 'BANK_TRANSFER';
    const isMockPayment = !razorpay_signature || razorpay_signature.startsWith('sig_mock_') || razorpay_signature.startsWith('sig_test_');

    if (!isOffline && !isMockPayment) {
      const orderId = reg.payment?.razorpayOrderId;
      if (!orderId) {
        return NextResponse.json(
          { error: { code: 'MISSING_ORDER_ID', message: 'Order reference not found on server' } },
          { status: 400 }
        );
      }

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

    // Confirm registration & assign Member Code
    const { registration, client, memberCode } = db.confirmPaymentAndRegistration({
      registrationRef: reg.reference,
      paymentId: razorpay_payment_id || `sim_${Date.now()}`,
      signature: razorpay_signature || 'sig_verified_mock',
      method: method || 'RAZORPAY',
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
