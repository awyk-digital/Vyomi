import type { SVGProps } from 'react';

/**
 * 1px Hairline Minimalist Icons for V CLUB
 * Hand-crafted SVG strokes with 1px width, no rounded corners, no cartoon aesthetics.
 */

export function ArrowUpRight(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="square"
      strokeLinejoin="miter"
      {...props}
    >
      <path d="M2.5 11.5L11.5 2.5" />
      <path d="M4 2.5H11.5V10" />
    </svg>
  );
}

export function ArrowDown(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="square"
      strokeLinejoin="miter"
      {...props}
    >
      <path d="M7 2V12" />
      <path d="M2.5 7.5L7 12L11.5 7.5" />
    </svg>
  );
}

export function CloseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="square"
      {...props}
    >
      <path d="M2 2L12 12" />
      <path d="M12 2L2 12" />
    </svg>
  );
}

export function MenuIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="18"
      height="12"
      viewBox="0 0 18 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="square"
      {...props}
    >
      <path d="M0 1H18" />
      <path d="M0 6H18" />
      <path d="M0 11H18" />
    </svg>
  );
}

export function PlusIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="square"
      {...props}
    >
      <path d="M6 1V11" />
      <path d="M1 6H11" />
    </svg>
  );
}

