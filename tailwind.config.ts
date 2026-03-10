import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        income: { DEFAULT: '#22c55e', light: '#86efac', dark: '#15803d' },
        expense: { DEFAULT: '#ef4444', light: '#fca5a5', dark: '#b91c1c' },
        asset: { DEFAULT: '#3b82f6', light: '#93c5fd', dark: '#1d4ed8' },
      },
    },
  },
  plugins: [],
};

export default config;
