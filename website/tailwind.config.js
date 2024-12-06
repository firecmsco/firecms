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
          "JetBrains Mono",
          "Space Mono",
          "Lucida Console",
          "monospace"
        ]
      },
      colors: {
        "primary": "var(--fcms-primary)",
        "primary-bg": "var(--fcms-primary-bg)",
        "secondary": "var(--fcms-secondary)",
        "field": {
          "disabled": "rgb(224 224 226)",
          "disabled-dark": "rgb(35 35 37)"
        },
        "text": {
          "primary": "rgba(0, 0, 0, 0.87)",
          "secondary": "rgba(0, 0, 0, 0.52)",
          "disabled": "rgba(0, 0, 0, 0.38)",
          "primary-dark": "#ffffff",
          "secondary-dark": "rgba(255, 255, 255, 0.60)",
          "disabled-dark": "rgba(255, 255, 255, 0.48)"
        },
        "surface": {
          "50": "#f8f8fc",
          "100": "#E7E7EB",
          "200": "#CFCFD6",
          "300": "#B7B7BF",
          "400": "#A0A0A9",
          "500": "#87878F",
          "600": "#6B6B74",
          "700": "#454552",
          "800": "#292934",
          "900": "#18181C",
          "950": "#101013"
        },
        "surface-accent": {
          "50": "#f8fafc",
          "100": "#f1f5f9",
          "200": "#e2e8f0",
          "300": "#cbd5e1",
          "400": "#94a3b8",
          "500": "#64748b",
          "600": "#475569",
          "700": "#334155",
          "800": "#1e293b",
          "900": "#0f172a",
          "950": "#020617"
        }
      }
    }
  }

};

