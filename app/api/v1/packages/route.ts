import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const { data: packages, error } = await supabaseAdmin
      .from('packages')
      .select('*')
      .eq('is_active', true)
      .order('price_inr', { ascending: true });

    if (!error && packages && packages.length > 0) {
      const mapped = packages.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        durationDays: p.duration_days,
        priceInr: Number(p.price_inr),
        pricePaise: Number(p.price_inr) * 100,
        originalPriceInr: p.original_price_inr ? Number(p.original_price_inr) : null,
        originalPricePaise: p.original_price_inr ? Number(p.original_price_inr) * 100 : null,
        benefits: Array.isArray(p.benefits) ? p.benefits : [],
        tag: p.tag,
        isFeatured: p.is_featured,
      }));
      return NextResponse.json({ packages: mapped });
    }

    // Fallback to local DB if Supabase returns empty
    const fallback = db.getPackages(true);
    return NextResponse.json({ packages: fallback });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch packages';
    return NextResponse.json({ error: { code: 'SERVER_ERROR', message } }, { status: 500 });
  }
}
