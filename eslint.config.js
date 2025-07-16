// eslint.config.js
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import ts from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import prettier from 'eslint-config-prettier'

export default [
    js.configs.recommended,
    {
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            parser: tsParser,
            parserOptions: { ecmaVersion: 2020, sourceType: 'module' },
            globals: globals.browser
        },
        plugins: {
            '@typescript-eslint': ts,
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh
        },
        rules: {
            // 빈 인터페이스 허용
            '@typescript-eslint/no-empty-object-type': 'off',
            // 빈 구조 분해 허용
            'no-empty-pattern': 'off',
            // any 타입 허용
            '@typescript-eslint/no-explicit-any': 'off',
            // 자기 자신에 할당 금지 해제 (필요하다면)
            'no-self-assign': 'off',

            // 나머지 룰들은 원하시는 대로…
            'react-refresh/only-export-components': [
                'warn',
                { allowConstantExport: true },
            ],
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'warn'
        },
    },
    prettier, // 마지막에 Prettier
]
