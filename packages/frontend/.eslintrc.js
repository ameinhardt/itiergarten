module.exports = {
  extends: [
    '@ameinhardt/eslint-config/vue'
  ],
  ignorePatterns: ['components.d.ts'],
  rules: {
    'no-console': ['warn', { allow: ['log', 'debug', 'info', 'warn', 'error'] }]
  }
};
