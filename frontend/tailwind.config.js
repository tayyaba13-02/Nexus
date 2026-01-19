/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'nexus-tr': '#0f172a', // Slate 900
        'nexus-fg': '#f8fafc', // Slate 50
        'nexus-accent': '#268168', // Brand Emerald
      }
    },
  },
  plugins: [],
}
