/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        bg: {
          primary: '#0a0f1e',
          secondary: '#111827',
          card: '#1a2035',
          tag: '#0f1e3a',
        },
        accent: {
          DEFAULT: '#2563EB',
          dark: '#1d4ed8',
          light: '#3b82f6',
          muted: '#60a5fa',
        },
        text: {
          primary: '#f0f0ec',
          secondary: '#9ca3af',
          muted: '#6b7280',
        },
        border: {
          DEFAULT: '#1f2d45',
          hover: '#2563EB',
        },
      },
    },
  },
  plugins: [],
};
