/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ikea-blue': '#0051BA',
        'ikea-yellow': '#FFDA1A',
      },
    },
  },
  plugins: [],
}
