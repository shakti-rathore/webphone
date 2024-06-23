/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      colors: {
        blue: {
          light: '#ecf5fe',
          DEFAULT: '#2196f3',
          dark: '#0b77cd',
        },
      },
    },
  },

  plugins: [],
};
