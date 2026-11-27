'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function FailedContent() {
  const searchParams = useSearchParams();
  const ref = searchParams.get('ref') || undefined;

  return (
    <div className="max-w-md w-full bg-[var(--surface)] border border-[var(--burgundy)] rounded-[2px] p-8 shadow-[var(--shadow-card)] text-center space-y-6">
      <div className="w-14 h-14 mx-auto rounded-full bg-[var(--burgundy-wash)] border border-[var(--burgundy)] flex items-center justify-center text-2xl text-[var(--burgundy)]">
        ✕
      </div>

      <div>
        <h1 className="t-h3 text-[var(--text-strong)] font-semibold">Payment Incomplete</h1>
        <p className="t-small text-[var(--text)] mt-2">
          The transaction was cancelled or declined by your payment provider. Your registration details and selected package have been safely preserved.
        </p>
      </div>

      {ref && (
        <div className="p-3 bg-[var(--surface-2)] border border-[var(--line-2)] rounded text-xs text-[var(--text-faint)]">
          Reference: <span className="font-mono text-[var(--text-strong)] font-medium">{ref}</span>
        </div>
      )}

      <div className="space-y-3 pt-2">
        <Link
          href="/register"
          className="btn-solid-light w-full block text-center"
        >
          Retry Payment & Registration →
        </Link>
        <Link
          href="/"
          className="btn-line-light w-full block text-center"
        >
          Cancel and Return Home
        </Link>
      </div>
    </div>
  );
}

export default function RegisterFailedPage() {
  return (
    <div data-theme="light" className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans antialiased py-16 px-4 flex items-center justify-center">
      <Suspense fallback={<div className="text-xs text-neutral-500">Loading...</div>}>
        <FailedContent />
      </Suspense>
    </div>
  );
}
