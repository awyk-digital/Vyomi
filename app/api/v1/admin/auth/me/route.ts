import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { phoneOtpEnabled } from '@/lib/minimoth';

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }

  return NextResponse.json({
    admin: {
      id: session.id,
      name: session.name,
      email: session.email,
      role: session.role,
    },
    // Phone OTP on /register is switched on only after SMS sending is confirmed
    phoneOtp: phoneOtpEnabled(),
  });
}
