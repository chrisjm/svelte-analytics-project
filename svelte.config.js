const sveltePreprocess = require('svelte-preprocess');

const preprocess = sveltePreprocess({
  typescript: {
    compilerOptions: {
      importsNotUsedAsValues: 'error',
    },
  },
  postcss: {
    plugins: [require('tailwindcss'), require('autoprefixer')],
  },
});

module.exports = {
  preprocess,
};
