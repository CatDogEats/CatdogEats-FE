// eslint.config.js
import { defineFlatConfig } from 'eslint-define-config'
import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import prettier from 'eslint-config-prettier'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'

export default defineFlatConfig({
    ignores: ['dist'],

    // 1) 어떤 파일에 적용할지
    files: ['**/*.{js,jsx,ts,tsx}'],

    // 2) 기본 설정들
    languageOptions: {
        parser: tsParser,
        parserOptions: {
            ecmaVersion: 2020,
            sourceType: 'module',
            ecmaFeatures: { jsx: true },
        },
        globals: { ...globals.browser, ...globals.node },
    },

    // 3) 사용할 플러그인
    plugins: {
        react,
        '@typescript-eslint': tsPlugin,
        'react-hooks': reactHooks,
        'react-refresh': reactRefresh,
    },

    // 4) 확장할 룰셋
    extends: [
        js.configs.recommended,
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
        'plugin:react-refresh/recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended',
    ],

    // 5) 추가/오버라이드 룰
    rules: {
        // TS 빈 인터페이스는 끄기
        '@typescript-eslint/no-empty-interface': 'off',
        // 구조분해 빈 패턴 허용
        'no-empty-pattern': 'off',
        // any는 경고 수준
        '@typescript-eslint/no-explicit-any': 'warn',
        // 사용 안 하는 변수는 경고
        '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
        // React Hooks 의존성은 에러
        'react-hooks/exhaustive-deps': 'error',
        // React Refresh
        'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },

    // 6) TSX 전용 오버라이드
    overrides: [
        {
            files: ['*.jsx', '*.tsx'],
            rules: {
                'react/prop-types': 'off', // TS로 타입 검증하므로 prop-types 불필요
            },
        },
    ],
})
