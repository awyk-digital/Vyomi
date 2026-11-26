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
        setError(data.error?.message || 'Invalid email or password.');
      } else {
        router.push('/admin');
      }
    } catch {
      setError('Connection failure. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword('vyomi2026');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border-2 border-[#CBD5E1] rounded-2xl p-8 sm:p-10 shadow-sm space-y-6">
        <div className="text-center">
          <Link href="/admin" className="inline-block">
            <Image
              src={SUPPLIED.logo.src}
              alt="Vyomi"
              width={100}
              height={40}
              unoptimized
              className="h-10 w-auto mx-auto brightness-90"
            />
          </Link>
          <span className="text-[11px] font-extrabold text-[#D97706] uppercase tracking-widest block mt-2">
            Patamata, Vijayawada
          </span>
          <h1 className="text-xl font-black text-[#0F172A] mt-1 tracking-tight">
            Club Staff Operations Portal
          </h1>
          <p className="text-xs font-semibold text-[#475569] mt-1">
            Sign in with authorized staff credentials to manage client intake, verification, and records.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-300 text-red-900 rounded-lg text-xs font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#0F172A] mb-1 uppercase tracking-wider">
              Staff Email Address
            </label>
            <input
              type="email"
              required
              placeholder="e.g. admin@vyomi.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border-2 border-[#CBD5E1] rounded-lg px-3.5 py-2.5 text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#D97706]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0F172A] mb-1 uppercase tracking-wider">
              Staff Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border-2 border-[#CBD5E1] rounded-lg px-3.5 py-2.5 text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#D97706]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-lg text-xs font-bold transition shadow-sm disabled:opacity-50 mt-2"
          >
            {loading ? 'Authenticating Staff...' : 'Sign In to Portal →'}
          </button>
        </form>

        {/* 3 Authorized Staff Login Roles */}
        <div className="pt-4 border-t border-[#E2E8F0]">
          <span className="text-[11px] font-extrabold text-[#334155] uppercase tracking-wider block mb-2 text-center">
            Authorized Staff Roles (Click to Autofill):
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('admin@vyomi.com')}
              className="text-[11px] py-1.5 px-2 border-2 border-[#CBD5E1] rounded-lg bg-[#F8FAFC] text-[#0F172A] hover:border-[#D97706] font-bold text-center"
            >
              Super Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('manager@vyomi.com')}
              className="text-[11px] py-1.5 px-2 border-2 border-[#CBD5E1] rounded-lg bg-[#F8FAFC] text-[#0F172A] hover:border-[#D97706] font-bold text-center"
            >
              Manager
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('frontdesk@vyomi.com')}
              className="text-[11px] py-1.5 px-2 border-2 border-[#CBD5E1] rounded-lg bg-[#F8FAFC] text-[#0F172A] hover:border-[#D97706] font-bold text-center"
            >
              Front Desk
            </button>
          </div>
          <div className="text-[11px] text-[#64748B] text-center mt-2 font-semibold">
            Default Authorized Password: <code className="font-bold text-[#D97706]">vyomi2026</code>
          </div>
        </div>
      </div>
    </div>
  );
}
