import type { Config } from 'tailwindcss';
import palette from 'tailwindcss/colors';

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
      /* Status colours for the light-theme register + admin screens only
         (success / warning / error / info pills, banners, validation). */
      red: palette.red,
      emerald: palette.emerald,
      amber: palette.amber,
      sky: palette.sky,
      blue: palette.blue,
      purple: palette.purple,
      slate: palette.slate,
      neutral: palette.neutral,
    },
    fontFamily: {
      sans: ['var(--font-sans)'],
      quote: ['var(--font-quote)'],
    },
    /* Three real weights only (400 / 500 / 600 are the cuts loaded).
       bold / extrabold / black collapse onto 600 so every screen shares
       one consistent heading weight instead of faux-bold browser synthesis. */
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '600',
      extrabold: '600',
      black: '600',
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
        logo: '934 / 1024',
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
