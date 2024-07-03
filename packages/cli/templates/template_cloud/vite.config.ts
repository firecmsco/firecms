import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import federation from "@originjs/vite-plugin-federation"

// https://vitejs.dev/config/
export default defineConfig({
    esbuild: {
        logOverride: { "this-is-undefined-in-esm": "silent" }
    },
    plugins: [
        react(),
        federation({
            name: "remote_app",
            filename: "remoteEntry.js",
            exposes: {
                "./config": "./src/index"
            },
            shared: [
                "react",
                "react-dom",
                "@firecms/cloud",
                "@firecms/core",
                "@firecms/firebase",
                "@firecms/ui",
                "@firebase/firestore",
                "@firebase/app",
                "@firebase/functions",
                "@firebase/auth",
                "@firebase/storage",
                "@firebase/analytics",
                "@firebase/remote-config",
                "@firebase/app-check"
            ]
        })
    ],
    build: {
        modulePreload: false,
        minify: false,
        target: "ESNEXT",
        cssCodeSplit: false,
    }
});
