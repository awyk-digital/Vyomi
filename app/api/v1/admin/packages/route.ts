import { NextResponse } from 'next/server';
import { getAdminSession, MANAGEMENT_ROLES } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { logActivity } from '@/lib/activity';

type PkgRow = {
  id: string;
  name: string;
  slug: string;
  duration_days: number;
  price_inr: number | string;
  original_price_inr: number | string | null;
  benefits: unknown;
  is_active: boolean;
  is_featured: boolean | null;
};

function toClient(p: PkgRow, i: number) {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    durationDays: p.duration_days,
    pricePaise: Math.round(Number(p.price_inr) * 100),
    originalPricePaise: p.original_price_inr ? Math.round(Number(p.original_price_inr) * 100) : null,
    joiningFeePaise: 0,
    benefits: Array.isArray(p.benefits) ? (p.benefits as string[]) : [],
    isActive: p.is_active,
    isFeatured: !!p.is_featured,
    sortOrder: i,
  };
}

export async function GET() {
  const session = await getAdminSession(MANAGEMENT_ROLES);
  if (!session) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from('packages')
    .select('id, name, slug, duration_days, price_inr, original_price_inr, benefits, is_active, is_featured')
    .order('price_inr', { ascending: true });

  if (error) {
    return NextResponse.json({ error: { code: 'DB_ERROR', message: error.message } }, { status: 500 });
  }
  return NextResponse.json({ packages: (data as PkgRow[]).map(toClient) });
}

export async function PATCH(req: Request) {
  const session = await getAdminSession(MANAGEMENT_ROLES);
  if (!session) {
    return NextResponse.json({ error: { code: 'FORBIDDEN' } }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { id, pricePaise, durationDays, benefits, isActive, name } = body;
    if (!id) {
      return NextResponse.json({ error: { code: 'PACKAGE_ID_REQUIRED', message: 'Plan id is required.' } }, { status: 400 });
    }

    const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (name !== undefined) {
      const n = String(name).trim();
      if (n.length < 2) return NextResponse.json({ error: { code: 'INVALID', message: 'Plan name is too short.' } }, { status: 400 });
      update.name = n;
    }
    if (pricePaise !== undefined) {
      const rupees = Math.round(Number(pricePaise) / 100);
      if (!Number.isFinite(rupees) || rupees <= 0) {
        return NextResponse.json({ error: { code: 'INVALID', message: 'Price must be more than ₹0.' } }, { status: 400 });
      }
      update.price_inr = rupees;
    }
    if (durationDays !== undefined) {
      const d = Math.round(Number(durationDays));
      if (!Number.isFinite(d) || d < 1 || d > 3650) {
        return NextResponse.json({ error: { code: 'INVALID', message: 'Duration must be 1–3650 days.' } }, { status: 400 });
      }
      update.duration_days = d;
    }
    if (benefits !== undefined) update.benefits = benefits;
    if (isActive !== undefined) update.is_active = !!isActive;

    const { data, error } = await supabaseAdmin
      .from('packages')
      .update(update)
      .eq('id', id)
      .select('id, name, slug, duration_days, price_inr, original_price_inr, benefits, is_active, is_featured')
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: { code: 'DB_ERROR', message: error.message } }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: { code: 'PACKAGE_NOT_FOUND', message: 'Plan not found.' } }, { status: 404 });
    }

    await logActivity({
      adminId: session.id,
      adminName: session.name,
      adminRole: session.role,
      action: 'PLAN_UPDATED',
      entityType: 'PLAN',
      entityId: id,
      details: { plan: (data as PkgRow).name, ...update },
    });

    return NextResponse.json({ success: true, package: toClient(data as PkgRow, 0) });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Update failed';
    return NextResponse.json({ error: { code: 'SERVER_ERROR', message } }, { status: 500 });
  }
}
