// eslint.config.js
import js from '@eslint/js'
import globals from 'globals'
import ts from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import prettier from 'eslint-config-prettier'

/** @type {import('eslint').FlatConfig[]} */
export default [
    // 1) 기본 JS 추천 설정
    js.configs.recommended,

    // 2) TS 추천 설정
    ...ts.configs.recommended,

    // 3) 언어 옵션 (ES2021, 모듈, 브라우저+Node 전역)
    {
        languageOptions: {
            ecmaVersion: 2021,
            sourceType: 'module',
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
    },

    // 4) React-hooks 플러그인 룰
    {
        plugins: {
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
        },
        rules: {
            ...reactHooks.configs.recommended.rules,
            'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
        },
    },

    {
        rules: {
            '@typescript-eslint/no-unused-vars': 'warn',
            '@typescript-eslint/no-explicit-any': 'warn',
        },
    },

    // 6) Prettier (마지막에 배치)
    prettier,
]
