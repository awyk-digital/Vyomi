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
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'POS' | 'BANK_TRANSFER'>('POS');
  const [markPaid, setMarkPaid] = useState(true);
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
      const res = await fetch('/api/v1/admin/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client: { fullName, phone, email },
          packageId: selectedPkgId,
          paymentMethod,
          startDate,
          notes,
          markPaid,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error?.message || 'Registration failed');
      } else {
        router.push(`/admin/registrations/${data.registrationRef}`);
      }
    } catch {
      setError('Connection failure');
    } finally {
      setLoading(false);
    }
  };

  const selectedPkg = packages.find((p) => p.id === selectedPkgId);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-[var(--line)] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/admin/registrations" className="text-xs text-[var(--text-faint)] hover:text-[var(--text-strong)]">
              ← Registrations
            </Link>
            <span className="text-[var(--line-2)]">/</span>
            <span className="t-label text-[var(--bronze-text)] uppercase font-semibold">Concierge Desk</span>
          </div>
          <h1 className="t-h2 text-[var(--text-strong)] font-semibold mt-1">
            New Walk-in Registration
          </h1>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-[var(--burgundy-wash)] border border-[var(--burgundy)] text-[var(--burgundy)] rounded text-xs">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-[var(--surface)] border border-[var(--line)] p-6 sm:p-8 rounded-[2px] shadow-[var(--shadow-card)] space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-[var(--text-strong)] mb-1 uppercase tracking-wider">
              Client Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Ramesh Chandra"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="light-input"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-strong)] mb-1 uppercase tracking-wider">
              Mobile Number (+91) *
            </label>
            <input
              type="tel"
              required
              placeholder="10-digit mobile"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="light-input"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-strong)] mb-1 uppercase tracking-wider">
              Email Address (Optional)
            </label>
            <input
              type="email"
              placeholder="client@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="light-input"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-strong)] mb-1 uppercase tracking-wider">
              Selected Package Tier *
            </label>
            <select
              value={selectedPkgId}
              onChange={(e) => setSelectedPkgId(e.target.value)}
              className="light-input"
            >
              {packages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.durationDays}d) — {formatINR(p.pricePaise)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-strong)] mb-1 uppercase tracking-wider">
              Activation Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="light-input"
            />
          </div>
        </div>

        {/* Payment details */}
        <div className="p-4 bg-[var(--surface-2)] border border-[var(--line-2)] rounded space-y-3">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[var(--text-strong)]">
            <input
              type="checkbox"
              checked={markPaid}
              onChange={(e) => setMarkPaid(e.target.checked)}
              className="w-4 h-4 rounded text-[var(--text-strong)]"
            />
            <span>Payment received now at front desk (Activate immediately)</span>
          </label>

          {markPaid && (
            <div>
              <label className="block text-xs font-medium text-[var(--text-faint)] mb-1 uppercase tracking-wider">
                Payment Channel
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['POS', 'CASH', 'BANK_TRANSFER'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPaymentMethod(m)}
                    className={`py-2 px-3 text-xs font-semibold rounded border transition-all ${
                      paymentMethod === m
                        ? 'bg-[var(--text-strong)] text-[var(--bg)] border-[var(--text-strong)]'
                        : 'bg-[var(--surface)] border-[var(--line-2)] text-[var(--text)]'
                    }`}
                  >
                    {m === 'POS' ? 'POS Terminal' : m === 'CASH' ? 'Cash' : 'Bank Transfer'}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--text-strong)] mb-1 uppercase tracking-wider">
            Concierge Notes / Locker Allocation
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Assigned Locker #14, personal trainer consultation booked..."
            className="light-input !h-auto py-2.5 resize-none text-xs"
          />
        </div>

        {selectedPkg && (
          <div className="flex justify-between items-center text-xs p-3 border-t border-[var(--line)]">
            <span className="text-[var(--text-faint)]">Total with 18% GST:</span>
            <span className="nums font-bold text-sm text-[var(--text-strong)]">
              {formatINR(Math.round(selectedPkg.pricePaise * 1.18))}
            </span>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-[var(--line)]">
          <Link href="/admin/registrations" className="btn-line-light">
            Cancel
          </Link>
          <button type="submit" disabled={loading} className="btn-solid-light">
            {loading ? 'Creating...' : 'Enroll Walk-in Member →'}
          </button>
        </div>
      </form>
    </div>
  );
}
