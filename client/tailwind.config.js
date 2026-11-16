/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      // Tailwind 3.4 не має ступеня xs для backdrop-blur — додаємо для мобільної шторки
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
