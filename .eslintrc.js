module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    // project: 'tsconfig.json',
    ecmaVersion: 2019,
    sourceType: 'module',
  },
  ignorePatterns: ['**/*.svelte'],
  overrides: [
    {
      files: ['**/*.js'],
      extends: ['eslint:recommended'],
      rules: {
        'no-unused-vars': ['warn', { args: 'none' }],
      },
    },
  ],
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/eslint-recommended',
    'prettier/@typescript-eslint',
  ],
  rules: {
    'prefer-const': ['off'],
  },
};
