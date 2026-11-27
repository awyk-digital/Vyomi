'use client';

import { useCallback, useEffect, useState } from 'react';
import { formatINR, PageHeader, Toast } from '@/components/admin/ui';

interface PackageItem {
  id: string;
  name: string;
  slug: string;
  durationDays: number;
  pricePaise: number;
  originalPricePaise: number | null;
  benefits: string[];
  isActive: boolean;
  isFeatured: boolean;
}

const input =
  'w-full h-10 rounded-lg ring-1 ring-[#E3E8F2] bg-white px-3 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/30';

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [edit, setEdit] = useState({ name: '', price: 0, days: 365 });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; tone: 'ok' | 'error' } | null>(null);

  const load = useCallback(() => {
    fetch('/api/v1/admin/packages', { cache: 'no-store' })
      .then((r) => (r.status === 401 ? (window.location.replace('/admin/login?next=/admin/packages'), null) : r.json()))
      .then((d) => d?.packages && setPackages(d.packages))
      .catch(() => setToast({ msg: 'Could not load plans.', tone: 'error' }))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const patch = async (body: Record<string, unknown>) => {
    const res = await fetch('/api/v1/admin/packages', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(d.error?.message || 'Could not save.');
  };

  const save = async (id: string) => {
    if (edit.price <= 0) return setToast({ msg: 'Price must be more than ₹0.', tone: 'error' });
    if (edit.days < 1) return setToast({ msg: 'Duration must be at least 1 day.', tone: 'error' });
    setSaving(true);
    try {
      await patch({ id, name: edit.name, pricePaise: Math.round(edit.price * 100), durationDays: edit.days });
      setEditingId(null);
      setToast({ msg: 'Plan saved. The registration page now shows the new price.', tone: 'ok' });
      load();
    } catch (e) {
      setToast({ msg: (e as Error).message, tone: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (pkg: PackageItem) => {
    const msg = pkg.isActive
      ? `Hide “${pkg.name}” from the registration page?\n\nExisting members are not affected.`
      : `Show “${pkg.name}” on the registration page again?`;
    if (!window.confirm(msg)) return;
    try {
      await patch({ id: pkg.id, isActive: !pkg.isActive });
      setToast({ msg: pkg.isActive ? 'Plan hidden from registration.' : 'Plan is visible on registration.', tone: 'ok' });
      load();
    } catch (e) {
      setToast({ msg: (e as Error).message, tone: 'error' });
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Plans" subtitle="Prices and durations shown on the registration page. Changes apply immediately." />

      {loading ? (
        <p className="py-12 text-center text-sm text-[#64748B]">Loading plans…</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {packages.map((pkg) => {
            const editing = editingId === pkg.id;
            return (
              <div key={pkg.id} className={`rounded-2xl bg-white ring-1 p-5 flex flex-col ${pkg.isActive ? 'ring-[#E3E8F2]' : 'ring-[#E3E8F2] opacity-75'}`}>
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
                      pkg.isActive ? 'bg-[#EEF2FF] text-[#1E3A8A] ring-[#C7D4F5]' : 'bg-slate-50 text-slate-600 ring-slate-200'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${pkg.isActive ? 'bg-[#1E3A8A]' : 'bg-slate-400'}`} />
                    {pkg.isActive ? 'Shown on registration' : 'Hidden'}
                  </span>
                  {pkg.isFeatured && <span className="text-xs text-[#64748B]">Most popular</span>}
                </div>

                {editing ? (
                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="block text-sm text-[#334155] mb-1">Plan name</label>
                      <input className={input} value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-sm text-[#334155] mb-1">Price (₹)</label>
                        <input className={input} type="number" min={1} value={edit.price} onChange={(e) => setEdit({ ...edit, price: Number(e.target.value) })} />
                      </div>
                      <div>
                        <label className="block text-sm text-[#334155] mb-1">Days</label>
                        <input className={input} type="number" min={1} value={edit.days} onChange={(e) => setEdit({ ...edit, days: Number(e.target.value) })} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold text-[#0F172A]">{pkg.name}</h3>
                    <p className="mt-1">
                      <span className="text-2xl font-semibold text-[#0F172A]">{formatINR(pkg.pricePaise)}</span>
                      <span className="text-sm text-[#64748B]"> / {pkg.durationDays} days</span>
                    </p>
                    <ul className="mt-4 space-y-1.5 text-sm text-[#475569]">
                      {pkg.benefits.map((b, i) => (
                        <li key={i} className="flex gap-2"><span className="text-[#1E3A8A]">✓</span>{b}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-auto pt-5 flex gap-2">
                  {editing ? (
                    <>
                      <button type="button" onClick={() => setEditingId(null)} className="flex-1 h-9 rounded-lg text-sm ring-1 ring-[#E2E8F0] hover:ring-[#94A3B8]">
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => save(pkg.id)}
                        className="flex-1 h-9 rounded-lg text-sm font-medium text-white bg-[#1E3A8A] hover:bg-[#172F73] disabled:opacity-60"
                      >
                        {saving ? 'Saving…' : 'Save'}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(pkg.id);
                          setEdit({ name: pkg.name, price: Math.round(pkg.pricePaise / 100), days: pkg.durationDays });
                        }}
                        className="flex-1 h-9 rounded-lg text-sm font-medium text-[#1E3A8A] ring-1 ring-[#C7D4F5] hover:ring-[#1E3A8A]"
                      >
                        Edit price
                      </button>
                      <button type="button" onClick={() => toggle(pkg)} className="flex-1 h-9 rounded-lg text-sm text-[#475569] ring-1 ring-[#E2E8F0] hover:ring-[#94A3B8]">
                        {pkg.isActive ? 'Hide' : 'Show'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {toast && <Toast message={toast.msg} tone={toast.tone} onClose={() => setToast(null)} />}
    </div>
  );
}
