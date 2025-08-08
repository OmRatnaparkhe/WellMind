/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366F1', // indigo-500
          foreground: '#ffffff',
        },
        brand: {
          blue: '#60A5FA', // blue-400
          purple: '#A78BFA', // violet-400
        },
      },
      borderRadius: {
        lg: '0.5rem',
      },
    },
  },
  plugins: [],
};


