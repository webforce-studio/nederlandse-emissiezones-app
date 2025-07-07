/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#5B9BD5', // Main blue from branding
          600: '#4285c4',
          700: '#3b82f6',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        secondary: {
          50: '#f0f9f0',
          100: '#dcf2dc',
          200: '#bae5ba',
          300: '#8fd58f',
          400: '#7CB342', // Main green from branding
          500: '#65a32e',
          600: '#4f8a21',
          700: '#3f6f1c',
          800: '#355c1a',
          900: '#2e4d18',
        },
        accent: {
          light: '#E8F4FD', // Light blue background
          green: '#E8F5E8', // Light green background
        }
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} 