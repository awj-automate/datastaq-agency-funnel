/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        jakarta: ['var(--font-jakarta)', 'sans-serif'],
      },
      colors: {
        ds: {
          bg: '#E4E4E7',
          surface: '#F4F4F5',
          card: '#FFFFFF',
          border: 'rgba(0,0,0,0.15)',
          primary: '#4D8BFE',
          'primary-light': '#7EB0FF',
          'primary-dark': '#3366FF',
          heading: '#09090B',
          text: '#3F3F46',
          muted: '#71717A',
          subtle: '#A1A1AA',
        },
      },
    },
  },
  plugins: [],
};
