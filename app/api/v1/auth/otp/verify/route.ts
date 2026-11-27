import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getAdminSession } from '@/lib/auth';
import { minimothEnabled, minimothVerifyOtp, minimothMessage } from '@/lib/minimoth';

const MAX_ATTEMPTS = 5;

function cleanPhone(raw: unknown): string {
  let phone = String(raw || '').replace(/\D/g, '');
  if (phone.length > 10 && phone.startsWith('91')) phone = phone.slice(2);
  else if (phone.length === 11 && phone.startsWith('0')) phone = phone.slice(1);
  return phone;
}

/** Check the 6-digit code for a mobile number. Staff only, max 5 tries per code. */
export async function POST(req: Request) {
  const staff = await getAdminSession();
  if (!staff) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Front desk sign-in required.' } }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const phone = cleanPhone(body.phone);
    const code = String(body.code || body.otp || '').replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(phone) || code.length !== 6) {
      return NextResponse.json(
        { error: { code: 'MISSING_DATA', message: 'Enter the 6-digit code.' } },
        { status: 400 }
      );
    }

    // Latest unused, unexpired code for this number
    const { data: rows } = await supabaseAdmin
      .from('otp_verifications')
      .select('id, otp_code, attempts')
      .eq('phone', phone)
      .eq('is_verified', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1);
    const row = rows?.[0];

    if (!row) {
      return NextResponse.json(
        { verified: false, error: { code: 'EXPIRED', message: 'Code expired. Please send a new one.' } },
        { status: 400 }
      );
    }
    if ((row.attempts ?? 0) >= MAX_ATTEMPTS) {
      return NextResponse.json(
        { verified: false, error: { code: 'LOCKED', message: 'Too many wrong tries. Please send a new code.' } },
        { status: 429 }
      );
    }

    // MiniMoth codes are checked by MiniMoth
    if (row.otp_code === 'MINIMOTH' && minimothEnabled()) {
      const mm = await minimothVerifyOtp(phone, code);
      if (!mm.ok) {
        const attempts = (row.attempts ?? 0) + 1;
        await supabaseAdmin.from('otp_verifications').update({ attempts }).eq('id', row.id);
        return NextResponse.json(
          { verified: false, error: { code: mm.code, message: minimothMessage(mm.code, mm.message) } },
          { status: mm.status === 429 ? 429 : 400 }
        );
      }
      await supabaseAdmin.from('otp_verifications').update({ is_verified: true }).eq('id', row.id);
      return NextResponse.json({ verified: true, message: 'Mobile number verified.', phone });
    }

    if (row.otp_code !== code) {
      const attempts = (row.attempts ?? 0) + 1;
      await supabaseAdmin.from('otp_verifications').update({ attempts }).eq('id', row.id);
      const left = MAX_ATTEMPTS - attempts;
      return NextResponse.json(
        {
          verified: false,
          error: {
            code: 'INVALID_OTP',
            message: left > 0 ? `Wrong code. ${left} ${left === 1 ? 'try' : 'tries'} left.` : 'Too many wrong tries. Please send a new code.',
          },
        },
        { status: 400 }
      );
    }

    await supabaseAdmin.from('otp_verifications').update({ is_verified: true }).eq('id', row.id);
    return NextResponse.json({ verified: true, message: 'Mobile number verified.', phone });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Verification failed';
    return NextResponse.json({ error: { code: 'SERVER_ERROR', message } }, { status: 500 });
  }
}
