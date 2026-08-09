/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6D5DFB',
          dark: '#5546D8',
          light: '#8F83FC',
          soft: '#F0EDFF',
        },
        ink: {
          DEFAULT: '#17172B',
          soft: '#6B6B80',
        },
        lavender: {
          50: '#F7F5FF',
          100: '#F0ECFE',
          200: '#E9E6F5',
        },
        success: {
          DEFAULT: '#16A34A',
          soft: '#E7F7EE',
        },
        warning: {
          DEFAULT: '#B45309',
          soft: '#FDF3E3',
        },
        error: {
          DEFAULT: '#DC2626',
          soft: '#FDEBEB',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 12px rgba(23, 23, 43, 0.06)',
        card: '0 6px 24px -6px rgba(109, 93, 251, 0.14)',
        lift: '0 14px 34px -10px rgba(85, 70, 216, 0.28)',
        glow: '0 0 0 4px rgba(109, 93, 251, 0.18)',
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.35s ease-out both',
        'scale-in': 'scale-in 0.25s ease-out both',
      },
    },
  },
  plugins: [],
}