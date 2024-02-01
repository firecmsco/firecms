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
        // svgr(),
        react({})
    ],
    resolve: {
        alias: {
            "@firecms/cli": path.resolve(__dirname, "../../packages/firecms_cli/src"),
            "@firecms/core": path.resolve(__dirname, "../../packages/firecms_core/src"),
            "@firecms/firebase": path.resolve(__dirname, "../../packages/firebase_firecms/src"),
            "@firecms/firebase_pro": path.resolve(__dirname, "../../packages/firebase_firecms_pro/src"),
            "@firecms/data_enhancement": path.resolve(__dirname, "../../packages/data_enhancement/src"),
            "@firecms/data_import_export": path.resolve(__dirname, "../../packages/data_import_export/src"),
            "@firecms/schema_inference": path.resolve(__dirname, "../../packages/schema_inference/src"),
            "@firecms/collection_editor": path.resolve(__dirname, "../../packages/collection_editor/src")
        }
    }
})
