/** @type {import('tailwindcss').Config} */
export default {
    content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        nunito: ['Nunito', 'sans-serif'],
        rubik: ['Rubik', 'sans-serif'],
        quicksand: ['Quicksand', 'sans-serif'],
        manrope: ['Manrope', 'sans-serif'],
        dmsans: ['DM Sans', 'sans-serif'],
        mulish: ['Mulish', 'sans-serif'],
        sora: ['Sora', 'sans-serif'],
      },
      screens: {
        custom: '530px', //this is custom media querry
      },
    },
  },
  plugins: [],
}

