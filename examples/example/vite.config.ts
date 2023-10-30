// @ts-ignore
import path from "path";
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

// import svgr from "vite-plugin-svgr";

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
        // svgr(),
        react({})
    ],
    resolve: {
        alias: {
            "@firecms/core": path.resolve(__dirname, "../../packages/firecms_core"),
            "@firecms/firebase_legacy": path.resolve(__dirname, "../../packages/firebase_firecms"),
            "@firecms/data_enhancement": path.resolve(__dirname, "../../packages/data_enhancement"),
        }
    }
})
