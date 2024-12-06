import fireCMSConfig from "@firecms/ui/tailwind.config.js";

export default {
    presets: [fireCMSConfig],
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./node_modules/@firecms/**/*.{js,ts,jsx,tsx}",

        "../../packages/**/src/**/*.{js,ts,jsx,tsx}",
        "../../node_modules/@firecms/**/src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            typography: {
                DEFAULT: {
                    css: {
                        maxWidth: '100ch', // override the default max-width of prose
                    }
                }
            },
            fontFamily: {
                sans: [
                    "Inter",
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
                    "JetBrains Mono",
                    "Space Mono",
                    "Lucida Console",
                    "monospace"
                ]
            },
            colors: {
                primary: "var(--fcms-primary)",
                "primary-bg": "var(--fcms-primary-bg)",
                secondary: "var(--fcms-secondary)",
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
                surface: {
                    50: "#f8f8fc",
                    100: "#E7E7EB",
                    200: "#CFCFD6",
                    300: "#B7B7BF",
                    400: "#A0A0A9",
                    500: "#87878F",
                    600: "#6C6C75",
                    700: "#505058",
                    800: "#35353A",
                    900: "#18181C",
                    950: "#101013"
                }
            }
        }
    }

};

