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
    optimizeDeps: { include: ["react/jsx-runtime"] },
    plugins: [
        react(),
        federation({
            name: "remote_app",
            filename: "remoteEntry.js",
            exposes: {
                "./index": "./src/index"
            },
            shared: ["react", "react-dom"]
        })
    ],
    build: {
        // lib: {
        //     entry: path.resolve(__dirname, "src/index.ts"),
        //     name: "FireCMS",
        //     // fileName: (format) => `index.${format}.js`
        // },
        modulePreload: false,
        target: "esnext",
        minify: false,
        cssCodeSplit: false,
    },
    resolve: {
        alias: {
            firecms: path.resolve(__dirname, "../../packages/firecms/src"),
            "@firecms/firebase_firecms_v3": path.resolve(__dirname, "../../packages/firebase_firecms_v3/src"),
            "@firecms/data_enhancement": path.resolve(__dirname, "../../packages/data_enhancement/src"),
            "@firecms/schema_inference": path.resolve(__dirname, "../../packages/schema_inference/src"),
            "@firecms/collection_editor": path.resolve(__dirname, "../../packages/collection_editor/src")
        }
    }
})
