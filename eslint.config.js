// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    rules: {
      quotes: ["error", "single", { avoidEscape: true }],
    },
  },
  {
    // Manual Jest mocks for node_modules packages (see __mocks__/expo-sqlite.js) aren't matched by
    // eslint-config-expo's own `**/*.test.*` jest-globals override, so `jest` needs declaring here.
    files: ["__mocks__/**/*.js"],
    languageOptions: {
      globals: {
        jest: "readonly",
      },
    },
  },
]);
