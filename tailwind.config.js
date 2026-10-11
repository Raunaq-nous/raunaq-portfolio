/** @type {import('tailwindcss').Config} */
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`;

module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-body)'],
        display: ['var(--font-display)'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        // `ink` is the surface, `paper` the foreground. Their values swap with the mode.
        ink: { DEFAULT: v('ink'), 2: v('ink-2'), 3: v('ink-3') },
        paper: v('paper'),
        grey: { 1: v('grey-1'), 2: v('grey-2'), 3: v('grey-3'), 4: v('grey-4') },
        line: v('line'),
      },
      letterSpacing: {
        label: '0.14em',
      },
    },
  },
  plugins: [],
};
