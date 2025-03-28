import prettierPlugin from "eslint-plugin-prettier";

export default [
  {
    ignores: [
      "node_modules", // Ignore dependencies
      "dist", // Ignore build output
      "coverage", // Ignore test coverage reports
    ],
    plugins: {
      prettier: prettierPlugin,
    },
    languageOptions: {
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: {
        __dirname: "readonly",
        __filename: "readonly",
        process: "readonly",
        window: "readonly",
        document: "readonly",
      },
    },
    rules: {
      "no-debugger": "error",
      "no-duplicate-case": "error",
      "no-empty": "error",
      "no-ex-assign": "error",
      quotes: [
        "error",
        "double",
        {
          avoidEscape: true,
          allowTemplateLiterals: true,
        },
      ],
      semi: ["error", "always"],
      "no-unused-vars": ["warn"],
      "no-console": ["warn"],
      "prettier/prettier": "error", // Enable Prettier as an ESLint rule
    },
  },
  {
    files: ["**/*.test.js", "**/*.spec.js"],
    languageOptions: {
      globals: {
        describe: "readonly",
        it: "readonly",
        test: "readonly",
        expect: "readonly",
        jest: "readonly",
      },
    },
  },
];
