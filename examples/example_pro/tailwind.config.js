import fireCMSConfig from "firecms/tailwind.config.js";

export default {
    presets: [fireCMSConfig],
    plugins: [
        require("@tailwindcss/typography")
    ],
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "../../packages/**/src/**/*.{js,ts,jsx,tsx}",
        "../../node_modules/firecms/src/**/*.{js,ts,jsx,tsx}",
        "../../node_modules/@firecms/**/src/**/*.{js,ts,jsx,tsx}",
    ],
};
