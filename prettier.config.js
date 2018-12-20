module.exports = {
  singleQuote: true,
  bracketSpacing: true,
  tabWidth: 2,
  useTabs: false,
  jsxBracketSameLine: false,
  semi: true,
  printWidth: 140,
  trailingComma: 'es5',
  overrides: [
    {
      files: '**/*.{gql,graphql,graphql.ts}',
      options: {
        parser: 'graphql'
      }
    },
    {
      files: '**/*.{js,jsx}',
      options: {
        parser: 'flow'
      }
    },
    {
      files: '**/*.{ts,tsx}',
      options: {
        parser: 'typescript'
      }
    },
    {
      files: '**/*.json',
      options: {
        parser: 'json'
      }
    }
  ]
}
