/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          50: '#fbf1ec',
          100: '#f5ded2',
          200: '#eab99e',
          300: '#e2a184',
          400: '#dd8a68',
          500: '#d97757',
          600: '#c1613f',
          700: '#9c4c31',
        },
        ink: {
          bg: '#1e1d1b',
          card: '#26251f',
          subtle: '#2f2e28',
          border: 'rgba(245, 242, 235, 0.08)',
        }
      }
    },
  },
  plugins: [],
}
