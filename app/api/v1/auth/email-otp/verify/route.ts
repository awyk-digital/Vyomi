import { NextResponse } from 'next/server';
import { memoryEmailOtpStore } from '@/lib/otpStore';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body.email || '').trim().toLowerCase();
    const code = String(body.code || body.otp || '').trim();

    if (!email || !code) {
      return NextResponse.json(
        { error: { code: 'MISSING_DATA', message: 'Email address and 6-digit verification code are required.' } },
        { status: 400 }
      );
    }

    let isValid = false;

    // Master test bypass for local developer sandbox
    if (process.env.NODE_ENV !== 'production' && code === '123456') {
      isValid = true;
    } else {
      const stored = memoryEmailOtpStore.get(email);
      if (stored && stored.code === code && stored.expiresAt > Date.now()) {
        isValid = true;
      }
    }

    if (!isValid) {
      return NextResponse.json(
        { verified: false, error: { code: 'INVALID_OTP', message: 'Invalid or expired verification code. Please check your Gmail or request a new code.' } },
        { status: 400 }
      );
    }

    // Clean up used OTP
    memoryEmailOtpStore.delete(email);

    return NextResponse.json({
      verified: true,
      message: 'Email address successfully verified.',
      email,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Email verification failed';
    return NextResponse.json({ error: { code: 'SERVER_ERROR', message } }, { status: 500 });
  }
}
