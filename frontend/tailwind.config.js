/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: { 950: '#081127', 900: '#0b1636', 800: '#132147' },
        brand: { 50: '#eef5ff', 100: '#d9e9ff', 500: '#2870ed', 600: '#1558d6', 700: '#1347ae' },
      },
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
      boxShadow: { soft: '0 10px 30px rgba(30, 55, 95, 0.08)' },
    },
  },
  plugins: [],
}
