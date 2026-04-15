/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary:   { DEFAULT: '#C0392B', light: '#E74C3C', dark: '#922B21' },
        secondary: { DEFAULT: '#1A5276', light: '#2980B9', dark: '#154360' },
        brand: {
          red:   '#C0392B',
          blue:  '#1A5276',
          white: '#FFFFFF',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Arial', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
