import { NextResponse } from 'next/server';
import { getAdminSession, SUPER_ADMIN_ONLY } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  const session = await getAdminSession(SUPER_ADMIN_ONLY);
  if (!session) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from('audit_logs')
    .select('id, created_at, admin_id, admin_name, admin_role, action, entity_type, entity_id, details')
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) {
    return NextResponse.json({ error: { code: 'DB_ERROR', message: error.message } }, { status: 500 });
  }

  const logs = (data || []).map((r) => ({
    id: r.id,
    adminId: r.admin_id,
    adminName: r.admin_name || 'System',
    adminRole: r.admin_role,
    action: r.action,
    entityType: r.entity_type || '',
    entityId: r.entity_id || '',
    details: r.details || null,
    createdAt: r.created_at,
  }));
  return NextResponse.json({ logs });
}
