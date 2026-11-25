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
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error?.message || 'Invalid credentials');
      } else {
        router.push('/admin');
      }
    } catch {
      setError('Connection failure. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('vyomi2026');
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[var(--surface)] border border-[var(--line)] rounded-[2px] p-8 sm:p-10 shadow-[var(--shadow-card)] space-y-6">
        <div className="text-center">
          <Link href="/" className="inline-block">
            <Image
              src={SUPPLIED.logo.src}
              alt="Vyomi"
              width={80}
              height={40}
              unoptimized
              className="h-10 w-auto mx-auto"
            />
          </Link>
          <h1 className="t-h3 text-[var(--text-strong)] mt-4 font-semibold">
            Club Staff Portal
          </h1>
          <p className="t-small text-[var(--text-faint)] mt-1">
            Sign in with your verified staff credentials to manage client memberships and operations.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-[var(--burgundy-wash)] border border-[var(--burgundy)] text-[var(--burgundy)] rounded text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--text-strong)] mb-1 uppercase tracking-wider">
              Staff Email Address
            </label>
            <input
              type="email"
              required
              placeholder="admin@vyomi.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="light-input"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-strong)] mb-1 uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="light-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-solid-light w-full mt-2"
          >
            {loading ? 'Authenticating...' : 'Sign In to Dashboard →'}
          </button>
        </form>

        {/* Demo Credentials Quick Selector */}
        <div className="pt-4 border-t border-[var(--line)]">
          <span className="text-[0.6875rem] font-semibold text-[var(--text-faint)] uppercase tracking-wider block mb-2">
            Quick Demo Accounts:
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoFill('admin@vyomi.com')}
              className="text-[0.6875rem] py-1 px-2 border border-[var(--line-2)] rounded bg-[var(--surface-2)] text-[var(--text-strong)] hover:border-[var(--text-strong)]"
            >
              Super Admin
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('manager@vyomi.com')}
              className="text-[0.6875rem] py-1 px-2 border border-[var(--line-2)] rounded bg-[var(--surface-2)] text-[var(--text-strong)] hover:border-[var(--text-strong)]"
            >
              Manager
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('frontdesk@vyomi.com')}
              className="text-[0.6875rem] py-1 px-2 border border-[var(--line-2)] rounded bg-[var(--surface-2)] text-[var(--text-strong)] hover:border-[var(--text-strong)]"
            >
              Front Desk
            </button>
          </div>
          <span className="text-[0.625rem] text-[var(--text-faint)] block text-center mt-2">
            Password: <code>vyomi2026</code>
          </span>
        </div>
      </div>
    </div>
  );
}
