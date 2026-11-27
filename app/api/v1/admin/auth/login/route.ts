import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createSessionToken, AUTH_COOKIE } from '@/lib/auth';
import { logActivity } from '@/lib/activity';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: { code: 'INVALID_CREDENTIALS', message: 'Email and password are required' } },
        { status: 400 }
      );
    }

    const admin = db.findAdminByEmail(email);
    if (!admin || !admin.isActive) {
      return NextResponse.json(
        { error: { code: 'AUTH_FAILED', message: 'Invalid credentials. Access denied.' } },
        { status: 401 }
      );
    }

    const valid = db.verifyAdminPassword(admin, password);
    if (!valid) {
      return NextResponse.json(
        { error: { code: 'AUTH_FAILED', message: 'Invalid credentials. Access denied.' } },
        { status: 401 }
      );
    }

    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    const loginTimeIST = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'medium',
    });

    db.updateAdminLogin(admin.id);
    db.logAudit({
      adminId: admin.id,
      adminName: admin.name,
      action: 'STAFF_AUTHENTICATION',
      entityType: 'SECURITY_ACCESS',
      entityId: admin.id,
      details: {
        staffEmail: admin.email,
        assignedRole: admin.role,
        terminalIp: clientIp,
        authenticatedAtIST: loginTimeIST,
        sessionType: 'SECURE_WEB_PORTAL',
      },
    });

    await logActivity({
      adminId: admin.id,
      adminName: admin.name,
      adminRole: admin.role,
      action: 'SIGNED_IN',
      entityType: 'STAFF',
      entityId: admin.email,
      details: { ip: clientIp },
    });

    const token = createSessionToken({
      id: admin.id,
      email: admin.email,
      role: admin.role,
      name: admin.name,
    });

    const res = NextResponse.json({
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });

    const isHttps = req.headers.get('x-forwarded-proto') === 'https' || req.url.startsWith('https://');
    res.cookies.set({
      name: AUTH_COOKIE,
      value: token,
      httpOnly: true,
      secure: isHttps,
      sameSite: 'lax',
      path: '/',
      maxAge: 8 * 60 * 60, // 8 hours
    });

    return res;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Login failed';
    return NextResponse.json({ error: { code: 'SERVER_ERROR', message } }, { status: 500 });
  }
}
