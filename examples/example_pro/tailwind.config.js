import fireCMSConfig from "@firecms/ui/tailwind.config.js";

export default {
    presets: [fireCMSConfig],
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "../../packages/**/src/**/*.{js,ts,jsx,tsx}",
        "../../node_modules/@firecms/**/src/**/*.{js,ts,jsx,tsx}",
    ],
    // theme: {
    //     extend: {
    //         fontFamily: {
    //             sans: [
    //                 "Roboto",
    //                 "Helvetica",
    //                 "Arial",
    //                 "sans-serif"
    //             ],
    //             headers: [
    //                 "Noto Serif",
    //                 "Roboto",
    //                 "Helvetica",
    //                 "Arial",
    //                 "sans-serif"
    //             ],
    //             mono: [
    //                 "JetBrains Mono",
    //                 "Space Mono",
    //                 "Lucida Console",
    //                 "monospace"
    //             ]
    //         },
    //         colors: {
    //             surface: {
    //                 50: "#f5f9ff",
    //                 100: "#eaf3ff",
    //                 200: "#c8dfff",
    //                 300: "#a6cbff",
    //                 400: "#63a3ff",
    //                 500: "#208bff",
    //                 600: "#1d7de6",
    //                 700: "#1a6ac2",
    //                 800: "#16579e",
    //                 900: "#0d3a66",
    //                 950: "#0a2c4f"
    //             },
    //             "surface-accent": {
    //                 50: "#f5f9ff",
    //                 100: "#eaf3ff",
    //                 200: "#c8dfff",
    //                 300: "#a6cbff",
    //                 400: "#63a3ff",
    //                 500: "#208bff",
    //                 600: "#1d7de6",
    //                 700: "#1a6ac2",
    //                 800: "#16579e",
    //                 900: "#0d3a66",
    //                 950: "#0a2c4f"
    //             }
    //         }
    //     }
    // }

};
