import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { memoryOtpStore } from '@/lib/otpStore';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let phone = String(body.phone || '').replace(/\D/g, '');
    if (phone.length > 10 && phone.startsWith('91')) {
      phone = phone.slice(2);
    } else if (phone.length === 11 && phone.startsWith('0')) {
      phone = phone.slice(1);
    }
    const code = String(body.code || body.otp || '').trim();

    if (!phone || !code) {
      return NextResponse.json(
        { error: { code: 'MISSING_DATA', message: 'Phone number and verification code are required.' } },
        { status: 400 }
      );
    }

    // Master test bypass or check memory / Supabase
    let isValid = false;

    if (process.env.NODE_ENV !== 'production' && code === '123456') {
      isValid = true;
    } else {
      // 1. Check in memory
      const mem = memoryOtpStore.get(phone);
      if (mem && mem.code === code && mem.expiresAt > Date.now()) {
        isValid = true;
      }

      // 2. Check in Supabase
      if (!isValid) {
        const { data } = await supabaseAdmin
          .from('otp_verifications')
          .select('*')
          .eq('phone', phone)
          .eq('otp_code', code)
          .gt('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false })
          .limit(1);

        if (data && data.length > 0) {
          isValid = true;
        }
      }
    }

    if (!isValid) {
      return NextResponse.json(
        { verified: false, error: { code: 'INVALID_OTP', message: 'Invalid or expired verification code. Please request a new OTP.' } },
        { status: 400 }
      );
    }

    // Mark as verified in Supabase
    try {
      await supabaseAdmin
        .from('otp_verifications')
        .update({ is_verified: true })
        .eq('phone', phone)
        .eq('otp_code', code);
    } catch {}

    // Clear from memory
    memoryOtpStore.delete(phone);

    return NextResponse.json({
      verified: true,
      message: 'Mobile number successfully verified.',
      phone,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Verification failed';
    return NextResponse.json({ error: { code: 'SERVER_ERROR', message } }, { status: 500 });
  }
}
