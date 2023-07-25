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
        "../node_modules/firecms/src/**/*.{js,ts,jsx,tsx}", // TODO: make sure this is the right path
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
                secondary: "#FF5B79",
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
            },
            // fontSize: {
            //     xs: "0.75rem",
            //     sm: "0.875rem",
            //     base: "1rem",
            //     lg: "1.125rem",
            //     xl: "1.25rem",
            //     "2xl": "1.5rem",
            //     "3xl": "2rem",
            //     "4xl": "2.625rem",
            //     "5xl": "3.25rem",
            //     "6xl": "5.5rem",
            //     "7xl": "7rem",
            //     "8xl": "10rem"
            // },
            // letterSpacing: {
            //     tighter: "-0.02em",
            //     tight: "-0.01em",
            //     normal: "0",
            //     wide: "0.01em",
            //     wider: "0.02em",
            //     widest: "0.4em"
            // },
            // lineHeight: {
            //     none: "1",
            //     tighter: "1.125",
            //     tight: "1.25",
            //     snug: "1.375",
            //     normal: "1.5",
            //     relaxed: "1.625",
            //     loose: "2",
            //     3: ".75rem",
            //     4: "1rem",
            //     5: "1.2rem",
            //     6: "1.5rem",
            //     7: "1.75rem",
            //     8: "2rem",
            //     9: "2.25rem",
            //     10: "2.5rem"
            // }
        }

    },
    variants: {
        extend: {}
    }
};
