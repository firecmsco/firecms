// @ts-ignore
import path from "path";
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

import svgr from "vite-plugin-svgr";

export default defineConfig({
    esbuild: {
        logOverride: { "this-is-undefined-in-esm": "silent" }
    },
    build: {
        outDir: "./build",
        target: "esnext",
        sourcemap: true
    },
    optimizeDeps: { include: ["react/jsx-runtime"] },
    plugins: [
        svgr(),
        react({})
    ],
    resolve: {
        alias: {
            firecms: path.resolve(__dirname, "../../packages/firecms_core/src"),
            "@firecms/firebase_firecms": path.resolve(__dirname, "../../packages/firebase_firecms/src"),
            "@firecms/data_enhancement": path.resolve(__dirname, "../../packages/data_enhancement/src")
        }
    }
})
