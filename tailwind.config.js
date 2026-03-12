/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Bebas Neue', 'cursive'],
        tech: ['Jura', 'sans-serif'],
        space: ['Inter', 'sans-serif'],
      },
      colors: {
        accent: '#00ffcc',
        obsidian: '#000000',
        charcoal: '#080808',
      },
      animation: {
        'pulse-slow': 'pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
