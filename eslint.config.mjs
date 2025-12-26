import eslintConfigPrettier from "eslint-config-prettier"
import simpleImportSort from "eslint-plugin-simple-import-sort"
import tseslint from "typescript-eslint"
import js from "@eslint/js"

export default [
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.turbo/**",
      "**/coverage/**",
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ["**/*.{ts,tsx,js,jsx,mjs,cjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      "no-undef": "off",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "no-restricted-imports": [
        "error",
        {
          patterns: ["../src/*", "./src/*"],
        },
      ],
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            // 1️⃣ 3rd-party packages (react, lodash, express, etc.)
            ["^\\w", "^@?\\w"],

            // 2️⃣ internal packages via alias (@/domain, @/api, etc.)
            ["^@/"],

            // 3️⃣ relative imports within package
            ["^\\.", "^\\.\\./"],
          ],
        },
      ],
      "simple-import-sort/exports": "error",
    },
    settings: {
      "import/resolver": {
        typescript: {
          project: "./tsconfig.base.json",
        },
      },
    },
  },

  // Keep Prettier as the single source of formatting truth.
  eslintConfigPrettier,
]
