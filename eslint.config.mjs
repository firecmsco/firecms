import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";
import tseslint from "typescript-eslint";

/** @type {import("eslint").Linter.Config[]} */
export default [
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    pluginReact.configs.flat.recommended,
    {

        files: ["**/*.{js,jsx,mjs,cjs,ts,tsx}"],

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
            "no-useless-escape": "off",
            "space-before-function-paren": 0,
            "react/prop-types": 0,
            "react/jsx-handler-names": 0,
            "react/jsx-fragments": 0,
            "react/no-unused-prop-types": 0,
            "react/react-in-jsx-scope": "off",
            "import/export": 0,
            "no-use-before-define": "off",
            "no-empty-pattern": "off",
            "no-unused-vars": ["warn", {
                "argsIgnorePattern": "^_",
                "varsIgnorePattern": "^_",
                "caughtErrorsIgnorePattern": "^_"
            }],
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
            "@typescript-eslint/no-unused-vars": ["warn", {
                "argsIgnorePattern": "^_",
                "varsIgnorePattern": "^_",
                "caughtErrorsIgnorePattern": "^_"
            }],
            "@typescript-eslint/no-empty-function": "warn",
            "@typescript-eslint/no-inferrable-types": "warn",
            "@typescript-eslint/ban-ts-comment": "warn",
            "@typescript-eslint/no-explicit-any": "off",
        }
    }
];
