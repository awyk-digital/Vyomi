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
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--line)] pb-5">
        <div>
          <span className="t-label text-[var(--bronze-text)] uppercase tracking-wider font-semibold">
            Product Configuration
          </span>
          <h1 className="t-h2 text-[var(--text-strong)] font-semibold mt-1">
            Membership Packages ({packages.length})
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-2 py-12 text-center text-xs text-[var(--text-faint)]">
            Loading packages...
          </div>
        ) : (
          packages.map((pkg) => {
            const isEditing = editingId === pkg.id;
            return (
              <div
                key={pkg.id}
                className="bg-[var(--surface)] border border-[var(--line)] p-6 rounded-[2px] shadow-[var(--shadow-card)] flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="t-label text-[var(--text-faint)] uppercase text-[0.625rem]">
                      Slug: {pkg.slug}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleActive(pkg)}
                      className={`px-2 py-0.5 rounded text-[0.625rem] font-bold uppercase tracking-wider border cursor-pointer ${
                        pkg.isActive
                          ? 'border-[var(--success)] text-[var(--success)]'
                          : 'border-[var(--text-faint)] text-[var(--text-faint)]'
                      }`}
                    >
                      {pkg.isActive ? 'Active' : 'Disabled'}
                    </button>
                  </div>

                  {isEditing ? (
                    <div className="space-y-3 mt-3">
                      <div>
                        <label className="text-[0.6875rem] font-medium text-[var(--text-faint)] uppercase block">
                          Tier Name
                        </label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="light-input !h-8 text-xs font-semibold"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[0.6875rem] font-medium text-[var(--text-faint)] uppercase block">
                            Price (₹)
                          </label>
                          <input
                            type="number"
                            value={editPriceRupees}
                            onChange={(e) => setEditPriceRupees(Number(e.target.value))}
                            className="light-input !h-8 text-xs font-semibold"
                          />
                        </div>
                        <div>
                          <label className="text-[0.6875rem] font-medium text-[var(--text-faint)] uppercase block">
                            Duration (Days)
                          </label>
                          <input
                            type="number"
                            value={editDays}
                            onChange={(e) => setEditDays(Number(e.target.value))}
                            className="light-input !h-8 text-xs font-semibold"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2">
                      <h3 className="t-h3 text-[var(--text-strong)] font-semibold">
                        {pkg.name} Tier
                      </h3>
                      <div className="mt-1 flex items-baseline gap-2">
                        <span className="nums text-2xl font-bold text-[var(--text-strong)]">
                          {formatINR(pkg.pricePaise)}
                        </span>
                        <span className="text-xs text-[var(--text-faint)]">
                          / {pkg.durationDays} days
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-[var(--line)]">
                    <span className="text-[0.6875rem] font-semibold text-[var(--text-faint)] uppercase tracking-wider block mb-2">
                      Included Privileges
                    </span>
                    <ul className="space-y-1.5 text-xs text-[var(--text)]">
                      {pkg.benefits.map((b, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-[var(--bronze)] font-bold">✓</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-[var(--line)]">
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="btn-line-light !h-8 !px-3 text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSave(pkg.id)}
                        className="btn-solid-light !h-8 !px-4 text-xs"
                      >
                        Save Tier
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleStartEdit(pkg)}
                      className="btn-line-light !h-8 !px-3 text-xs"
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
