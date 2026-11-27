'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface PackageItem {
  id: string;
  name: string;
  durationDays: number;
  pricePaise: number;
}

function formatINR(paise: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(paise / 100);
}

export default function NewWalkinRegistrationPage() {
  const router = useRouter();
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [selectedPkgId, setSelectedPkgId] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CASH'>('CASH');
  const [markPaid, setMarkPaid] = useState(false);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/v1/packages')
      .then((res) => res.json())
      .then((data) => {
        if (data.packages) {
          setPackages(data.packages);
          if (data.packages.length > 0) setSelectedPkgId(data.packages[1]?.id || data.packages[0].id);
        }
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Create the membership (same endpoint the front desk uses)
      const res = await fetch('/api/v1/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          phone,
          email,
          packageId: selectedPkgId,
          paymentMethod,
          startDate,
          acceptedTerms: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error?.message || 'Registration failed. Please check the details.');
        return;
      }
      const ref = data.reference as string;

      // 2. Cash received now -> mark paid immediately
      if (paymentMethod === 'CASH' && markPaid) {
        const paid = await fetch(`/api/v1/admin/registrations/${ref}/mark-paid`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ method: 'CASH' }),
        });
        if (!paid.ok) {
          const d = await paid.json().catch(() => ({}));
          setError(`Member registered (${ref}) but could not mark as paid: ${d.error?.message || 'please retry from the member page.'}`);
          return;
        }
      }

      // 3. Optional desk notes
      if (notes.trim()) {
        await fetch(`/api/v1/admin/registrations/${ref}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notes }),
        }).catch(() => null);
      }

      router.push(`/admin/registrations/${ref}`);
    } catch {
      setError('Connection failure');
    } finally {
      setLoading(false);
    }
  };

  const selectedPkg = packages.find((p) => p.id === selectedPkgId);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/admin/registrations" className="text-xs font-bold text-[#64748B] hover:text-[#0F172A]">
              ← Members
            </Link>
            <span className="text-[#CBD5E1]">/</span>
            <span className="text-sm text-[#64748B]">Front desk</span>
          </div>
          <h1 className="text-2xl font-semibold text-[#0F172A] mt-1 tracking-tight">
            New walk-in
          </h1>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs font-bold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-[#CBD5E1] p-6 sm:p-8 rounded-xl shadow-sm space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm text-[#334155] mb-1.5">
              Full name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Ramesh Chandra"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-white border border-[#CBD5E1] rounded-lg px-3 py-2 text-sm font-normal text-[#0F172A] focus:outline-none focus:border-[#1E3A8A]"
            />
          </div>

          <div>
            <label className="block text-sm text-[#334155] mb-1.5">
              Mobile number *
            </label>
            <input
              type="tel"
              required
              placeholder="e.g. 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              className="w-full bg-white border border-[#CBD5E1] rounded-lg px-3 py-2 text-sm font-normal text-[#0F172A] focus:outline-none focus:border-[#1E3A8A]"
            />
          </div>

          <div>
            <label className="block text-sm text-[#334155] mb-1.5">
              Email (for the receipt) *
            </label>
            <input
              type="email"
              required
              placeholder="e.g. ramesh.chandra@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-[#CBD5E1] rounded-lg px-3 py-2 text-sm font-normal text-[#0F172A] focus:outline-none focus:border-[#1E3A8A]"
            />
          </div>

          <div>
            <label className="block text-sm text-[#334155] mb-1.5">
              Plan *
            </label>
            <select
              value={selectedPkgId}
              onChange={(e) => setSelectedPkgId(e.target.value)}
              className="w-full bg-white border border-[#CBD5E1] rounded-lg px-3 py-2 text-sm font-normal text-[#0F172A] focus:outline-none focus:border-[#1E3A8A]"
            >
              {packages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.durationDays}d) — {formatINR(p.pricePaise)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-[#334155] mb-1.5">
              Start date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-white border border-[#CBD5E1] rounded-lg px-3 py-2 text-sm font-normal text-[#0F172A] focus:outline-none focus:border-[#1E3A8A]"
            />
          </div>
        </div>

        {/* Payment details */}
        <div className="p-4 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl space-y-3">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#0F172A]">
            <input
              type="checkbox"
              checked={markPaid}
              onChange={(e) => setMarkPaid(e.target.checked)}
              className="w-4 h-4 rounded text-[#1E3A8A]"
            />
            <span>Cash received now (activate immediately)</span>
          </label>

          {markPaid && (
            <div>
              <label className="block text-sm text-[#334155] mb-1.5">
                Payment Channel
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CASH')}
                  className={`py-2 px-3 text-xs font-bold rounded-lg border transition ${
                    paymentMethod === 'CASH'
                      ? 'bg-[#0F172A] text-white border-[#0F172A]'
                      : 'bg-white border-[#CBD5E1] text-[#0F172A]'
                  }`}
                >
                  Front Desk Settlement (Cash)
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`py-2 px-3 text-xs font-bold rounded-lg border transition ${
                    paymentMethod === 'UPI'
                      ? 'bg-[#0F172A] text-white border-[#0F172A]'
                      : 'bg-white border-[#CBD5E1] text-[#0F172A]'
                  }`}
                >
                  Instant UPI Settlement (QR)
                </button>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm text-[#334155] mb-1.5">
            Desk notes (optional)
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Assigned Locker #14, trainer consultation booked..."
            className="w-full bg-white border border-[#CBD5E1] rounded-lg px-3 py-2 text-xs font-medium text-[#0F172A] focus:outline-none focus:border-[#1E3A8A]"
          />
        </div>

        {selectedPkg && (
          <div className="flex justify-between items-center text-xs p-3 border-t border-[#E2E8F0] font-bold">
            <span className="text-[#475569]">Total</span>
            <span className="text-base font-black text-[#0F172A]">
              {formatINR(selectedPkg.pricePaise)}
            </span>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-[#E2E8F0]">
          <Link
            href="/admin/registrations"
            className="px-4 py-2 bg-white border border-[#CBD5E1] hover:border-[#1E3A8A] rounded-lg text-xs font-bold text-[#0F172A] transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-[#1E3A8A] hover:bg-[#172F73] text-white rounded-lg text-xs font-bold transition shadow-sm"
          >
            {loading ? 'Saving…' : 'Register member'}
          </button>
        </div>
      </form>
    </div>
  );
}
