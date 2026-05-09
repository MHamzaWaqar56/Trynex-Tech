
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        primary: {
          DEFAULT: '#00D4FF',
          50: '#E5FAFF',
          100: '#CCF5FF',
          200: '#99EBFF',
          300: '#66E0FF',
          400: '#33D9FF',
          500: '#00D4FF',
          600: '#00AACC',
          700: '#007F99',
          800: '#005566',
          900: '#002A33',
        },
        dark: {
          DEFAULT: '#0C1324',
          card: '#F8FAFC',
          border: '#E2E8F0',
          muted: '#64748B',
        },
        accent: {
          DEFAULT: '#00D4FF',
          light: '#33D9FF',
          dark: '#00AACC',
        },
      },
      boxShadow: {
        'card': '0 2px 16px rgba(0,0,0,0.08)',
        'card-hover': '0 8px 40px rgba(0,212,255,0.15)',
        'btn': '0 4px 20px rgba(0,212,255,0.3)',
        'btn-hover': '0 8px 30px rgba(0,212,255,0.45)',
        'nav': '0 2px 20px rgba(0,0,0,0.08)',
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease forwards',
        'fade-in': 'fadeIn 0.5s ease forwards',
        'float': 'float 6s ease-in-out infinite',
        'marquee': 'marquee 25s linear infinite',
        'slide-in-left': 'slideInLeft 0.6s ease forwards',
        'slide-in-right': 'slideInRight 0.6s ease forwards',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'gradient-shift': 'gradientShift 8s ease infinite',
        'counter': 'counter 2s ease forwards',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      backgroundImage: {
        'grid-pattern': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300D4FF' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};




