/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      backgroundSize: {
        '300%': '300%',
      },
      colors: {
        primary: {
          DEFAULT: '#7C3AED', // violet-600
          light: '#A78BFA', // violet-400
          dark: '#5B21B6', // violet-800
          foreground: '#ffffff',
        },
        brand: {
          blue: '#60A5FA', // blue-400
          purple: '#A78BFA', // violet-400
          indigo: '#818CF8', // indigo-400
          lavender: '#C4B5FD', // violet-300
          teal: '#5EEAD4', // teal-300
        },
        surface: {
          light: '#F9FAFB', // gray-50
          dark: '#1F2937', // gray-800
        },
      },
      boxShadow: {
        glow: '0 10px 25px -5px rgba(124,58,237,0.35), 0 8px 10px -6px rgba(96,165,250,0.35)',
        'glow-lg': '0 20px 35px -10px rgba(124,58,237,0.4), 0 10px 20px -5px rgba(96,165,250,0.4)',
        'inner-glow': 'inset 0 2px 4px 0 rgba(124,58,237,0.1)',
        card: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
      borderRadius: {
        lg: '0.5rem',
        xl: '1rem',
        '2xl': '1.5rem',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        pulse: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.7 },
        },
        fadeInUp: {
          '0%': { opacity: 0, transform: 'translateY(12px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        fadeInLeft: {
          '0%': { opacity: 0, transform: 'translateX(-12px)' },
          '100%': { opacity: 1, transform: 'translateX(0)' },
        },
        fadeInRight: {
          '0%': { opacity: 0, transform: 'translateX(12px)' },
          '100%': { opacity: 1, transform: 'translateX(0)' },
        },
        gradient: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        scale: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        pulse: 'pulse 3s ease-in-out infinite',
        fadeInUp: 'fadeInUp .6s ease-out both',
        fadeInLeft: 'fadeInLeft .6s ease-out both',
        fadeInRight: 'fadeInRight .6s ease-out both',
        gradient: 'gradient 8s ease infinite',
        shimmer: 'shimmer 2.5s linear infinite',
        scale: 'scale 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};


