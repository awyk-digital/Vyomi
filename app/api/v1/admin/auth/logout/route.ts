import { NextResponse } from 'next/server';
import { AUTH_COOKIE, getAdminSession } from '@/lib/auth';
import { logActivity } from '@/lib/activity';

export async function POST() {
  const session = await getAdminSession();
  if (session) {
    await logActivity({
      adminId: session.id,
      adminName: session.name,
      adminRole: session.role,
      action: 'SIGNED_OUT',
      entityType: 'STAFF',
      entityId: session.email,
    });
  }
  const res = NextResponse.json({ success: true });
  res.cookies.set({
    name: AUTH_COOKIE,
    value: '',
    path: '/',
    maxAge: 0,
  });
  return res;
}
