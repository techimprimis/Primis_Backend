module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ],
  env: {
    node: true,
    es2020: true,
  },
  rules: {
    // Naming Conventions
    '@typescript-eslint/naming-convention': [
      'error',
      // Variables: camelCase or UPPER_CASE for constants
      {
        selector: 'variable',
        format: ['camelCase', 'UPPER_CASE'],
        leadingUnderscore: 'allow',
      },
      // Functions: camelCase
      {
        selector: 'function',
        format: ['camelCase'],
      },
      // Parameters: camelCase
      {
        selector: 'parameter',
        format: ['camelCase'],
        leadingUnderscore: 'allow',
      },
      // Class, Interface, Type: PascalCase
      {
        selector: 'typeLike',
        format: ['PascalCase'],
      },
      // Interface must start with I
      {
        selector: 'interface',
        format: ['PascalCase'],
        prefix: ['I'],
      },
      // Enum members: UPPER_CASE
      {
        selector: 'enumMember',
        format: ['UPPER_CASE'],
      },
      // Class methods: camelCase
      {
        selector: 'method',
        format: ['camelCase'],
      },
      // Class properties: camelCase
      {
        selector: 'property',
        format: ['camelCase', 'UPPER_CASE'],
        leadingUnderscore: 'allow',
      },
    ],

    // TypeScript Specific Rules
    '@typescript-eslint/explicit-function-return-type': 'error',
    '@typescript-eslint/explicit-module-boundary-types': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/await-thenable': 'error',
    '@typescript-eslint/no-misused-promises': 'error',
    '@typescript-eslint/require-await': 'error',
    '@typescript-eslint/no-unnecessary-type-assertion': 'error',
    '@typescript-eslint/prefer-nullish-coalescing': 'warn',
    '@typescript-eslint/prefer-optional-chain': 'error',
    '@typescript-eslint/strict-boolean-expressions': 'warn',

    // General Best Practices
    'no-console': 'warn',
    'eqeqeq': ['error', 'always'],
    'curly': ['error', 'all'],
    'no-var': 'error',
    'prefer-const': 'error',
    'no-throw-literal': 'error',
    'no-return-await': 'error',
    'require-await': 'off', // Using @typescript-eslint/require-await instead
  },
  ignorePatterns: ['dist', 'node_modules', '*.js'],
};
