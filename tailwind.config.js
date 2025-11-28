/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'neo-red': '#FF0000',
        'neo-yellow': '#FFFF00',
        'neo-cyan': '#00FFFF',
        'neo-magenta': '#FF00FF',
        'neo-lime': '#00FF00',
        'neo-black': '#000000',
        'neo-white': '#FFFFFF',
      },
      fontFamily: {
        heading: ['"Archivo Black"', 'sans-serif'],
        body: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      boxShadow: {
        'neo': '8px 8px 0px 0px #000000',
        'neo-lg': '12px 12px 0px 0px #000000',
        'neo-sm': '4px 4px 0px 0px #000000',
      },
      borderWidth: {
        '3': '3px',
        '6': '6px',
      }
    },
  },
  plugins: [],
}
