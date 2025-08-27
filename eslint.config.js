import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import eslintPluginPrettier from 'eslint-plugin-prettier';

export default [
  {
    ignores: [
      'node_modules',
      'dist',
      'coverage',
      'package.json',
      'package-lock.json',
      'serverless.yml',
      'swagger.yml',
      'README.md',
      'tests/**/*.{ts,js}',
    ],
  },
  {
    files: ['src/**/*.{ts,js}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
      },
      globals: {
        process: 'readonly',
        module: 'readonly',
        require: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      prettier: eslintPluginPrettier,
    },
    rules: {
      'prettier/prettier': 'error',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
];
