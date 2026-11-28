'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';


const input =
  'w-full h-11 rounded-xl ring-1 ring-[#E3E8F2] bg-white px-3.5 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/30';

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm text-[#334155] mb-1.5">{children}</label>;
}

export default function EditRegistrationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [reference, setReference] = useState('');
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    gender: 'Prefer not to say',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetch(`/api/v1/admin/registrations/${encodeURIComponent(id)}`, { cache: 'no-store' })
      .then((r) => (r.status === 401 ? (window.location.replace('/admin/login'), null) : r.json()))
      .then((d) => {
        const r = d?.registration;
        if (!r) return;
        setReference(r.reference);
        setForm({
          fullName: r.client?.fullName || '',
          phone: r.client?.phone || '',
          email: r.client?.email || '',
          gender: r.client?.gender || 'Prefer not to say',
          startDate: r.startDate || '',
          endDate: r.endDate || '',
        });
      })
      .catch(() => setError('Could not load this member.'))
      .finally(() => setLoading(false));
  }, [id]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.fullName.trim().length < 2) return setError('Please enter the full name.');
    if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\D/g, ''))) return setError('Mobile number must be 10 digits.');
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setError('Email address is not valid.');
    if (form.startDate && form.endDate && form.endDate < form.startDate) return setError('End date must be after the start date.');

    setSaving(true);
    try {
      const res = await fetch(`/api/v1/admin/registrations/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) setError(d.error?.message || 'Could not save. Please try again.');
      else router.push(`/admin/registrations/${reference || id}`);
    } catch {
      setError('Network error. Nothing was saved.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="py-16 text-center text-sm text-[#64748B]">Loading member…</p>;

  return (
    <div className="max-w-2xl space-y-5">
      <Link href={`/admin/registrations/${reference || id}`} className="text-sm text-[#64748B] hover:text-[#1E3A8A]">
        ← Back to member
      </Link>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#0F172A]">Edit details</h1>
        <p className="text-sm text-[#64748B] mt-1">{form.fullName || 'Member'} · {reference}</p>
      </div>

      <form onSubmit={submit} className="rounded-2xl bg-white ring-1 ring-[#E3E8F2] p-5 sm:p-6 space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Label>Full name</Label>
            <input className={input} value={form.fullName} onChange={set('fullName')} required />
          </div>
          <div>
            <Label>Mobile number</Label>
            <div className="flex rounded-xl ring-1 ring-[#E3E8F2] bg-white focus-within:ring-2 focus-within:ring-[#1E3A8A]/30">
              <span className="px-3 flex items-center text-sm text-[#64748B] border-r border-[#E3E8F2]">+91</span>
              <input
                className="flex-1 h-11 px-3 text-sm bg-transparent focus:outline-none"
                value={form.phone}
                maxLength={10}
                inputMode="numeric"
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, '') }))}
                required
              />
            </div>
          </div>
          <div>
            <Label>Email</Label>
            <input className={input} type="email" value={form.email} onChange={set('email')} />
          </div>
          <div>
            <Label>Gender</Label>
            <select className={input} value={form.gender} onChange={set('gender')}>
              {['Male', 'Female', 'Prefer not to say'].map((g) => <option key={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <Label>Start date</Label>
            <input className={input} type="date" value={form.startDate} onChange={set('startDate')} />
          </div>
          <div>
            <Label>End date</Label>
            <input className={input} type="date" value={form.endDate} onChange={set('endDate')} />
          </div>
        </div>

        {error && <p className="rounded-xl bg-red-50 ring-1 ring-red-200 px-3.5 py-2.5 text-sm text-red-800">{error}</p>}

        <div className="flex justify-end gap-2 pt-1">
          <Link
            href={`/admin/registrations/${reference || id}`}
            className="h-10 px-4 inline-flex items-center rounded-xl text-sm text-[#334155] ring-1 ring-[#E2E8F0] hover:ring-[#94A3B8] transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="h-10 px-5 rounded-xl text-sm font-medium text-white bg-[#1E3A8A] hover:bg-[#172F73] disabled:opacity-60 transition"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
