import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import prettierConfig from 'eslint-config-prettier'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      // Строгая проверка зависимостей в хуках (useEffect, useCallback, useMemo)
      // Проверяет, что все зависимости указаны в массиве зависимостей
      'react-hooks/exhaustive-deps': 'error',
      // Проверка правил использования хуков (hooks rules)
      'react-hooks/rules-of-hooks': 'error',
    },
  },
  prettierConfig,
])
