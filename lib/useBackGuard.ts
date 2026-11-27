'use client';

import { useEffect, useRef } from 'react';

/**
 * Keeps the browser Back button inside a section (registration kiosk, admin).
 *
 * On mount it pushes a duplicate of the current history entry (re-using
 * Next.js' own history state so the App Router does not hard-reload). Each
 * Back press then pops onto that duplicate instead of leaving; we re-arm the
 * trap and let the caller decide what Back means (e.g. previous form step).
 *
 * `allowPath` lets in-section history work: if Back lands on a path the
 * caller allows (e.g. another /admin page), navigation proceeds normally.
 * If it lands outside, `onEscape` is called so the caller can send the user
 * back in (router.replace to the last allowed page).
 */
export function useBackGuard(options: {
  onBack?: () => void;
  allowPath?: (path: string) => boolean;
  onEscape?: () => void;
} = {}) {
  const opts = useRef(options);
  opts.current = options;

  useEffect(() => {
    const arm = () => {
      window.history.pushState(window.history.state, '', window.location.href);
    };
    arm();

    const onPop = () => {
      const { onBack, allowPath, onEscape } = opts.current;
      const path = window.location.pathname;
      if (allowPath && !allowPath(path)) {
        onEscape?.();
        return;
      }
      arm();
      onBack?.();
    };

    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
}
