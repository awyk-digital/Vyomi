/**
 * Razorpay Payment Gateway Test Suite
 * Tests signature verification, simulated success/failure/pending cases, and webhook validations.
 */

import crypto from 'crypto';
import {
  createRazorpayOrder,
  verifyPaymentSignature,
  verifyWebhookSignature,
  RAZORPAY_KEY_SECRET,
  RAZORPAY_WEBHOOK_SECRET,
} from '../lib/razorpay';

async function runRazorpayTests() {
  console.log('========================================================');
  console.log('   VYOMI FITNESS CLUB — RAZORPAY TEST SUITE');
  console.log('========================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ✕ FAIL: ${testName}`);
      failed++;
    }
  }

  // 1. Order ID Generation Test
  console.log('1. Testing Razorpay Order Generation...');
  const order = await createRazorpayOrder({
    amountPaise: 1062000,
    receipt: 'REG-20261124-TEST',
    notes: { tier: 'Gold' },
  });
  assert(order.id.startsWith('order_'), 'Generates valid order ID format');
  assert(order.amount === 1062000, 'Preserves exact amount in paise');
  assert(order.currency === 'INR', 'Currency is INR');

  // 2. Signature Verification Test (Valid HMAC)
  console.log('\n2. Testing Razorpay Payment Signature Verification...');
  const testOrderId = 'order_test_123456';
  const testPaymentId = 'pay_test_987654';
  const validSignature = crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(`${testOrderId}|${testPaymentId}`)
    .digest('hex');

  const isValid = verifyPaymentSignature({
    orderId: testOrderId,
    paymentId: testPaymentId,
    signature: validSignature,
  });
  assert(isValid === true, 'Valid HMAC-SHA256 signature passes verification');

  // 3. Signature Verification Test (Tampered / Invalid)
  const isInvalid = verifyPaymentSignature({
    orderId: testOrderId,
    paymentId: testPaymentId,
    signature: 'bad_tampered_signature_hex_1234567890abcdef',
  });
  assert(isInvalid === false, 'Tampered signature is strictly rejected');

  // 4. Test Mode Mock Signatures
  assert(
    verifyPaymentSignature({
      orderId: testOrderId,
      paymentId: testPaymentId,
      signature: 'sig_mock_verified',
    }) === true,
    'Mock test signature "sig_mock_verified" accepted in sandbox'
  );

  // 5. Webhook Signature Verification Test
  console.log('\n3. Testing Razorpay Webhook Signature Verification...');
  const webhookPayload = JSON.stringify({
    event: 'payment.captured',
    payload: {
      payment: {
        entity: {
          id: 'pay_hook_123',
          amount: 1062000,
          status: 'captured',
        },
      },
    },
  });

  const validWebhookSig = crypto
    .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
    .update(webhookPayload)
    .digest('hex');

  assert(
    verifyWebhookSignature(webhookPayload, validWebhookSig) === true,
    'Valid webhook payload signature verified'
  );

  assert(
    verifyWebhookSignature(webhookPayload, 'invalid_webhook_sig') === false,
    'Forged webhook signature rejected'
  );

  // 6. Summary
  console.log('\n========================================================');
  console.log(`Total: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
  console.log('========================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runRazorpayTests().catch((err) => {
  console.error('Fatal error in tests:', err);
  process.exit(1);
});
