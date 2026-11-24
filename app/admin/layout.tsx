'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { SUPPLIED } from '@/config/assets';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

function istTime(): string {
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Kolkata',
  }).format(new Date());
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [clock, setClock] = useState<string>('');
  const [, startTransition] = useTransition();

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    setClock(istTime());
    const timer = setInterval(() => setClock(istTime()), 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isLoginPage) {
      setLoading(false);
      return;
    }

    fetch('/api/v1/admin/auth/me')
      .then((res) => {
        if (!res.ok) {
          router.push('/admin/login');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.admin) setAdmin(data.admin);
      })
      .catch(() => router.push('/admin/login'))
      .finally(() => setLoading(false));
  }, [pathname, isLoginPage, router]);

  const handleLogout = async () => {
    await fetch('/api/v1/admin/auth/logout', { method: 'POST' });
    startTransition(() => {
      router.push('/admin/login');
    });
  };

  if (isLoginPage) {
    return <div data-theme="light">{children}</div>;
  }

  if (loading) {
    return (
      <div data-theme="light" className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="flex items-center gap-3 text-xs text-[var(--text-faint)]">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--live)] animate-ping" />
          <span>Authenticating Vyomi Admin Portal...</span>
        </div>
      </div>
    );
  }

  const navLinks = [
    { label: 'Dashboard', href: '/admin', icon: '📊' },
    { label: 'Registrations', href: '/admin/registrations', icon: '📋' },
    { label: 'Payments', href: '/admin/payments', icon: '💳' },
    { label: 'Packages', href: '/admin/packages', icon: '🏷️' },
    { label: 'Coupons', href: '/admin/coupons', icon: '🎟️' },
    { label: 'Staff Accounts', href: '/admin/staff', icon: '👥' },
    { label: 'Audit Log', href: '/admin/audit', icon: '📜' },
  ];

  return (
    <div data-theme="light" className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans flex antialiased">
      {/* Left Sidebar */}
      <aside className="w-60 bg-[var(--surface)] border-r border-[var(--line)] flex flex-col justify-between shrink-0 fixed inset-y-0 left-0 z-30">
        <div>
          {/* Logo & Brand */}
          <div className="h-16 px-5 border-b border-[var(--line)] flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <Image
                src={SUPPLIED.logo.src}
                alt="Vyomi"
                width={56}
                height={28}
                unoptimized
                className="h-7 w-auto"
              />
              <span className="text-[0.6875rem] font-bold tracking-widest text-[var(--text-strong)] uppercase border-l border-[var(--line-2)] pl-2.5">
                Staff Ops
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navLinks.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-[2px] text-xs font-medium transition-all ${
                    active
                      ? 'bg-[var(--surface-2)] text-[var(--text-strong)] shadow-sm'
                      : 'text-[var(--text)] hover:text-[var(--text-strong)] hover:bg-[var(--surface-2)]/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {active && (
                    <span className="w-1.5 h-4 rounded-full bg-gradient-to-b from-[var(--bronze)] to-[var(--live)]" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="p-3 border-t border-[var(--line)] bg-[var(--surface)]">
          <div className="p-2.5 rounded bg-[var(--surface-2)] mb-2 flex items-center justify-between text-xs">
            <div className="truncate pr-2">
              <span className="font-semibold text-[var(--text-strong)] block truncate">
                {admin?.name || 'Administrator'}
              </span>
              <span className="text-[0.625rem] uppercase tracking-wider text-[var(--bronze-text)] font-semibold">
                {admin?.role || 'SUPER_ADMIN'}
              </span>
            </div>
            <span className="w-2 h-2 rounded-full bg-[var(--live)] shrink-0" />
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/register"
              target="_blank"
              className="btn-line-light !h-8 !px-2.5 !text-[0.6875rem] w-1/2 text-center"
            >
              Public Form ↗
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="btn-line-light !h-8 !px-2.5 !text-[0.6875rem] w-1/2 text-[var(--burgundy)] hover:!border-[var(--burgundy)]"
            >
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 pl-60 flex flex-col min-h-screen">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-[var(--line)] bg-[var(--surface)] sticky top-0 z-20 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-wider font-semibold text-[var(--text-strong)]">
              {navLinks.find((l) => l.href === pathname)?.label || 'Administration'}
            </span>
            <span className="text-[var(--line-2)]">/</span>
            <span className="text-xs text-[var(--text-faint)]">Vyomi Luxury Fitness Club</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2 text-[var(--text-faint)]">
              <span>Vijayawada</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--live)]" />
              <span className="nums font-medium text-[var(--text-strong)]">{clock} IST</span>
            </div>

            <Link
              href="/admin/registrations/new"
              className="btn-solid-light !h-8 !px-3 !text-xs !tracking-wider"
            >
              + Walk-in Reg
            </Link>
          </div>
        </header>

        {/* Page Content View */}
        <main className="p-6 sm:p-8 flex-1 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
