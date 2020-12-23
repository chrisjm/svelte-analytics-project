module.exports = {
  // NOTE: Let's not purge during development
  // purge: {
  //   content: ['./src/**/*.svelte', './src/**/*.html'],
  //   options: {
  //     defaultExtractor: (content) =>
  //       [...content.matchAll(/(?:class:)*([\w\d-/:%.]+)/gm)].map(
  //         ([_match, group, ..._rest]) => group
  //       ),
  //     keyframes: true,
  //   },
  // },
  theme: {
    extend: {
      colors: {
        purple: {
          25: '#f5f5fa',
        },
        gray: {
          150: '#efeff2',
        },
      },
    },
  },
  variants: {},
  plugins: [
    require('@tailwindcss/forms'),
    // require('@tailwindcss/ui')
  ],
};
