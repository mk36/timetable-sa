module.exports = {
  content: ['./src/**/*.vue'],
  theme: {
    colors: {
      primary: '#141313',
      // primary: '#414756',
      secondary: 'white',
      accent: '#5D71D9',
      alt: '#F4F5F7',
      danger: '#F04242',
    },
    extend: {
      minHeight: (theme) => ({
        ...theme('spacing'),
      }),
    },
  },
  plugins: [],
};
