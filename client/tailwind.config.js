import colors from 'tailwindcss/colors';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      white: colors.white,
      black: colors.black,
      gray: colors.slate,
      red: colors.red,
      amber: colors.amber,
      green: colors.emerald,
      brand: {
        DEFAULT: '#5E6AD2',
        50: '#EEF0FF',
        100: '#E1E4FF',
        200: '#C7CCFF',
        600: '#5E6AD2',
        700: '#4F58C9'
      }
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};
