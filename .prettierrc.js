module.exports = {
  arrowParens: 'avoid',
  overrides: [
    {
      files: ['.eslintrc', '.babelrc'],
      options: {
        parser: 'json',
        semi: false,
        tabWidth: 2,
        trailingComma: 'none',
      },
    },
    {
      files: ['.editorconfig'],
      options: {
        parser: 'yaml',
      },
    },
  ],
  printWidth: 120,
  singleQuote: true,
  trailingComma: 'es5',
};
