module.exports = {
    darkMode: ["class", '[data-theme="dark"]'],
    content: ["./src/**/*.html", "./src/**/*.js", "./src/**/*.tsx"],
    // important: '#tailwind',
    corePlugins: { preflight: false },
    theme: {
        extend: {
            colors: {
                primary: "#0070F4",
                secondary: "#FF5B79",
                gray: {
                    100: "#FBFBFA",
                    200: "#eaeff8",
                    300: "#DFDFEA",
                    400: "#9999A7",
                    500: "#7F7F9B",
                    600: "#666673",
                    700: "#4C4C5A",
                    800: "#333337",
                    900: "#202024"

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
            maxWidth: {
                '7xl': '85rem',
            },
            boxShadow: {
                xs: "0 0 0 1px rgba(0, 0, 0, 0.16)",
                sm: "0 1px 2px 0 rgba(0, 0, 0, 0.16)",
                default: "0 1px 3px 0 rgba(0, 0, 0, 0.12), 0 1px 2px 0 rgba(0, 0, 0, 0.03)",
                md: "0 4px 6px -1px rgba(0, 0, 0, 0.04), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
                lg: "0 10px 15px -3px rgba(0, 0, 0, 0.04), 0 4px 6px -2px rgba(0, 0, 0, 0.02)",
                xl: "0 20px 25px -5px rgba(0, 0, 0, 0.12), 0 10px 10px -5px rgba(0, 0, 0, 0.02)",
                "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.20)",
                inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.04)",
                outline: "0 0 0 3px rgba(66, 153, 225, 0.5)",
                none: "none"
            },
            spacing: {
                "9/16": "56.25%",
                "3/4": "75%",
                "1/1": "100%"
            },
            fontFamily: {
                inter: ["Inter", "sans-serif"]
            },
            fontWeight: {
                thin: "100",
                extralight: "200",
                light: "300",
                normal: "400",
                medium: "500",
                semibold: "600",
                bold: "700",
                extrabold: "800",
                black: "900",
            },
            fontSize: {
                xs: "0.75rem",
                sm: "0.875rem",
                base: "1rem",
                lg: "1.125rem",
                xl: "1.25rem",
                "2xl": "1.5rem",
                "3xl": "2rem",
                "4xl": "2.625rem",
                "5xl": "3.25rem",
                "6xl": "5.5rem",
                "7xl": "7rem",
                "8xl": "10rem",
            },
            inset: {
                "1/2": "50%",
                "full": "100%"
            },
            letterSpacing: {
                tighter: "-0.02em",
                tight: "-0.01em",
                normal: "0",
                wide: "0.01em",
                wider: "0.02em",
                widest: "0.4em"
            },
            lineHeight: {
                none: "1",
                tighter: "1.125",
                tight: "1.25",
                snug: "1.375",
                normal: "1.5",
                relaxed: "1.625",
                loose: "2",
                "3": ".75rem",
                "4": "1rem",
                "5": "1.2rem",
                "6": "1.5rem",
                "7": "1.75rem",
                "8": "2rem",
                "9": "2.25rem",
                "10": "2.5rem"
            },
            opacity: {
                "90": "0.9"
            },
            scale: {
                "98": ".98"
            },
            animation: {
                float: "float 3s ease-in-out infinite"
            },
            keyframes: {
                float: {
                    "0%, 100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(-5%)" }
                }
            }
        }
    },
    variants: {
        backgroundColor: ["responsive", "hover", "dark"],
        textColor: ["responsive", "hover", "dark"],
        outline: ["responsive", "hover", "dark"],
        translate: ["responsive", "hover", "dark"],
        boxShadow: ["responsive", "hover", "focus", "focus-within", "dark"],
        opacity: ["responsive", "hover", "dark"],
        fontSize: ["responsive", "hover", "dark"],
    },
    plugins: []
}
