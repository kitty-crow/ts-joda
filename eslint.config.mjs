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
    rules: style,
};

export default tseslint.config(
    {
        ignores: [
            '**/node_modules/**',
            '**/.build/**',
            '**/build/**',
            '**/dist/**',
            'docs/**',
            'packages/locale/packages/**',
        ],
    },
    {
        files: ['**/*.{js,cjs,mjs}'],
        extends: [js.configs.recommended],
        ...base,
    },
    {
        files: ['**/*.{ts,cts,mts}'],
        extends: [js.configs.recommended, ...tseslint.configs.recommended],
        ...base,
        rules: {
            ...style,
            'no-undef': 'off',
        },
    },
);
