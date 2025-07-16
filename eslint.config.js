// eslint.config.js
import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

/** @type {import('eslint').FlatConfig[]} */
export default [
    // 1) 자바스크립트 기본 추천 설정
    js.configs.recommended,

    // 2) 타입스크립트 추천 설정
    ...tseslint.configs.recommended,

    // 3) 전역환경 정의 (Node, Browser) 및 언어 옵션
    {
        env: {
            browser: true,
            node: true,
            es2021: true,
        },
        languageOptions: {
            ecmaVersion: 2021,
            sourceType: 'module',
            globals: globals.browser,
        },
    },

    // 4) 플러그인 및 룰
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

    // 5) Prettier 설정 (충돌 방지)
    prettier,
]
