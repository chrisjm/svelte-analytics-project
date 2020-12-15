module.exports = {
  scripts: {},
  plugins: [
    '@snowpack/plugin-svelte',
    '@snowpack/plugin-typescript',
    '@snowpack/plugin-dotenv',
    '@snowpack/plugin-postcss',
  ],
  mount: {
    public: '/',
    src: '/_dist_',
  },
  alias: {
    '@carevoyance/components': './src/components',
    '@carevoyance/charts': './src/charts',
    '@carevoyance/ui': './src/ui',
    '@carevoyance/ts-types': './src/ts-types',
  },
  proxy: {
    '/api': `http://localhost:${process.env.API_PORT}`,
  },
  devOptions: {
    output: 'stream',
  },
};
