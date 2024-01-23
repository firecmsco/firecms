// @ts-ignore
import path from "path";

import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import federation from "@originjs/vite-plugin-federation"

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
    const build = command === "build";
    return ({
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
                shared: ["react", "react-dom",
                    ...(build
                        ? [
                            "firecms", "@firecms/core", "@firecms/firebase", "@firecms/ui",
                        ]
                        : [])
                ]
            })
        ],
        build: {
            modulePreload: false,
            target: "esnext",
            minify: false,
            cssCodeSplit: false,
        },
        resolve: {
            alias: {
                "firecms": path.resolve(__dirname, "../../packages/firecms/src"),
                "@firecms/cli": path.resolve(__dirname, "../../packages/firecms_cli/src"),
                "@firecms/core": path.resolve(__dirname, "../../packages/firecms_core/src"),
                "@firecms/ui": path.resolve(__dirname, "../../packages/ui/src"),
                "@firecms/firebase": path.resolve(__dirname, "../../packages/firebase_firecms/src"),
                "@firecms/data_enhancement": path.resolve(__dirname, "../../packages/data_enhancement/src"),
                "@firecms/data_import_export": path.resolve(__dirname, "../../packages/data_import_export/src"),
                "@firecms/schema_inference": path.resolve(__dirname, "../../packages/schema_inference/src"),
                "@firecms/collection_editor": path.resolve(__dirname, "../../packages/collection_editor/src")
            }
        }
    });
})
