import react from "eslint-plugin-react";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

const __filename = fileURLToPath(import.meta.url);

export default [
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    {

        files: ["**/*.{js,jsx,mjs,cjs,ts,tsx}"],
        plugins: {
            react,
        },

        languageOptions: {
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
            globals: {
                // ...globals.browser,
            },

            ecmaVersion: "latest",
            sourceType: "module",
        },

        settings: {
            react: {
                version: "18",
            },
        },

        rules: {
            "no-undef": "off",
            "space-before-function-paren": 0,
            "react/prop-types": 0,
            "react/jsx-handler-names": 0,
            "react/jsx-fragments": 0,
            "react/no-unused-prop-types": 0,
            "react/react-in-jsx-scope": "off",
            "import/export": 0,
            "no-use-before-define": "off",
            "no-empty-pattern": "off",
            "no-unused-vars": "warn",
            "no-shadow": "warn",
            "padded-blocks": "off",
            "brace-style": "off",
            curly: "off",
            semi: 0,
            "key-spacing": "warn",
            "no-trailing-spaces": "warn",
            "comma-dangle": "warn",
            "no-multi-spaces": "warn",
            "comma-spacing": "warn",
            "keyword-spacing": "warn",
            "no-multiple-empty-lines": "warn",
            "object-curly-spacing": ["warn", "always"],
            "multiline-ternary": "off",
            "space-before-blocks": "warn",
            "object-property-newline": "warn",
            "eol-last": "warn",
            "spaced-comment": "off",
            indent: [0, 4],

            quotes: [1, "double", {
                avoidEscape: true,
            }],

            // "react-hooks/rules-of-hooks": "error",
            // "react-hooks/exhaustive-deps": "warn",
            "@typescript-eslint/no-unused-vars": "warn",
            "@typescript-eslint/no-empty-function": "warn",
            "@typescript-eslint/no-inferrable-types": "warn",
            "@typescript-eslint/ban-ts-comment": "warn",
            "@typescript-eslint/ban-types": "warn",
            "@typescript-eslint/no-explicit-any": "off",
        },
    }];
