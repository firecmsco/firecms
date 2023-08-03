/** @type {import("tailwindcss").Config} */
const plugin = require("tailwindcss/plugin")

const fireCMSPlugin = plugin(function ({
                                       matchUtilities,
                                       theme
                                   }) {
    matchUtilities(
        {
            tab: (value) => ({
                tabSize: value
            }),
        },
        { values: theme("tabSize") }
    )
}, {
    darkMode: ["class", "[data-theme=\"dark\"]"],
    theme: {
        tabSize: {
            1: "1",
            2: "2",
            4: "4",
            8: "8",
        }
    }
})

export default {
    darkMode: ["class", "[data-theme=\"dark\"]"],
    mode: "jit",
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "../node_modules/firecms/src/**/*.{js,ts,jsx,tsx}",
        "../node_modules/@firecms/data_enhancement/src/**/*.{js,ts,jsx,tsx}", // TODO: make sure this is the right path
    ],
    plugins: [fireCMSPlugin],
    theme: {
        extend: {
            fontFamily: {
                sans: [
                    "Rubik",
                    "Roboto",
                    "Helvetica",
                    "Arial",
                    "sans-serif"
                ],
                headers: [
                    "Rubik",
                    "Roboto",
                    "Helvetica",
                    "Arial",
                    "sans-serif"
                ],
                mono: [
                    "IBM Plex Mono",
                    "Space Mono",
                    "Lucida Console",
                    "monospace"
                ]
            },
            colors: {
                primary: "#0070F4",
                secondary: "#ff5064",
                error: "#F44336",
                field: {
                    disabled: "rgb(224 224 226)",
                    "disabled-dark": "rgb(35 35 37)"
                },
                text: {
                    primary: "rgba(0, 0, 0, 0.87)",
                    "primary-dark": "#ffffff",
                    secondary: "rgba(0, 0, 0, 0.6)",
                    "secondary-dark": "rgba(255, 255, 255, 0.7)",
                    disabled: "rgba(0, 0, 0, 0.38)",
                    "disabled-dark": "rgba(255, 255, 255, 0.5)",
                    label: "rgb(131, 131, 131)"
                },
                gray: {
                    50: "#f8f8fa",
                    100: "#E7E7E9",
                    200: "#CFCFD3",
                    300: "#B7B7BD",
                    400: "#A0A0A7",
                    500: "#878790",
                    600: "#6C6C75",
                    700: "#505054",
                    800: "#353539",
                    900: "#18181b",
                    950: "#101012"
                }
            }
        }

    },
    variants: {
        extend: {}
    }
};
