'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { SUPPLIED } from '@/config/assets';
import { useBackGuard } from '@/lib/useBackGuard';

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

const SUPER_ONLY_PATHS = ['/admin/staff', '/admin/audit', '/admin/coupons'];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [clock, setClock] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [, startTransition] = useTransition();

  const isLoginPage = pathname === '/admin/login';

  // Browser Back never leaves the admin area. If it ever lands outside
  // /admin, send staff straight back to the last admin page they were on.
  const lastAdminPath = useRef(pathname);
  useEffect(() => {
    if (pathname?.startsWith('/admin')) lastAdminPath.current = pathname;
  }, [pathname]);
  useBackGuard({
    allowPath: (path) => path.startsWith('/admin') && path !== '/admin/login',
    onEscape: () => router.replace(lastAdminPath.current || '/admin'),
  });

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

    const here = window.location.pathname;
    const toLogin = () => window.location.replace(`/admin/login?next=${encodeURIComponent(here)}`);

    fetch('/api/v1/admin/auth/me', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const a = data?.admin as AdminUser | undefined;
        if (!a) return toLogin();
        // Front desk only registers members: never show the admin area.
        if (a.role === 'FRONT_DESK') return window.location.replace('/register');
        // Staff accounts + activity log are Super Admin only.
        if (a.role !== 'SUPER_ADMIN' && SUPER_ONLY_PATHS.some((p) => here.startsWith(p))) {
          router.replace('/admin');
        }
        setAdmin(a);
      })
      .catch(toLogin)
      .finally(() => setLoading(false));
  }, [pathname, isLoginPage]);

  // Session expired in another tab / after 8h: send back to sign-in
  useEffect(() => {
    if (isLoginPage) return;
    const check = () => {
      if (document.visibilityState !== 'visible') return;
      fetch('/api/v1/admin/auth/me', { cache: 'no-store' }).then((r) => {
        if (r.status === 401) {
          window.location.replace(`/admin/login?next=${encodeURIComponent(window.location.pathname)}`);
        }
      }).catch(() => null);
    };
    document.addEventListener('visibilitychange', check);
    const t = setInterval(check, 120000);
    return () => {
      document.removeEventListener('visibilitychange', check);
      clearInterval(t);
    };
  }, [isLoginPage]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await fetch('/api/v1/admin/auth/logout', { method: 'POST' }).catch(() => null);
    window.location.replace('/admin/login');
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-[#64748B]">
          <span className="w-2 h-2 rounded-full bg-[#1E3A8A] animate-pulse" />
          <span>Loading…</span>
        </div>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
        <div className="max-w-sm w-full bg-white border border-[#CBD5E1] rounded-2xl p-6 text-center shadow-sm space-y-4">
          <div className="w-10 h-10 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center mx-auto text-amber-900 text-lg">
            🔒
          </div>
          <div>
            <h2 className="text-base font-black text-[#0F172A]">Staff Authentication Required</h2>
            <p className="text-xs font-semibold text-[#334155] mt-1">
              Please sign in with your staff credentials to access the admin operations portal.
            </p>
          </div>
          <Link
            href="/admin/login"
            className="w-full inline-block py-2.5 px-4 text-white bg-gradient-to-b from-[#2A4FC4] to-[#1E3A8A] hover:to-[#172F73] shadow-[0_8px_20px_-8px_rgba(30,58,138,0.65),inset_0_1px_0_rgba(255,255,255,0.18)] active:translate-y-px rounded-xl text-xs font-medium transition text-center"
          >
            Go to Staff Login →
          </Link>
        </div>
      </div>
    );
  }

  const isSuper = admin.role === 'SUPER_ADMIN';
  const navLinks = [
    { label: 'Dashboard', href: '/admin', icon: 'M3 12l9-8 9 8M5 10v10h14V10' },
    { label: 'Members', href: '/admin/registrations', icon: 'M16 19v-1a4 4 0 00-4-4H7a4 4 0 00-4 4v1M9.5 10a3 3 0 100-6 3 3 0 000 6M21 19v-1a4 4 0 00-3-3.87M16 4.13a3 3 0 010 5.74' },
    { label: 'Payments', href: '/admin/payments', icon: 'M3 7h18v10H3zM3 11h18' },
    { label: 'Plans', href: '/admin/packages', icon: 'M20 12l-8 8-9-9V3h8l9 9zM7.5 7.5h.01' },
    ...(isSuper
      ? [
          { label: 'Staff', href: '/admin/staff', icon: 'M12 11a4 4 0 100-8 4 4 0 000 8M4 21v-1a6 6 0 0112 0v1M18 8v6M21 11h-6' },
          { label: 'Activity log', href: '/admin/audit', icon: 'M12 8v4l3 2M21 12a9 9 0 11-18 0 9 9 0 0118 0' },
        ]
      : []),
  ];
  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname === href || pathname.startsWith(href + '/');
  const roleLabel = admin.role === 'SUPER_ADMIN' ? 'Super Admin' : admin.role === 'MANAGER' ? 'Manager' : 'Front desk';

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans flex flex-col antialiased">
      {/* Mobile Backdrop Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar: Desktop fixed, Mobile slide-in drawer */}
      <aside
        className={`w-64 bg-white border-r border-[#E2E8F0] flex flex-col justify-between shrink-0 fixed inset-y-0 left-0 z-50 transition-transform duration-200 ease-in-out md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Logo & Brand */}
          <div className="h-16 px-5 border-b border-[#E2E8F0] flex items-center justify-between bg-white">
            <Link href="/admin" className="flex items-center gap-2.5">
              <Image
                src={SUPPLIED.logo.src}
                alt="Vyomi"
                width={56}
                height={28}
                unoptimized
                className="h-7 w-auto brightness-90"
              />
              <span className="text-[0.6875rem] font-extrabold tracking-widest text-[#0F172A] uppercase border-l border-[#CBD5E1] pl-2.5">
                Staff Ops
              </span>
            </Link>

            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden w-7 h-7 rounded-full bg-[#F1F5F9] flex items-center justify-center text-xs text-[#334155]"
            >
              ✕
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navLinks.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                    active
                      ? 'bg-[#EEF2FF] text-[#1E3A8A] font-medium'
                      : 'text-[#475569] hover:text-[#0F172A] hover:bg-[#F4F6FB]'
                  }`}
                >
                  <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d={item.icon} /></svg>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="p-3 border-t border-[#E2E8F0] bg-white">
          <div className="p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] mb-2 flex items-center justify-between text-xs">
            <div className="truncate pr-2">
              <span className="font-medium text-sm text-[#0F172A] block truncate">
                {admin?.name || 'Administrator'}
              </span>
              <span className="text-xs text-[#64748B]">{roleLabel}</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/register"
              className="flex-1 h-9 inline-flex items-center justify-center text-xs font-medium bg-white border border-[#E2E8F0] hover:border-[#1E3A8A] text-[#1E3A8A] rounded-lg transition"
            >
              Register member
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex-1 h-9 inline-flex items-center justify-center text-xs font-medium text-red-700 bg-white hover:bg-red-50 border border-red-200 rounded-lg transition"
            >
              Log out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 pl-0 md:pl-64 flex flex-col min-h-screen pb-16 md:pb-0">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-[#E2E8F0] bg-white sticky top-0 z-20 px-4 sm:px-6 flex items-center justify-between shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="flex items-center gap-3">
            {/* Hamburger Button on Mobile */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] text-[#0F172A] text-base hover:bg-white transition"
              aria-label="Open Navigation Menu"
            >
              ☰
            </button>

            <span className="text-sm font-semibold text-[#0F172A]">
              {pathname === '/admin/registrations/new'
                ? 'New walk-in'
                : navLinks.find((l) => isActive(l.href))?.label || 'Admin'}
            </span>
            <span className="hidden sm:inline text-[#94A3B8]">/</span>
            <span className="hidden sm:inline text-xs font-semibold text-[#334155]">
              Vyomi Fitness Club · Patamata
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="hidden sm:flex items-center gap-2 text-[#334155] font-semibold">
              <span>Vijayawada</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="nums font-bold text-[#0F172A]">{clock} IST</span>
            </div>

            <Link
              href="/admin/registrations/new"
              className="bg-[#1E3A8A] hover:bg-[#172F73] text-white text-xs font-bold py-1.5 px-3 rounded-lg transition flex items-center gap-1.5 shadow-sm"
            >
              <span>+</span>
              <span>New walk-in</span>
            </Link>
          </div>
        </header>

        {/* Page Content View */}
        <main className="p-4 sm:p-6 md:p-8 flex-1 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (< md screens) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-[#E2E8F0] h-14 z-30 flex items-center justify-around px-2 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <Link
          href="/admin"
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-bold transition ${
            pathname === '/admin' ? 'text-[#1E3A8A]' : 'text-[#475569] hover:text-[#0F172A]'
          }`}
        >
          <span className="text-base">📊</span>
          <span>Overview</span>
        </Link>
        <Link
          href="/admin/registrations"
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-bold transition ${
            pathname.startsWith('/admin/registrations') && pathname !== '/admin/registrations/new'
              ? 'text-[#1E3A8A]'
              : 'text-[#475569] hover:text-[#0F172A]'
          }`}
        >
          <span className="text-base">📋</span>
          <span>Members</span>
        </Link>
        <Link
          href="/admin/registrations/new"
          className="flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-bold text-[#0F172A]"
        >
          <div className="w-8 h-8 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center -mt-3 shadow-sm">
            +
          </div>
          <span>Walk-in</span>
        </Link>
        <Link
          href="/admin/payments"
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-bold transition ${
            pathname === '/admin/payments' ? 'text-[#1E3A8A]' : 'text-[#475569] hover:text-[#0F172A]'
          }`}
        >
          <span className="text-base">💳</span>
          <span>Payments</span>
        </Link>
      </nav>
    </div>
  );
}
