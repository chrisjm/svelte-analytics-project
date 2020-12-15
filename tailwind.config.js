module.exports = {
  purge: {
    content: ['./src/**/*.svelte', './src/**/*.html'],
    options: {
      defaultExtractor: (content) =>
        [...content.matchAll(/(?:class:)*([\w\d-/:%.]+)/gm)].map(
          ([_match, group, ..._rest]) => group
        ),
      keyframes: true,
    },
  },
  theme: {},
  variants: {},
  plugins: [
    require('@tailwindcss/forms'),
    // require('@tailwindcss/ui')
  ],
};
