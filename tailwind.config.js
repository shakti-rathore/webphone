/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      colors: {
        teal: {
          light: '#64ffda',
          DEFAULT: '#1de9b6',
          dark: '#00bfa5',
        },
      },
    },
  },

  plugins: [],
};
