/**
 * MiniMoth OTP (https://minimoth.dev) — sends from MiniMoth's own DLT-registered
 * sender, so no DLT registration is needed on our side. MiniMoth generates and
 * checks the 6-digit code; codes expire after 10 minutes.
 *
 * Docs: POST /v1/otp/send { phone }  ·  POST /v1/otp/verify { phone, code }
 * Auth: X-Api-Key header. Errors: { error, code, request_id }.
 */

const BASE = 'https://api.minimoth.dev';

export function minimothEnabled(): boolean {
  return !!process.env.MINIMOTH_API_KEY?.trim();
}

type MiniMothResult = { ok: true; data: Record<string, unknown> } | { ok: false; status: number; code: string; message: string };

async function call(path: string, body: Record<string, unknown>): Promise<MiniMothResult> {
  const key = process.env.MINIMOTH_API_KEY?.trim();
  if (!key) return { ok: false, status: 500, code: 'NOT_CONFIGURED', message: 'OTP service is not configured.' };
  try {
    const res = await fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: { 'X-Api-Key': key, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    });
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (res.ok) return { ok: true, data };
    return {
      ok: false,
      status: res.status,
      code: String(data.code || 'MINIMOTH_ERROR'),
      message: String(data.error || 'OTP service error'),
    };
  } catch {
    return { ok: false, status: 502, code: 'NETWORK', message: 'Could not reach the OTP service.' };
  }
}

/** Friendly text for staff, from MiniMoth error codes. */
export function minimothMessage(code: string, fallback: string): string {
  switch (code) {
    case 'INVALID_PHONE':
      return 'Enter a valid 10-digit mobile number.';
    case 'OTP_RATE_LIMITED':
      return 'Too many codes sent to this number. Try again in 10 minutes.';
    case 'OTP_NOT_FOUND':
      return 'Code expired. Please send a new one.';
    case 'INVALID_OTP':
      return 'Wrong code. Please check and try again.';
    case 'VERIFY_RATE_LIMITED':
      return 'Too many wrong tries. Please send a new code.';
    case 'SMS_FAILED':
      return 'The SMS could not be delivered. Please retry in a minute.';
    case 'INSUFFICIENT_BALANCE':
    case 'SPEND_CAP_REACHED':
      return 'OTP credit has run out. Please ask the admin to top up MiniMoth.';
    case 'INVALID_API_KEY':
    case 'MISSING_API_KEY':
      return 'OTP service key is not set up correctly. Please contact the admin.';
    default:
      return fallback || 'OTP service error. Please retry.';
  }
}

export async function minimothSendOtp(phone10: string) {
  return call('/v1/otp/send', { phone: `+91${phone10}` });
}

export async function minimothVerifyOtp(phone10: string, code: string) {
  return call('/v1/otp/verify', { phone: `+91${phone10}`, code });
}
