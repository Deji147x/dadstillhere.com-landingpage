import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Base colors - Warm palette
        cream: {
          50: '#FFFAF7',
          100: '#F5F1ED',
          200: '#EBE5DE',
          300: '#E1D9CF',
          400: '#D7CCC0',
        },
        ivory: {
          50: '#FFFEF9',
          100: '#FFF8F5',
          200: '#FFEEE5',
          300: '#FFE4D5',
          400: '#FFDAC5',
        },
        navy: {
          50: '#F0F3F8',
          100: '#D9E2F0',
          200: '#B3C5E0',
          300: '#8CA8D0',
          400: '#668BC0',
          500: '#4070B0',
          600: '#1A2847',
          700: '#152038',
          800: '#101829',
          900: '#0B1119',
        },
        charcoal: {
          50: '#F7F7F7',
          100: '#EFEFEF',
          200: '#DFDFDF',
          300: '#CFCFCF',
          400: '#BFBFBF',
          500: '#999999',
          600: '#666666',
          700: '#4D4D4D',
          800: '#333333',
          900: '#2D2D2D',
        },
        // Accent colors
        teal: {
          50: '#F0F8F6',
          100: '#D1F0ED',
          200: '#A3E1DB',
          300: '#75D2CA',
          400: '#4A9B8E',
          500: '#2E6B5E',
          600: '#224D44',
        },
        sage: {
          50: '#F4F8F6',
          100: '#E0EAE5',
          200: '#C1D5CB',
          300: '#A2C0B1',
          400: '#7B9B7F',
          500: '#5A7C62',
          600: '#455D4B',
        },
        gold: {
          50: '#FEFBF5',
          100: '#FCF3E6',
          200: '#F9E7CD',
          300: '#F5DBB4',
          400: '#D4A574',
          500: '#B8894D',
          600: '#9C6F3D',
        },
        sand: {
          50: '#FEFDF9',
          100: '#F8F4ED',
          200: '#F1E9DB',
          300: '#EADED9',
          400: '#E8D5C4',
          500: '#D9BFAD',
          600: '#CAA896',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      fontSize: {
        xs: ['12px', { lineHeight: '16px', letterSpacing: '0.5px' }],
        sm: ['14px', { lineHeight: '20px', letterSpacing: '0.25px' }],
        base: ['16px', { lineHeight: '24px', letterSpacing: '0px' }],
        lg: ['18px', { lineHeight: '28px', letterSpacing: '0px' }],
        xl: ['20px', { lineHeight: '28px', letterSpacing: '0px' }],
        '2xl': ['24px', { lineHeight: '32px', letterSpacing: '0px' }],
        '3xl': ['30px', { lineHeight: '36px', letterSpacing: '-0.5px' }],
        '4xl': ['36px', { lineHeight: '44px', letterSpacing: '-0.5px' }],
        '5xl': ['48px', { lineHeight: '56px', letterSpacing: '-1px' }],
        '6xl': ['60px', { lineHeight: '72px', letterSpacing: '-1px' }],
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        '2xl': '32px',
        '3xl': '48px',
        '4xl': '64px',
      },
      borderRadius: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        warm: '0 10px 30px rgba(212, 165, 116, 0.15)',
        soft: '0 8px 24px rgba(26, 40, 71, 0.08)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'slide-in': 'slideIn 0.6s ease-out',
        'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
  ],
};

export default config;
