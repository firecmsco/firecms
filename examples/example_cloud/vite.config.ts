// @ts-ignore
import path from "path";

import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import federation from "@originjs/vite-plugin-federation"
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
    const build = command === "build";
    return ({
        esbuild: {
            logOverride: { "this-is-undefined-in-esm": "silent" }
        },
        plugins: [
            react(),
            tailwindcss(),
            federation({
                name: "remote_app",
                filename: "remoteEntry.js",
                exposes: {
                    "./config": "./src/index"
                },
                shared: ["react", "react-dom",
                    ...(build
                        ? [
                            "@firecms/cloud",
                            "@firecms/core",
                            "@firecms/types",
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
                        : [])
                ]
            })
        ],
        build: {
            modulePreload: false,
            target: "ESNEXT",
            minify: false,
            cssCodeSplit: false,
        },
        resolve: {
            alias: {
                "@firecms/cloud": path.resolve(__dirname, "../../packages/firecms_cloud/src"),
                "@firecms/formex": path.resolve(__dirname, "../../packages/formex/src"),
                "@firecms/core": path.resolve(__dirname, "../../packages/firecms_core/src"),
                "@firecms/types": path.resolve(__dirname, "../../packages/types/src"),
                "@firecms/ui": path.resolve(__dirname, "../../packages/ui/src"),
                "@firecms/firebase": path.resolve(__dirname, "../../packages/firebase_firecms/src"),
                "@firecms/data_enhancement": path.resolve(__dirname, "../../packages/data_enhancement/src"),
                "@firecms/data_import": path.resolve(__dirname, "../../packages/data_import/src"),
                "@firecms/data_export": path.resolve(__dirname, "../../packages/data_export/src"),
                "@firecms/schema_inference": path.resolve(__dirname, "../../packages/schema_inference/src"),
                "@firecms/collection_editor": path.resolve(__dirname, "../../packages/collection_editor/src"),
                "@firecms/user_management": path.resolve(__dirname, "../../packages/user_management/src")
            }
        }
    });
})
