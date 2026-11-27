import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { memoryOtpStore } from '@/lib/otpStore';
import { sendRealTelecomSms } from '@/lib/sms';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let phone = String(body.phone || '').replace(/\D/g, '');
    if (phone.length > 10 && phone.startsWith('91')) {
      phone = phone.slice(2);
    } else if (phone.length === 11 && phone.startsWith('0')) {
      phone = phone.slice(1);
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      return NextResponse.json(
        { error: { code: 'INVALID_PHONE', message: 'Please provide a valid 10-digit Indian mobile number.' } },
        { status: 400 }
      );
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    // Store in Supabase
    try {
      await supabaseAdmin.from('otp_verifications').insert({
        phone,
        otp_code: otpCode,
        expires_at: expiresAt,
        is_verified: false,
      });
    } catch (dbErr) {
      console.warn('Supabase OTP store error, fallback to memory:', dbErr);
    }

    // Also store in memory cache
    memoryOtpStore.set(phone, {
      code: otpCode,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    // 3. Dispatch real telecom SMS
    const smsResult = await sendRealTelecomSms({ phone, otp: otpCode });

    return NextResponse.json({
      success: true,
      message: smsResult.sent
        ? `Verification SMS dispatched to +91 ${phone}`
        : `Verification code generated for +91 ${phone}`,
      testOtp: otpCode, // Displayed in sandbox so user is never blocked while configuring telecom gateway
      realSmsDispatched: smsResult.sent,
      provider: smsResult.provider,
      expiresInSeconds: 300,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to send OTP';
    return NextResponse.json({ error: { code: 'SERVER_ERROR', message } }, { status: 500 });
  }
}
