module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/vue3-essential',
    '@vue/standard'
  ],
  parserOptions: {
    parser: '@babel/eslint-parser'
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'vue/multi-word-component-names': 'off',
    'comma-dangle': 'off',
    'space-before-function-paren': 'off',
    'semi': 'off',
    'no-unused-vars': 'off',
    'quotes': 'off',
    'object-curly-spacing' : 'off',
    'padded-blocks': 'off',
    'prefer-const': 'off',
    'no-trailing-spaces': 'off',
    'no-multiple-empty-lines': 'off',
    'keyword-spacing': 'off',
    'space-in-parens': 'off',
    'camelcase': 'off',
    'no-empty': 'off',
    'indent': 'off'
  }
}
