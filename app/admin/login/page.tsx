'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { SUPPLIED } from '@/config/assets';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/v1/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error?.message || 'Invalid credentials. Access denied.');
      } else {
        router.push('/admin');
      }
    } catch {
      setError('Secure connection failure. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border-2 border-[#CBD5E1] rounded-2xl p-8 sm:p-10 shadow-sm space-y-6">
        <div className="text-center">
          <Link href="/admin" className="inline-block">
            <Image
              src={SUPPLIED.logo.src}
              alt="Vyomi Fitness Club"
              width={110}
              height={44}
              unoptimized
              className="h-10 w-auto mx-auto brightness-90"
            />
          </Link>
          <span className="text-[11px] font-extrabold text-[#D97706] uppercase tracking-widest block mt-3">
            Concierge & Operations Portal
          </span>
          <h1 className="text-xl font-black text-[#0F172A] mt-1 tracking-tight">
            Staff Authentication Terminal
          </h1>
          <p className="text-xs font-semibold text-[#64748B] mt-1.5 leading-relaxed">
            Authorized personnel access for member registry management, front desk settlements, and operational telemetry.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-300 text-red-900 rounded-lg text-xs font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold text-[#0F172A] mb-1.5 uppercase tracking-wider">
              Staff Email Address
            </label>
            <input
              type="email"
              required
              placeholder="e.g. staff.id@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border-2 border-[#CBD5E1] rounded-lg px-3.5 py-2.5 text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#D97706]"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-[#0F172A] mb-1.5 uppercase tracking-wider">
              Staff Security Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border-2 border-[#CBD5E1] rounded-lg px-3.5 py-2.5 text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#D97706]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-lg text-xs font-extrabold uppercase tracking-wide transition shadow-sm disabled:opacity-50 mt-2"
          >
            {loading ? 'Authenticating Secure Session...' : 'Authenticate & Enter Portal →'}
          </button>
        </form>

        <div className="pt-4 border-t border-[#E2E8F0] text-center">
          <span className="text-[11px] text-[#94A3B8] font-bold block">
            Vyomi Fitness Club · Patamata, Vijayawada · Secure Ops
          </span>
        </div>
      </div>
    </div>
  );
}
