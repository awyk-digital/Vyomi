import { NextResponse } from 'next/server';
import { getAdminSession, SUPER_ADMIN_ONLY } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { logActivity } from '@/lib/activity';

/** Cancel a membership and mark its payment refunded. Super Admin only. */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession(SUPER_ADMIN_ONLY);
  if (!session) {
    return NextResponse.json(
      { error: { code: 'FORBIDDEN', message: 'Only the Super Admin can cancel and refund a membership.' } },
      { status: 403 }
    );
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const reason = String(body.reason || '').trim().slice(0, 500);
  if (!reason) {
    return NextResponse.json({ error: { code: 'REASON_REQUIRED', message: 'Please enter a reason.' } }, { status: 400 });
  }

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  const q = supabaseAdmin.from('registrations').select('id, reference, status, amount_inr, notes');
  const { data: reg } = await (isUuid ? q.eq('id', id) : q.eq('reference', id)).maybeSingle();
  if (!reg) {
    return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Registration not found.' } }, { status: 404 });
  }
  if (reg.status === 'CANCELLED') {
    return NextResponse.json({ error: { code: 'ALREADY_CANCELLED', message: 'This membership is already cancelled.' } }, { status: 400 });
  }

  const now = new Date().toISOString();
  const note = `Cancelled by ${session.name} on ${now.slice(0, 10)}: ${reason}`;
  const { error: regErr } = await supabaseAdmin
    .from('registrations')
    .update({ status: 'CANCELLED', updated_at: now, notes: reg.notes ? `${reg.notes}\n${note}` : note })
    .eq('id', reg.id);
  if (regErr) {
    return NextResponse.json({ error: { code: 'DB_ERROR', message: regErr.message } }, { status: 500 });
  }
  await supabaseAdmin.from('payments').update({ status: 'REFUNDED', notes: note }).eq('registration_id', reg.id);

  await logActivity({
    adminId: session.id,
    adminName: session.name,
    adminRole: session.role,
    action: 'MEMBERSHIP_CANCELLED',
    entityType: 'REGISTRATION',
    entityId: reg.reference,
    details: { reason, amountInr: Number(reg.amount_inr || 0) },
  });

  return NextResponse.json({ success: true, status: 'CANCELLED' });
}
