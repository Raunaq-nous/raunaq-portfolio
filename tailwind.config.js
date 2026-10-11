/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        ink: {
          DEFAULT: '#090909',
          2: '#101010',
          3: '#161616',
        },
        paper: '#F1F0EC',
        grey: {
          1: '#B9B7B1',
          2: '#8C8A85',
          3: '#5F5E5A',
          4: '#3A3936',
        },
        line: '#242422',
      },
      letterSpacing: {
        label: '0.14em',
      },
    },
  },
  plugins: [],
};
