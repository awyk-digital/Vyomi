import { NextResponse } from 'next/server';
import { memoryEmailOtpStore } from '@/lib/otpStore';
import { sendGmailOtp } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body.email || '').trim().toLowerCase();
    const clientName = String(body.fullName || body.clientName || 'Valued Member').trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: { code: 'INVALID_EMAIL', message: 'Please provide a valid Gmail / Email address.' } },
        { status: 400 }
      );
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store in memory cache
    memoryEmailOtpStore.set(email, {
      code: otpCode,
      expiresAt,
    });

    // Dispatch real email via Gmail SMTP
    const emailResult = await sendGmailOtp({
      toEmail: email,
      otpCode,
      clientName,
    });

    if (!emailResult.sent) {
      console.warn(`[EMAIL_OTP_DISPATCH_WARNING] SMTP reported error:`, emailResult.error);
    }

    return NextResponse.json({
      success: true,
      message: `Verification code sent to ${email}`,
      email,
      expiresInSeconds: 600,
      dispatched: emailResult.sent,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to send email OTP';
    return NextResponse.json({ error: { code: 'SERVER_ERROR', message } }, { status: 500 });
  }
}
