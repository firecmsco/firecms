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
        minify: true,
        outDir: "./build",
        target: "esnext",
        sourcemap: true
    },
    optimizeDeps: { include: ["react/jsx-runtime"] },
    plugins: [
        react({})
    ]
})
