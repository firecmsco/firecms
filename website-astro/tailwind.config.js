import fireCMSConfig from "@firecms/ui/tailwind.config.js";

export default {
    presets: [fireCMSConfig],
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./samples/**/*.{js,ts,jsx,tsx}",
        "../packages/**/src/**/*.{js,ts,jsx,tsx}",
        "../**/node_modules/@firecms/**/src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: [
                    "Rubik", "Roboto", "Helvetica", "Arial", "sans-serif"
                ],
                headers: [
                    "Rubik", "Roboto", "Helvetica", "Arial", "sans-serif"
                ],
                mono: [
                    "JetBrains Mono", "Space Mono", "Lucida Console", "monospace"
                ]
            },
            colors: {
                "primary": "var(--fcms-primary)",
                "primary-bg": "var(--fcms-primary-bg)",
                "secondary": "var(--fcms-secondary)",
                "field": {
                    "disabled": "#E0E0E2",
                    "disabled-dark": "#232325"
                },
                "text": {
                    "primary": "#15151B",        // deep Mux neutral
                    "secondary": "#51515d",
                    "disabled": "rgba(0,0,0,0.32)", // more muted than 0.38!
                    "primary-dark": "#fff",
                    "secondary-dark": "rgba(255,255,255,0.65)", // slightly stronger than your 0.60
                    "disabled-dark": "rgba(255,255,255,0.43)"   // slightly muted
                },
                "gray": {
                    "50": "#fafafa",   // lightest surface for sections
                    "100": "#f5f5f1",  // your putty (great for light backgrounds/strips)
                    "200": "#ededed",  // barely darker, for subtle offset
                    "300": "#E7E7EB",  // section border/line
                    "400": "#A0A0A9",
                    "500": "#87878F",
                    "600": "#6B6B74",
                    "700": "#414148",
                    "800": "#242430",
                    "900": "#18181C",
                    "950": "#101013"
                },
                "surface-accent": {
                    "50": "#fcfcfc",
                    "100": "#f1f5f9",
                    "200": "#e3e7ee",
                    "300": "#cfd5e4",
                    "400": "#b3bbc8",
                    "500": "#8f98b2",
                    "600": "#606375",
                    "700": "#38415c",
                    "800": "#232336",
                    "900": "#161624",
                    "950": "#020617"
                }
            }
        }
    }
};
