import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getAdminSession } from '@/lib/auth';
import { sendRealTelecomSms } from '@/lib/sms';
import { minimothEnabled, minimothSendOtp, minimothMessage } from '@/lib/minimoth';

const OTP_TTL_MS = 5 * 60 * 1000;
const RESEND_GAP_MS = 30 * 1000;
const MAX_PER_15_MIN = 5;

function cleanPhone(raw: unknown): string {
  let phone = String(raw || '').replace(/\D/g, '');
  if (phone.length > 10 && phone.startsWith('91')) phone = phone.slice(2);
  else if (phone.length === 11 && phone.startsWith('0')) phone = phone.slice(1);
  return phone;
}

/** Send a 6-digit code to the member's mobile. Staff only, rate limited. */
export async function POST(req: Request) {
  const staff = await getAdminSession();
  if (!staff) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Front desk sign-in required.' } }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const phone = cleanPhone(body.phone);
    if (!/^[6-9]\d{9}$/.test(phone)) {
      return NextResponse.json(
        { error: { code: 'INVALID_PHONE', message: 'Enter a valid 10-digit mobile number.' } },
        { status: 400 }
      );
    }

    // Rate limit per number (stored in Supabase, so it holds across servers)
    const since = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const { data: recent } = await supabaseAdmin
      .from('otp_verifications')
      .select('created_at')
      .eq('phone', phone)
      .gt('created_at', since)
      .order('created_at', { ascending: false });
    if (recent && recent.length > 0) {
      const lastAt = new Date(recent[0].created_at).getTime();
      const wait = Math.ceil((lastAt + RESEND_GAP_MS - Date.now()) / 1000);
      if (wait > 0) {
        return NextResponse.json(
          { error: { code: 'TOO_SOON', message: `Please wait ${wait}s before sending another code.` }, retryAfter: wait },
          { status: 429 }
        );
      }
      if (recent.length >= MAX_PER_15_MIN) {
        return NextResponse.json(
          { error: { code: 'TOO_MANY', message: 'Too many codes sent to this number. Try again in 15 minutes.' } },
          { status: 429 }
        );
      }
    }

    // MiniMoth: they generate, send (SMS from their DLT sender) and later check the code
    if (minimothEnabled()) {
      const mm = await minimothSendOtp(phone);
      if (!mm.ok) {
        return NextResponse.json(
          { error: { code: mm.code, message: minimothMessage(mm.code, mm.message) } },
          { status: mm.status === 429 ? 429 : mm.status >= 500 ? 502 : 400 }
        );
      }
      await supabaseAdmin.from('otp_verifications').insert({
        phone,
        otp_code: 'MINIMOTH',
        expires_at: String(mm.data.expires_at || new Date(Date.now() + 10 * 60 * 1000).toISOString()),
        is_verified: false,
        attempts: 0,
      });
      return NextResponse.json({
        success: true,
        message: `Code sent to +91 ${phone}`,
        realSmsDispatched: true,
        provider: 'MINIMOTH',
        expiresInSeconds: 600,
        resendInSeconds: RESEND_GAP_MS / 1000,
      });
    }

    const otpCode = String(Math.floor(100000 + Math.random() * 900000));
    const smsResult = await sendRealTelecomSms({ phone, otp: otpCode });

    const devMode = process.env.NODE_ENV !== 'production';
    if (!smsResult.sent && !devMode) {
      return NextResponse.json(
        {
          error: {
            code: 'SMS_FAILED',
            message: smsResult.error
              ? `SMS could not be sent: ${smsResult.error}`
              : 'SMS could not be sent. Please try again in a minute.',
          },
        },
        { status: 502 }
      );
    }

    const { error: dbErr } = await supabaseAdmin.from('otp_verifications').insert({
      phone,
      otp_code: otpCode,
      expires_at: new Date(Date.now() + OTP_TTL_MS).toISOString(),
      is_verified: false,
      attempts: 0,
    });
    if (dbErr) {
      return NextResponse.json({ error: { code: 'DB_ERROR', message: 'Could not save the code. Please retry.' } }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: smsResult.sent ? `Code sent to +91 ${phone}` : `Code generated for +91 ${phone} (no SMS provider on this computer)`,
      realSmsDispatched: smsResult.sent,
      provider: smsResult.provider,
      expiresInSeconds: OTP_TTL_MS / 1000,
      resendInSeconds: RESEND_GAP_MS / 1000,
      // Only on a developer machine with no SMS provider, so testing is never blocked
      ...(devMode && !smsResult.sent ? { devOtp: otpCode } : {}),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to send code';
    return NextResponse.json({ error: { code: 'SERVER_ERROR', message } }, { status: 500 });
  }
}
