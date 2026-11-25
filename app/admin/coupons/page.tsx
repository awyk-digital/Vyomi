'use client';

import { useEffect, useState } from 'react';

interface CouponItem {
  id: string;
  code: string;
  discountType: 'PERCENT' | 'FLAT';
  discountValue: number;
  maxUses: number | null;
  usedCount: number;
  validUntil: string | null;
  isActive: boolean;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENT' | 'FLAT'>('PERCENT');
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [maxUses, setMaxUses] = useState<number>(50);
  const [error, setError] = useState('');

  const fetchCoupons = () => {
    fetch('/api/v1/admin/coupons')
      .then((res) => res.json())
      .then((data) => {
        if (data.coupons) setCoupons(data.coupons);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // If FLAT, convert INR to paise
    const value = discountType === 'FLAT' ? discountValue * 100 : discountValue;

    try {
      const res = await fetch('/api/v1/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          discountType,
          discountValue: value,
          maxUses,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error?.message || 'Failed to create coupon');
      } else {
        setShowAdd(false);
        setCode('');
        fetchCoupons();
      }
    } catch {
      setError('Connection failure');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--line)] pb-5">
        <div>
          <span className="t-label text-[var(--bronze-text)] uppercase tracking-wider font-semibold">
            Promotional Engine
          </span>
          <h1 className="t-h2 text-[var(--text-strong)] font-semibold mt-1">
            Voucher & Coupon Codes ({coupons.length})
          </h1>
        </div>

        <button
          type="button"
          onClick={() => setShowAdd(!showAdd)}
          className="btn-solid-light !h-9 !px-4 !text-xs"
        >
          {showAdd ? 'Cancel' : '+ Create Voucher'}
        </button>
      </div>

      {showAdd && (
        <form
          onSubmit={handleCreateCoupon}
          className="bg-[var(--surface)] border border-[var(--line-2)] p-6 rounded-[2px] shadow-[var(--shadow-card)] space-y-4 max-w-xl"
        >
          <h3 className="t-h3 text-[var(--text-strong)] font-semibold border-b border-[var(--line)] pb-2">
            Create Promotional Coupon
          </h3>

          {error && <div className="text-xs text-[var(--burgundy)]">{error}</div>}

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-xs font-medium text-[var(--text-strong)] mb-1 uppercase tracking-wider">
                Coupon Code *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. FESTIVE20"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="light-input uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-strong)] mb-1 uppercase tracking-wider">
                Discount Mechanism
              </label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as 'PERCENT' | 'FLAT')}
                className="light-input"
              >
                <option value="PERCENT">Percentage (%)</option>
                <option value="FLAT">Flat Rupee Amount (₹)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-strong)] mb-1 uppercase tracking-wider">
                {discountType === 'PERCENT' ? 'Percentage (e.g. 10%)' : 'Flat Amount (₹)'} *
              </label>
              <input
                type="number"
                required
                value={discountValue}
                onChange={(e) => setDiscountValue(Number(e.target.value))}
                className="light-input"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-strong)] mb-1 uppercase tracking-wider">
                Max Allowed Redemptions
              </label>
              <input
                type="number"
                value={maxUses}
                onChange={(e) => setMaxUses(Number(e.target.value))}
                className="light-input"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="btn-line-light !h-8 !px-3 text-xs"
            >
              Cancel
            </button>
            <button type="submit" className="btn-solid-light !h-8 !px-4 text-xs">
              Save Voucher Code
            </button>
          </div>
        </form>
      )}

      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[2px] shadow-[var(--shadow-card)] overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[var(--surface-2)] border-b border-[var(--line)] text-[var(--text-faint)] uppercase tracking-wider text-[0.6875rem]">
              <th className="py-3 px-4 font-semibold">Code</th>
              <th className="py-3 px-4 font-semibold">Benefit</th>
              <th className="py-3 px-4 font-semibold">Redemption Count</th>
              <th className="py-3 px-4 font-semibold">Max Uses</th>
              <th className="py-3 px-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--line)]">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-[var(--text-faint)]">
                  Loading vouchers...
                </td>
              </tr>
            ) : coupons.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-[var(--text-faint)]">
                  No vouchers created yet.
                </td>
              </tr>
            ) : (
              coupons.map((c) => (
                <tr key={c.id} className="hover:bg-[var(--surface-2)]/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[var(--text-strong)] tracking-wider">
                    {c.code}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-[var(--bronze-text)]">
                    {c.discountType === 'PERCENT' ? `${c.discountValue}% Off` : `₹${(c.discountValue / 100).toLocaleString('en-IN')} Flat Off`}
                  </td>
                  <td className="py-3.5 px-4 nums text-[var(--text-strong)] font-medium">
                    {c.usedCount} times
                  </td>
                  <td className="py-3.5 px-4 nums text-[var(--text-faint)]">
                    {c.maxUses ? `${c.maxUses} max` : 'Unlimited'}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[0.625rem] font-bold uppercase tracking-wider border ${
                        c.isActive
                          ? 'border-[var(--success)] text-[var(--success)] bg-[var(--surface)]'
                          : 'border-[var(--text-faint)] text-[var(--text-faint)] bg-[var(--surface-2)]'
                      }`}
                    >
                      {c.isActive ? 'Active' : 'Expired'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
