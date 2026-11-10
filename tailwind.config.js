/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#020003',
        card: '#0b0b11',
        techverse: {
          bg: '#020003',
          card: '#0b0b11',
          pink: '#ff8cb8',
          fuchsia: '#d45d8c',
          violet: '#e293e0',
          purple: '#a855f7',
          cyan: '#00f0ff',
        },
        navy: {
          950: '#020003',
          900: '#050308',
          850: '#08050e',
          800: '#0b0b11',
          700: '#14101e',
          600: '#1e182e',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Syne', 'Inter', 'sans-serif'],
        heading: ['Syne', 'Inter', 'sans-serif'],
        condensed: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'glow-fuchsia': '0 0 35px -5px rgba(212, 93, 140, 0.45)',
        'glow-fuchsia-lg': '0 0 60px -10px rgba(212, 93, 140, 0.65)',
        'glow-violet': '0 0 35px -5px rgba(168, 85, 247, 0.45)',
        'glow-cyan': '0 0 30px -5px rgba(0, 240, 255, 0.45)',
      },
      animation: {
        'marquee': 'marquee 25s linear infinite',
        'marquee-reverse': 'marqueeReverse 25s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        marqueeReverse: {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0%)' },
        },
      }
    },
  },
  plugins: [],
}
