'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function PendingContent() {
  const searchParams = useSearchParams();
  const ref = searchParams.get('ref') || undefined;
  const router = useRouter();
  const [dots, setDots] = useState('');

  useEffect(() => {
    const dotTimer = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);

    const pollTimer = setInterval(async () => {
      if (!ref) return;
      try {
        const res = await fetch(`/api/v1/registrations/${ref}/status`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'CONFIRMED') {
            router.push(`/register/success?ref=${ref}`);
          } else if (data.status === 'FAILED') {
            router.push(`/register/failed?ref=${ref}`);
          }
        }
      } catch {}
    }, 2500);

    return () => {
      clearInterval(dotTimer);
      clearInterval(pollTimer);
    };
  }, [ref, router]);

  return (
    <div className="max-w-md w-full bg-[var(--surface)] border border-[var(--line)] rounded-[2px] p-8 shadow-[var(--shadow-card)] text-center space-y-6">
      <div className="w-14 h-14 mx-auto rounded-full bg-[var(--surface-2)] flex items-center justify-center">
        <span className="w-4 h-4 rounded-full bg-[var(--live)] animate-ping" />
      </div>

      <div>
        <h1 className="t-h3 text-[var(--text-strong)] font-semibold">
          Confirming Payment{dots}
        </h1>
        <p className="t-small text-[var(--text)] mt-2">
          We are waiting for payment gateway confirmation from Razorpay. This can take a few moments for UPI and Netbanking transactions.
        </p>
      </div>

      <div className="p-4 bg-[var(--surface-2)] border border-[var(--line-2)] rounded text-xs text-[var(--text-faint)] space-y-1">
        <p className="font-semibold text-[var(--text-strong)]">Please do not refresh or pay again.</p>
        <p>Your session is active. Once verified, you will be redirected automatically.</p>
      </div>

      {ref && (
        <p className="text-xs font-mono text-[var(--text-faint)]">
          Reference: {ref}
        </p>
      )}

      <div className="pt-2">
        <Link
          href="/"
          className="text-xs text-[var(--text-faint)] hover:text-[var(--text-strong)] underline"
        >
          Leave in background and return home
        </Link>
      </div>
    </div>
  );
}

export default function RegisterPendingPage() {
  return (
    <div data-theme="light" className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans antialiased py-16 px-4 flex items-center justify-center">
      <Suspense fallback={<div className="text-xs text-neutral-500">Checking status...</div>}>
        <PendingContent />
      </Suspense>
    </div>
  );
}
