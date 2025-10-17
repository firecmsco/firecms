export default {
  theme: {
    theme: {
      extend: {
        fontFamily: {
          // Set Geist Sans as the default sans-serif font
          sans: ["Geist Sans", "ui-sans-serif", "system-ui", "sans-serif"],
          mono: ["IBM Plex Mono", "ui-monospace", "monospace"],
        },
        colors: {
          // Using user's primary blue color
          primary: {
            light: "#359aff", // Lighter shade for hover/accents if needed
            DEFAULT: "#0070f4", // User's primary color
            dark: "#0061c2",   // Darker shade for hover/accents if needed
          },
          // Mapping original bg-primary-600 (used in banner)
          "primary-600": "#027bf5", // Using the main primary color
        }
      }
    }
  },
  plugins: []
};
