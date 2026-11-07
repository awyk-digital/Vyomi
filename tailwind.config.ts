import type { Config } from 'tailwindcss';

/**
 * The colour palette is REPLACED rather than extended, so stray greys
 * (text-gray-400 etc.) fail loudly instead of drifting off-brand.
 * Everything else extends the default scale so ordinary utilities work.
 */
const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './config/**/*.{js,ts}',
  ],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      white: '#FFFFFF',
      ink: 'var(--ink)',
      charcoal: {
        DEFAULT: 'var(--charcoal)',
        2: 'var(--charcoal-2)',
      },
      heading: 'var(--heading)',
      muted: 'var(--muted)',
      faint: 'var(--faint)',
      hairline: {
        DEFAULT: 'var(--hairline)',
        2: 'var(--hairline-2)',
      },
      burgundy: {
        DEFAULT: 'var(--burgundy)',
        dark: 'var(--burgundy-d)',
      },
    },
    fontFamily: {
      sans: ['var(--font-sans)'],
      quote: ['var(--font-quote)'],
    },
    fontWeight: {
      normal: '400',
      medium: '500',
    },
    borderRadius: {
      none: '0px',
      sm: '1px',
      DEFAULT: '2px',
      md: '2px',
      lg: '4px',
      xl: '8px',
      full: '9999px',
    },
    extend: {
      spacing: {
        'pad-x': 'var(--pad-x)',
        'section-y': 'var(--section-y)',
        'logo-w': 'var(--logo-w)',
      },
      maxWidth: {
        shell: '96rem',
        prose: '62ch',
        measure: '46ch',
      },
      letterSpacing: {
        tightest: '-0.03em',
        tighter: '-0.02em',
        label: '0.16em',
      },
      transitionTimingFunction: {
        editorial: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      aspectRatio: {
        logo: '1198 / 1313',
        portrait: '3 / 4',
        card: '4 / 3',
        wide: '16 / 9',
        cinema: '21 / 9',
      },
    },
  },
  plugins: [],
};

export default config;
