/* eslint-disable unicorn/prefer-module, eslint-comments/disable-enable-pair */
module.exports = async () => {
  return {
    verbose: true,
    moduleFileExtensions: ['js', 'jsx', 'json', 'ts', 'tsx'],
    collectCoverage: false,
    collectCoverageFrom: ['src/**/*.{ts,js}', '!src/typings/**'],
    transform: {
      '\\.ts$': 'ts-jest'
    },
    coverageThreshold: {
      global: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80
      }
    },
    coverageReporters: ['text', 'text-summary'],
    testRegex: '/tests/.*\\.spec\\.ts$',
    testPathIgnorePatterns: ['/node_modules/', '/dist/', '/coverage/'],
    preset: '@shelf/jest-mongodb',
    setupFiles: ['./tests/setup.js']
  };
};
