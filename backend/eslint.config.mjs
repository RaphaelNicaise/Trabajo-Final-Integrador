import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import jestPlugin from 'eslint-plugin-jest';

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ["**/*.ts", "**/*.tsx"],
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.jest,
            },
            parserOptions: {
                project: './tsconfig.json',
            },
        },
        rules: {
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }]
        }
    },
    {
        files: ['tests/**/*.ts', 'tests/**/*.tsx', 'tests/**/*.js'],
        ...jestPlugin.configs['flat/recommended'],
        rules: {
            ...jestPlugin.configs['flat/recommended'].rules,
            "@typescript-eslint/no-require-imports": "off"
        }
    },
    {
        files: ['src/middleware/auth.middleware.ts'],
        rules: {
            "@typescript-eslint/no-namespace": "off"
        }
    },
    {
        ignores: ['dist', 'node_modules', 'coverage', '*.js', '*.mjs']
    }
);
