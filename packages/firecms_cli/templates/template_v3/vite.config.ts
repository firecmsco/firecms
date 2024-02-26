// @ts-ignore
import path from "path";

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
                "react", "react-dom", "firecms", "@firecms/core", "@firecms/firebase", "@firecms/ui",
            ]
        })
    ],
    build: {
        modulePreload: false,
        target: "esnext",
        cssCodeSplit: false,
    }
})
