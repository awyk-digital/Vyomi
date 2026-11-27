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
        const next = new URLSearchParams(window.location.search).get('next') || '';
        const safeNext = next.startsWith('/') && !next.startsWith('//') && next !== '/admin/login' ? next : '';
        // Front desk only ever registers members; everyone else goes where they were headed.
        const dest = data.admin?.role === 'FRONT_DESK' ? '/register' : safeNext || '/admin';
        window.location.replace(dest);
      }
    } catch {
      setError('Secure connection failure. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6FB] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-[#E3E8F2] rounded-2xl p-7 sm:p-9 shadow-[0_12px_32px_-16px_rgba(15,23,42,0.14)] space-y-5">
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
          <span className="text-[11px] font-medium text-[#1E3A8A] uppercase tracking-[0.18em] block mt-2.5">
            Staff portal
          </span>
          <h1 className="text-xl font-semibold text-[#0F172A] mt-1 tracking-tight">
            Sign in to Vyomi Admin
          </h1>
          <p className="text-xs text-[#64748B] mt-1.5">
            For authorised Vyomi staff only.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-300 text-red-800 rounded-lg text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-[#334155] mb-1.5 tracking-normal">
              Email
            </label>
            <input
              type="email"
              required
              autoComplete="username"
              autoFocus
              placeholder="name@vyomi.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-[#CBD5E1] rounded-lg px-3.5 py-2.5 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/15 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#334155] mb-1.5 tracking-normal">
              Password
            </label>
            <input
              type="password"
              required
              autoComplete="current-password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-[#CBD5E1] rounded-lg px-3.5 py-2.5 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/15 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-white bg-gradient-to-b from-[#2A4FC4] to-[#1E3A8A] hover:to-[#172F73] shadow-[0_8px_20px_-8px_rgba(30,58,138,0.65),inset_0_1px_0_rgba(255,255,255,0.18)] active:translate-y-px rounded-xl text-sm font-medium transition disabled:opacity-50 mt-2"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="pt-4 border-t border-[#E2E8F0] text-center">
          <span className="text-[11px] text-[#94A3B8] block">
            Vyomi Fitness Club · Patamata, Vijayawada
          </span>
        </div>
      </div>
    </div>
  );
}
