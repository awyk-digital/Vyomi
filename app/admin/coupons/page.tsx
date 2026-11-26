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
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
        <div>
          <span className="text-[11px] font-extrabold text-[#D97706] uppercase tracking-wider block">
            Promotional Engine
          </span>
          <h1 className="text-base sm:text-lg font-extrabold text-[#0F172A] mt-0.5 tracking-tight">
            Voucher & Coupon Codes ({coupons.length})
          </h1>
        </div>

        <button
          type="button"
          onClick={() => setShowAdd(!showAdd)}
          className="px-3.5 py-1.5 bg-[#D97706] hover:bg-[#B45309] text-white rounded-lg text-xs font-bold transition shadow-sm"
        >
          {showAdd ? 'Cancel' : '+ Create Voucher'}
        </button>
      </div>

      {showAdd && (
        <form
          onSubmit={handleCreateCoupon}
          className="bg-white border-2 border-[#CBD5E1] p-5 rounded-xl shadow-sm space-y-4 max-w-xl"
        >
          <h3 className="text-sm font-extrabold text-[#0F172A] border-b border-[#E2E8F0] pb-2">
            Create Promotional Coupon
          </h3>

          {error && <div className="text-xs font-bold text-red-600">{error}</div>}

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1 uppercase tracking-wider">
                Coupon Code *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. FESTIVE20"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full bg-white border-2 border-[#CBD5E1] rounded px-3 py-2 text-xs font-bold uppercase text-[#0F172A] focus:outline-none focus:border-[#D97706]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1 uppercase tracking-wider">
                Discount Mechanism
              </label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as 'PERCENT' | 'FLAT')}
                className="w-full bg-white border-2 border-[#CBD5E1] rounded px-3 py-2 text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#D97706]"
              >
                <option value="PERCENT">Percentage (%)</option>
                <option value="FLAT">Flat Rupee Amount (₹)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1 uppercase tracking-wider">
                {discountType === 'PERCENT' ? 'Percentage (e.g. 10%)' : 'Flat Amount (₹)'} *
              </label>
              <input
                type="number"
                required
                value={discountValue}
                onChange={(e) => setDiscountValue(Number(e.target.value))}
                className="w-full bg-white border-2 border-[#CBD5E1] rounded px-3 py-2 text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#D97706]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1 uppercase tracking-wider">
                Max Allowed Redemptions
              </label>
              <input
                type="number"
                value={maxUses}
                onChange={(e) => setMaxUses(Number(e.target.value))}
                className="w-full bg-white border-2 border-[#CBD5E1] rounded px-3 py-2 text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#D97706]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="px-3 py-1.5 bg-white border border-[#CBD5E1] hover:border-[#D97706] rounded text-xs font-bold text-[#0F172A]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#D97706] hover:bg-[#B45309] text-white rounded text-xs font-bold"
            >
              Save Voucher Code
            </button>
          </div>
        </form>
      )}

      <div className="bg-white border-2 border-[#CBD5E1] rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#F8FAFC] border-b-2 border-[#CBD5E1] text-[#0F172A] uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4 font-extrabold">Code</th>
              <th className="py-3 px-4 font-extrabold">Benefit</th>
              <th className="py-3 px-4 font-extrabold">Redemption Count</th>
              <th className="py-3 px-4 font-extrabold">Max Uses</th>
              <th className="py-3 px-4 font-extrabold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-[#64748B] font-medium">
                  Loading vouchers...
                </td>
              </tr>
            ) : coupons.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-[#64748B] font-medium">
                  No vouchers created yet.
                </td>
              </tr>
            ) : (
              coupons.map((c) => (
                <tr key={c.id} className="hover:bg-[#F8FAFC] transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#0F172A] tracking-wider">
                    {c.code}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-[#D97706]">
                    {c.discountType === 'PERCENT' ? `${c.discountValue}% Off` : `₹${(c.discountValue / 100).toLocaleString('en-IN')} Flat Off`}
                  </td>
                  <td className="py-3.5 px-4 text-[#0F172A] font-semibold">
                    {c.usedCount} times
                  </td>
                  <td className="py-3.5 px-4 text-[#475569]">
                    {c.maxUses ? `${c.maxUses} max` : 'Unlimited'}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider border ${
                        c.isActive
                          ? 'border-emerald-300 text-emerald-900 bg-emerald-100'
                          : 'border-slate-300 text-slate-700 bg-slate-100'
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
