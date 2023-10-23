// @ts-ignore
import path from "path";

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react"

export default defineConfig(() => ({
    esbuild: {
        logOverride: { "this-is-undefined-in-esm": "silent" }
    },
    build: {
        target: "esnext",
        modulePreload: false,
        minify: false,
        cssCodeSplit: false,
        sourcemap: true,
        lib: {
            entry: path.resolve(__dirname, "src/index.ts"),
            name: "FireCMS",
            fileName: (format) => `index.${format}.js`
        },
    },
    resolve: {
        alias: {
            firecms: path.resolve(__dirname, "../firecms_core/src"),
            "@firecms/schema_inference": path.resolve(__dirname, "../schema_inference/src"),
        }
    },
    plugins: [react({})]
}));
