/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,ts,jsx,tsx,mdx}",
      "./app/**/*.{js,ts,jsx,tsx,mdx}",
      "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
      extend: {
        fontFamily: {
            montserrat: ['var(--font-montserrat)'],
            raleway: ['var(--font-raleway)'],
            'open-sans': ['var(--font-open-sans)'],
            nunito: ['var(--font-nunito)'],
            roboto: ['var(--font-roboto)'],
        },
        animation: {
          'fade-in': 'fade-in 1s ease forwards',
          'fade-up': 'fade-up 1s ease forwards',
          'marquee': 'marquee var(--duration) linear infinite',
          'marquee-vertical': 'marquee-vertical var(--duration) linear infinite',
          'shimmer': 'shimmer 8s infinite',
          'spin': 'spin 1s linear infinite',
        },
        keyframes: {
          'fade-in': {
            '0%': {
              opacity: '0',
              transform: 'translateY(-10px)',
            },
            '100%': {
              opacity: '1',
              transform: 'none',
            },
          },
          'fade-up': {
            '0%': {
              opacity: '0',
              transform: 'translateY(20px)',
            },
            '100%': {
              opacity: '1',
              transform: 'none',
            },
          },
          'shimmer': {
            '0%, 90%, 100%': {
              'background-position': 'calc(-100% - var(--shimmer-width)) 0',
            },
            '30%, 60%': {
              'background-position': 'calc(100% + var(--shimmer-width)) 0',
            },
          },
          'marquee': {
            '0%': {
              transform: 'translateX(0)',
            },
            '100%': {
              transform: 'translateX(calc(-100% - var(--gap)))',
            },
          },
          'marquee-vertical': {
            '0%': {
              transform: 'translateY(0)',
            },
            '100%': {
              transform: 'translateY(calc(-100% - var(--gap)))',
            },
          },
          'spin': {
            '0%': {
              transform: 'rotate(0deg)',
            },
            '100%': {
              transform: 'rotate(360deg)',
            },
          },
        },
      },
    },
    plugins: [],
  };
  