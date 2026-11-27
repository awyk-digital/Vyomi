import { NextResponse } from 'next/server';
import { getAdminSession, SUPER_ADMIN_ONLY } from '@/lib/auth';
import { db } from '@/lib/db';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  const session = await getAdminSession(SUPER_ADMIN_ONLY);
  if (!session) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Staff authentication required' } }, { status: 401 });
  }

  // Last sign-in comes from the activity log (Supabase), which survives deploys.
  const lastSeen: Record<string, string> = {};
  try {
    const { data } = await supabaseAdmin
      .from('audit_logs')
      .select('admin_id, created_at')
      .eq('action', 'SIGNED_IN')
      .order('created_at', { ascending: false })
      .limit(500);
    for (const row of data || []) {
      if (row.admin_id && !lastSeen[row.admin_id]) lastSeen[row.admin_id] = row.created_at;
    }
  } catch {
    /* fall back to local value */
  }

  const admins = db.getAdmins().map((a) => ({
    id: a.id,
    name: a.name,
    email: a.email,
    role: a.role,
    isActive: a.isActive,
    lastLoginAt: lastSeen[a.id] || a.lastLoginAt,
    createdAt: a.createdAt,
  }));

  return NextResponse.json({ admins });
}

export async function POST(req: Request) {
  const session = await getAdminSession(SUPER_ADMIN_ONLY);
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
