module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:import/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'prettier', // Turns off ESLint rules that might conflict with Prettier
  ],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['react', 'react-hooks', 'jsx-a11y', 'import', 'prettier'],
  rules: {
    'prettier/prettier': 'error', // Prettier errors show as ESLint errors
    'react/prop-types': 'off', // Disable prop-types if using TypeScript
    'react/react-in-jsx-scope': 'off', // Not needed in React 17+
    'jsx-a11y/no-autofocus': 'warn', // Accessibility improvement
    'import/no-unresolved': 'error', // Helps catch unresolved imports
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }], // Ignore unused vars starting with _
    'no-console': 'warn', // Warn for console logs
    'eqeqeq': ['error', 'always'], // Enforce strict equality
  },
  settings: {
    react: {
      version: 'detect', // Automatically detects the React version
    },
  },
};
