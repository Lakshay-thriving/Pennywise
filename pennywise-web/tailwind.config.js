/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'neon-green': '#39FF14',
        'soft-violet': '#8A2BE2',
        'dark-bg': '#121212',
        'card-bg': '#1E1E1E',
      }
    },
  },
  plugins: [],
}
