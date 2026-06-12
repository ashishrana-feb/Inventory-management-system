/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          500: '#4361ee',
          600: '#3a54d4',
          700: '#2f44b0',
        },
        accent: {
          400: '#f72585',
          500: '#e5177a',
        },
        surface: '#0f172a',
        'surface-2': '#1e293b',
        'surface-3': '#334155',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
