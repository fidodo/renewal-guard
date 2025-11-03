// .eslintrc.cjs
module.exports = {
  extends: ["next/core-web-vitals", "@typescript-eslint/recommended"],
  ignorePatterns: ["jest.setup.cjs"],
  rules: {
    "@typescript-eslint/no-var-requires": "off",
  },
  overrides: [
    {
      files: ["jest.config.mjs", "jest.setup.cjs", "**/__test__/**/*"],
      rules: {
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-unused-vars": "off",
      },
    },
  ],
};
