/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./views/**/*.ejs"], 
  plugins: [require("daisyui")], 
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/typography'), require('daisyui')],
  daisyui: {
    themes: ['valentine'],
  }
}
