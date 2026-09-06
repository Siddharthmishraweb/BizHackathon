/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Segoe UI"', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Axis Bank inspired palette: deep maroon/burgundy + warm gold accents
        maroon: {
          50: '#fdf2f6',
          100: '#fce7ee',
          200: '#f9cfdd',
          300: '#f3a3bd',
          400: '#e56b93',
          500: '#c93d6d',
          600: '#a91f52',
          700: '#8a1745',
          800: '#6e0f39',
          900: '#4a0a26',
          950: '#2e0619',
        },
        gold: {
          50: '#fdf9ee',
          100: '#faf0d2',
          200: '#f3dea3',
          300: '#eac66a',
          400: '#e0af40',
          500: '#c6952c',
          600: '#a97722',
          700: '#875c1f',
          800: '#6f4a20',
          900: '#5e3f1f',
        },
        ink: {
          50: '#f6f5f7',
          100: '#e8e6ea',
          200: '#cdc9d2',
          300: '#a6a0ac',
          400: '#7b7482',
          500: '#5f5867',
          600: '#4b4553',
          700: '#3d3844',
          800: '#282430',
          900: '#1c1822',
        },
      },
      backgroundImage: {
        'axis-gradient': 'linear-gradient(135deg, #8a1745 0%, #a91f52 45%, #6e0f39 100%)',
        'axis-gradient-soft': 'linear-gradient(135deg, #fdf2f6 0%, #fdf9ee 100%)',
        'gold-gradient': 'linear-gradient(135deg, #eac66a 0%, #c6952c 100%)',
      },
      boxShadow: {
        card: '0 1px 2px rgba(28, 24, 34, 0.04), 0 8px 24px -8px rgba(110, 15, 57, 0.12)',
        'card-hover': '0 4px 12px rgba(28, 24, 34, 0.06), 0 16px 40px -12px rgba(110, 15, 57, 0.22)',
        glow: '0 0 0 4px rgba(169, 31, 82, 0.08)',
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease-out both',
        'fade-in': 'fadeIn 0.4s ease-out both',
        shimmer: 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: 0, transform: 'translateY(12px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
