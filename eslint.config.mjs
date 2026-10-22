import js from '@eslint/js'
import tsParser from '@typescript-eslint/parser'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'
import prettierRecommended from 'eslint-plugin-prettier/recommended'
import globals from 'globals'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const eslintConfig = [
  {
    ignores: [
      'node_modules/**',
      'playwright-report/**',
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts'
    ]
  },
  js.configs.recommended,
  ...nextVitals,
  ...nextTypescript,
  prettierRecommended,
  {
    files: [
      'src/contexts/GameContext.tsx',
      'src/contexts/ThemeContext.tsx',
      'src/contexts/ZoomContext.tsx'
    ],
    rules: {
      // Preserve existing post-hydration storage reads and state synchronization.
      'react-hooks/set-state-in-effect': 'off'
    }
  },
  {
    languageOptions: {
      globals: {
        ...globals.node,
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly'
      },
      parser: tsParser,
      ecmaVersion: 2023,
      sourceType: 'module',
      parserOptions: {
        project: ['tsconfig.eslint.json'],
        tsconfigRootDir: __dirname
      }
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: 'tsconfig.eslint.json'
        }
      }
    },
    rules: {
      camelcase: 'off',
      'eslint-comments/no-use': 'off',
      'eslint-comments/no-unused-disable': 'off',
      'i18n-text/no-en': 'off',
      'import/no-namespace': 'off',
      'no-console': 'off',
      'no-shadow': 'off',
      'no-unused-vars': 'off',
      'prettier/prettier': 'error'
    }
  }
]

export default eslintConfig
