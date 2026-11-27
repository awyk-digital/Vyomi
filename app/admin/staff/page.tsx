'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/admin/ui';

interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLoginAt: string | null;
}

const ROLES: Record<string, { label: string; can: string }> = {
  SUPER_ADMIN: { label: 'Super Admin', can: 'Everything, including staff, activity log and cancelling memberships.' },
  MANAGER: { label: 'Manager', can: 'Dashboard, members, payments and plan prices. Cannot see staff or the activity log.' },
  FRONT_DESK: { label: 'Front desk', can: 'Only the membership registration page. Cannot open the admin area.' },
};

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/admin/users', { cache: 'no-store' })
      .then((r) => (r.status === 401 ? (window.location.replace('/admin/login?next=/admin/staff'), null) : r.json()))
      .then((d) => d?.admins && setStaff(d.admins))
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-5">
      <PageHeader title="Staff" subtitle="Who can sign in, and what each role can do." />

      <div className="grid md:grid-cols-3 gap-3">
        {Object.entries(ROLES).map(([key, r]) => (
          <div key={key} className="rounded-2xl bg-white ring-1 ring-[#E3E8F2] p-4">
            <p className="text-sm font-semibold text-[#0F172A]">{r.label}</p>
            <p className="text-sm text-[#64748B] mt-1">{r.can}</p>
          </div>
        ))}
      </div>

      <section className="rounded-2xl bg-white ring-1 ring-[#E3E8F2] overflow-hidden">
        {loading ? (
          <p className="px-5 py-12 text-center text-sm text-[#64748B]">Loading staff…</p>
        ) : (
          <ul className="divide-y divide-[#EEF1F6]">
            {staff.map((u) => (
              <li key={u.id} className="px-5 py-3.5 flex flex-wrap items-center gap-x-6 gap-y-1">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[#0F172A]">{u.name}</p>
                  <p className="text-sm text-[#64748B]">{u.email}</p>
                </div>
                <span className="text-sm text-[#334155] w-28">{ROLES[u.role]?.label || u.role}</span>
                <span className="text-sm text-[#64748B] w-44">
                  {u.lastLoginAt
                    ? `Last sign-in ${new Date(u.lastLoginAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' })}`
                    : 'Never signed in'}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
                    u.isActive ? 'bg-[#EEF2FF] text-[#1E3A8A] ring-[#C7D4F5]' : 'bg-slate-50 text-slate-600 ring-slate-200'
                  }`}
                >
                  {u.isActive ? 'Can sign in' : 'Disabled'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="text-sm text-[#64748B]">
        To add a staff member, remove one, or change a password, ask your developer. Accounts are managed in the code so they
        can&apos;t be changed by anyone who signs in here.
      </p>
    </div>
  );
}
