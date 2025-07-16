import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

/** @type {import('eslint').FlatConfig[]} */
export default [
    // 1) 기본 ESLint 추천 설정
    js.configs.recommended,

    // 2) TypeScript ESLint 추천 설정
    ...tseslint.configs.recommended,

    // 3) 플러그인별 설정
    {
        plugins: {
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
        },
        rules: {
            ...reactHooks.configs.recommended.rules,
            'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
            '@typescript-eslint/no-unused-vars': 'warn',
            '@typescript-eslint/no-explicit-any': 'warn',
        },
    },

    // 4) 언어 옵션과 전역 설정
    {
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            ecmaVersion: 2021,
            sourceType: 'module',
            env: {
                browser: true,
                node: true,
                es2021: true
            },
            globals: globals.browser,
        },
    },

    // 5) Prettier 충돌 방지
    prettier,
]
