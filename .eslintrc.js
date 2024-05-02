module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  parserOptions: {
    parser: '@babel/eslint-parser',
    requireConfigFile: false,
  },
  extends: [
    'plugin:prettier/recommended',
    'eslint:recommended',
    'plugin:node/recommended',
  ],
  plugins: ['prettier'],
  rules: {
    "max-len": ["error", { "code": 10000 }],
    "no-var": "error",
    'prettier/prettier': ['error', {}, { usePrettierrc: true }],
    quotes: ['error', 'backtick'],
    // quotes: ['error', 'double'],
  },
}
