import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyWebhookSignature } from '@/lib/razorpay';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (signature) {
      const ok = verifyWebhookSignature(rawBody, signature);
      if (!ok) {
        return NextResponse.json(
          { error: { code: 'INVALID_SIGNATURE', message: 'Webhook signature verification failed' } },
          { status: 400 }
        );
      }
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    // Handle payment.captured
    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = payload.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id;
      const paymentId = paymentEntity?.id;
      const notes = paymentEntity?.notes || {};

      if (notes.registrationId) {
        const reg = db.findRegistrationByRef(notes.registrationId);
        if (reg && reg.status !== 'CONFIRMED') {
          db.confirmPaymentAndRegistration({
            registrationRef: reg.reference,
            paymentId,
            signature: 'webhook_captured',
            method: 'RAZORPAY',
          });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    console.error('Webhook error:', err);
    return NextResponse.json({ error: { code: 'WEBHOOK_ERROR' } }, { status: 400 });
  }
}
