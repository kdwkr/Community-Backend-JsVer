module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'airbnb/base',
    'prettier',
    'plugin:prettier/recommended',
  ],
  plugins: [ 'prettier'],
  rules: {
    // 'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    // 'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    indent: 'off',
    'no-param-reassign': 'off',
    'class-methods-use-this': 'off',
    'lines-between-class-members': 'off',
    'no-underscore-dangle': 'off',
    'no-plusplus': 'off',
    'guard-for-in': 'off',
    'no-restricted-syntax': 'off',
    'no-continue': 'off',
    'no-case-declarations': 'off',
    'no-buffer-constructor': 'off',
    'import/no-cycle': 'off',
    'no-nested-ternary': 'off',
    'max-len': 'off',
    'no-console': 'off',
    '@typescript-eslint/interface-name-prefix': 'off',
    'import/prefer-default-export': 'off'
  },
};