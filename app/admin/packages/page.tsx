'use client';

import { useEffect, useState } from 'react';

interface PackageItem {
  id: string;
  name: string;
  slug: string;
  durationDays: number;
  pricePaise: number;
  joiningFeePaise: number;
  benefits: string[];
  isActive: boolean;
  sortOrder: number;
}

function formatINR(paise: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(paise / 100);
}

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPriceRupees, setEditPriceRupees] = useState<number>(0);
  const [editDays, setEditDays] = useState<number>(0);
  const [editName, setEditName] = useState<string>('');

  const fetchPackages = () => {
    fetch('/api/v1/admin/packages')
      .then((res) => res.json())
      .then((data) => {
        if (data.packages) setPackages(data.packages);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleStartEdit = (pkg: PackageItem) => {
    setEditingId(pkg.id);
    setEditPriceRupees(pkg.pricePaise / 100);
    setEditDays(pkg.durationDays);
    setEditName(pkg.name);
  };

  const handleSave = async (id: string) => {
    try {
      const res = await fetch('/api/v1/admin/packages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          name: editName,
          pricePaise: editPriceRupees * 100,
          durationDays: editDays,
        }),
      });
      if (res.ok) {
        setEditingId(null);
        fetchPackages();
      } else {
        alert('Failed to update package');
      }
    } catch {
      alert('Network error');
    }
  };

  const handleToggleActive = async (pkg: PackageItem) => {
    try {
      const res = await fetch('/api/v1/admin/packages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: pkg.id,
          isActive: !pkg.isActive,
        }),
      });
      if (res.ok) fetchPackages();
    } catch {
      alert('Error changing status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
        <div>
          <span className="text-[11px] font-extrabold text-[#1E3A8A] uppercase tracking-wider block">
            Product Configuration
          </span>
          <h1 className="text-base sm:text-lg font-extrabold text-[#0F172A] mt-0.5 tracking-tight">
            Official Membership Tiers ({packages.length})
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-3 py-12 text-center text-xs text-[#0F172A] font-bold">
            Loading packages...
          </div>
        ) : (
          packages.map((pkg) => {
            const isEditing = editingId === pkg.id;
            return (
              <div
                key={pkg.id}
                className="bg-white border border-[#CBD5E1] p-5 rounded-xl shadow-sm flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#0F172A] uppercase">
                      ID: {pkg.slug}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleActive(pkg)}
                      className={`px-2.5 py-1 rounded text-xs font-black uppercase tracking-wider border cursor-pointer ${
                        pkg.isActive
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                          : 'border-slate-300 bg-slate-100 text-slate-800'
                      }`}
                    >
                      {pkg.isActive ? 'Active' : 'Disabled'}
                    </button>
                  </div>

                  {isEditing ? (
                    <div className="space-y-3 mt-3">
                      <div>
                        <label className="text-xs font-bold text-[#0F172A] uppercase block mb-1">
                          Tier Name
                        </label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full bg-white border border-[#CBD5E1] rounded px-2.5 py-1.5 text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#1E3A8A]"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs font-bold text-[#0F172A] uppercase block mb-1">
                            Price (₹)
                          </label>
                          <input
                            type="number"
                            value={editPriceRupees}
                            onChange={(e) => setEditPriceRupees(Number(e.target.value))}
                            className="w-full bg-white border border-[#CBD5E1] rounded px-2.5 py-1.5 text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#1E3A8A]"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-[#0F172A] uppercase block mb-1">
                            Duration (Days)
                          </label>
                          <input
                            type="number"
                            value={editDays}
                            onChange={(e) => setEditDays(Number(e.target.value))}
                            className="w-full bg-white border border-[#CBD5E1] rounded px-2.5 py-1.5 text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#1E3A8A]"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3">
                      <h3 className="text-base font-extrabold text-[#0F172A]">
                        {pkg.name}
                      </h3>
                      <div className="mt-1 flex items-baseline gap-2">
                        <span className="text-2xl font-black text-[#0F172A]">
                          {formatINR(pkg.pricePaise)}
                        </span>
                        <span className="text-xs font-bold text-[#0F172A]">
                          / {pkg.durationDays} days
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 pt-3 border-t border-[#E2E8F0]">
                    <span className="text-xs font-black text-[#0F172A] uppercase tracking-wider block mb-2">
                      Official Privileges
                    </span>
                    <ul className="space-y-1.5 text-xs text-[#1E293B]">
                      {pkg.benefits.map((b, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-[#1E3A8A] font-bold">✓</span>
                          <span className="font-medium">{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1 bg-white border border-[#CBD5E1] hover:border-[#1E3A8A] rounded text-xs font-bold text-[#0F172A]"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSave(pkg.id)}
                        className="px-3 py-1 bg-[#1E3A8A] hover:bg-[#172F73] text-white rounded text-xs font-bold"
                      >
                        Save Tier
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleStartEdit(pkg)}
                      className="px-3 py-1.5 bg-white border border-[#CBD5E1] hover:border-[#1E3A8A] rounded text-xs font-bold text-[#0F172A] shadow-sm transition"
                    >
                      ✏️ Edit Pricing & Duration
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
