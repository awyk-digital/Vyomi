import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Staff authentication required' } }, { status: 401 });
  }

  const admins = db.getAdmins().map((a) => ({
    id: a.id,
    name: a.name,
    email: a.email,
    role: a.role,
    isActive: a.isActive,
    lastLoginAt: a.lastLoginAt,
    createdAt: a.createdAt,
  }));

  return NextResponse.json({ admins });
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session || session.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Super Admin access required to provision staff' } }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, email, role, password } = body;

    if (!name || !email || !role || !password) {
      return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'All fields are required' } }, { status: 400 });
    }

    if (db.findAdminByEmail(email)) {
      return NextResponse.json({ error: { code: 'DUPLICATE_EMAIL', message: 'An account with this email already exists' } }, { status: 400 });
    }

    const created = db.saveAdmin({
      name,
      email,
      role,
      password,
      isActive: true,
      lastLoginAt: null,
    });

    db.logAudit({
      adminId: session.id,
      adminName: session.name,
      action: 'PROVISION_STAFF_ACCOUNT',
      entityType: 'SECURITY_ACCESS',
      entityId: created.id,
      details: { email: created.email, role: created.role },
    });

    return NextResponse.json({
      admin: {
        id: created.id,
        name: created.name,
        email: created.email,
        role: created.role,
        isActive: created.isActive,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Provisioning failed';
    return NextResponse.json({ error: { code: 'SERVER_ERROR', message } }, { status: 500 });
  }
}
