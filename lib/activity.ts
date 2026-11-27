import { supabaseAdmin } from './supabase';

/**
 * Staff activity log, stored in Supabase (public.audit_logs) so it survives
 * serverless deploys. Never throws: logging must not break the action itself.
 */
export async function logActivity(entry: {
  adminId?: string | null;
  adminName?: string | null;
  adminRole?: string | null;
  action: string;
  entityType?: string;
  entityId?: string;
  details?: Record<string, unknown>;
}): Promise<void> {
  try {
    await supabaseAdmin.from('audit_logs').insert({
      admin_id: entry.adminId ?? null,
      admin_name: entry.adminName ?? null,
      admin_role: entry.adminRole ?? null,
      action: entry.action,
      entity_type: entry.entityType ?? null,
      entity_id: entry.entityId ?? null,
      details: entry.details ?? {},
    });
  } catch (err) {
    console.warn('Activity log write failed:', err);
  }
}
