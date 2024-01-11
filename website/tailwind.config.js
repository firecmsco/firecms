const fireCMSTailwindConfig = {
    mode: "jit",
    darkMode: ["class", "[data-theme=\"dark\"]"],
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "../**/node_modules/firecms/src/**/*.{js,ts,jsx,tsx}",
        "../**/node_modules/@firecms/**/src/**/*.{js,ts,jsx,tsx}",
    ],
    corePlugins: { preflight: true },
    theme: {
        extend: {
            colors: {
                primary: "#0070F4",
                secondary: "#FF5B79",
                error: "#F44336",
                light: "#e6e6e9",
                lighter: "#f8f8fa",
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
                    100: "#e7e7ea",
                    200: "#d3d3d7",
                    300: "#B7B7BF",
                    400: "#A0A0A9",
                    500: "#87878F",
                    600: "#6C6C75",
                    700: "#505058",
                    800: "#35353A",
                    900: "#18181C",
                    950: "#101013"
                },
                pink: {
                    DEFAULT: "#FF5B79",
                    "50": "#FFEAEE",
                    "100": "#FFD5DD",
                    "200": "#FFADBC",
                    "300": "#FF849A",
                    "400": "#FF5B79",
                    "500": "#FF234B",
                    "600": "#EA002B",
                    "700": "#B20021",
                    "800": "#7A0016",
                    "900": "#42000C"
                }
            },
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

        },

    },
    variants: {
        extend: {}
    }
};
module.exports = {
    ...fireCMSTailwindConfig
};
