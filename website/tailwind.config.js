const fireCMSTailwindConfig = {
    mode: "jit",
    darkMode: ["class", "[data-theme=\"dark\"]"],
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "../**/node_modules/@firecms/**/src/**/*.{js,ts,jsx,tsx}",
    ],
    corePlugins: { preflight: false },
    theme: {
        extend: {
            colors: {
                primary: "#0070F4",
                secondary: "#ff5064",
                error: "#F44336",
                light: "#e4e1dd",
                lighter: "#f8f8fc",
                outline: "#828c97",
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
                },
                blue: {
                    100: "#E6F0FD",
                    200: "#CCE2FC",
                    300: "#99C5FA",
                    400: "#66A9F7",
                    500: "#338CF5",
                    600: "#0070F4",
                    700: "#0064DA",
                    800: "#0059C2",
                    900: "#004391"
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
