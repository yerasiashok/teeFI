/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cinema: {
          red:    '#C0392B',
          dark:   '#1A0A0A',
          gold:   '#F39C12',
          cream:  '#FDF6E3',
        }
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body:    ['DM Sans', 'sans-serif'],
      }
    }
  },
  plugins: []
}
