import reactHooks from "eslint-plugin-react-hooks"
import reactRefresh from "eslint-plugin-react-refresh"
import globals from "globals"

import rootConfig from "../../../eslint.config.mjs"

export default [
  ...rootConfig,
  {
    files: ["**/*.{ts,tsx,js,jsx,mjs,cjs}"],
    languageOptions: {
      globals: globals.browser,
    },
  },
  reactHooks.configs.flat.recommended,
  reactRefresh.configs.vite,
]
