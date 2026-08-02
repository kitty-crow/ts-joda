import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const env = {
    ...globals.browser,
    ...globals.node,
    ...globals.mocha,
};

const style = {
    eqeqeq: ['error', 'smart'],
    'no-var': 'error',
    'prefer-const': 'error',
    'prefer-template': 'error',
    '@stylistic/indent': ['error', 4, { SwitchCase: 1 }],
    '@stylistic/linebreak-style': ['error', 'unix'],
    '@stylistic/quotes': ['error', 'single', { avoidEscape: true }],
    '@stylistic/semi': ['error', 'always'],
    '@stylistic/array-bracket-spacing': ['error', 'never'],
    '@stylistic/object-curly-spacing': ['error', 'always'],
    '@stylistic/template-curly-spacing': ['error', 'never'],
};

const base = {
    languageOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        globals: env,
    },
    plugins: {
        '@stylistic': stylistic,
    },
};

const unused = {
    args: 'after-used',
    argsIgnorePattern: '^_',
    caughtErrors: 'none',
    ignoreRestSiblings: true,
};

export default tseslint.config(
    {
        ignores: [
            '**/node_modules/**',
            '**/.build/**',
            '**/build/**',
            '**/dist/**',
            '**/tmp/**',
            '**/*.d.ts',
            '**/*.flow.js',
            '**/typings/**',
            '**/test/typescript_definitions/**',
            '**/examples/**',
            'docs/**',
            'packages/core/benchmark/node_modules/**',
            'packages/locale/packages/**',
        ],
    },
    {
        files: ['**/*.{js,cjs,mjs}'],
        extends: [js.configs.recommended],
        ...base,
        linterOptions: {
            reportUnusedDisableDirectives: false,
        },
        rules: {
            ...style,
            'no-unused-vars': ['error', unused],
            'no-useless-assignment': 'off',
        },
    },
    {
        files: ['**/*.{ts,cts,mts}'],
        extends: [js.configs.recommended, ...tseslint.configs.recommended],
        ...base,
        rules: {
            ...style,
            'no-undef': 'off',
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': ['error', unused],
        },
    },
    {
        files: ['**/test/**/*.{js,cjs,mjs}'],
        rules: {
            'no-unused-expressions': 'off',
        },
    },
    {
        files: ['**/test/**/*.{ts,cts,mts}'],
        rules: {
            '@typescript-eslint/no-unused-expressions': 'off',
        },
    },
);
