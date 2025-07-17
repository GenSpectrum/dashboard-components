// @ts-check

import { globalIgnores } from 'eslint/config';
import eslint from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import storybook from 'eslint-plugin-storybook';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default tseslint.config(
    globalIgnores(['node_modules/*', '**/custom-elements.json', 'build/*', 'storybook-static/*']),
    {
        extends: [
            eslint.configs.recommended,
            ...tseslint.configs.strictTypeChecked,
            ...tseslint.configs.stylisticTypeChecked,
        ],
        plugins: {
            import: importPlugin,
        },
        languageOptions: {
            globals: {
                ...globals.browser,
            },

            parser: tsParser,
            ecmaVersion: 2020,
            sourceType: 'module',

            parserOptions: {
                projectService: true,
            },
        },

        rules: {
            curly: 'error',
            'no-console': 'error',
            'no-prototype-builtins': 'off',
            'no-useless-constructor': 'off',
            '@typescript-eslint/ban-types': 'off',
            '@typescript-eslint/consistent-type-definitions': 'off',
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/prefer-return-this-type': 'off',
            '@typescript-eslint/no-confusing-void-expression': 'off',
            '@typescript-eslint/no-empty-function': 'off',
            '@typescript-eslint/no-inferrable-types': 'off',
            '@typescript-eslint/no-non-null-assertion': 'off',
            '@typescript-eslint/no-floating-promises': 'error',
            '@typescript-eslint/restrict-template-expressions': 'off',

            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    destructuredArrayIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_',
                },
            ],

            '@typescript-eslint/consistent-type-imports': [
                'error',
                {
                    fixStyle: 'inline-type-imports',
                },
            ],

            'import/no-cycle': 'error',
            'import/no-deprecated': 'error',
            'import/no-extraneous-dependencies': 'off',
            'import/no-internal-modules': 'off',
            'import/order': [
                'error',
                {
                    groups: ['builtin', 'external', 'internal'],
                    'newlines-between': 'always',
                    alphabetize: {
                        order: 'asc',
                    },
                },
            ],
        },
    },

    {
        ...react.configs.flat.recommended,
        rules: {
            ...react.configs.flat.recommended.rules,
            'react/no-unescaped-entities': 'off',
            'react/prop-types': 'off',
            'react/react-in-jsx-scope': 'off',
        },
    },
    reactHooks.configs['recommended-latest'],
    ...storybook.configs['flat/recommended'],

    {
        files: [
            '**/*_test.ts',
            '**/custom_typings/*.ts',
            'packages/labs/ssr/src/test/integration/tests/**',
            'packages/labs/ssr/src/lib/util/parse5-utils.ts',
        ],

        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
        },
    },
    {
        files: ['**/*.stories.*'],

        rules: {
            '@typescript-eslint/no-unsafe-member-access': 'off',
            '@typescript-eslint/no-unsafe-call': 'off',
            '@typescript-eslint/no-unsafe-argument': 'off',
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unsafe-return': 'off',
        },
    },
);
