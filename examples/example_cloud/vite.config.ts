// @ts-ignore
import path from "path";

import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import federation from "@originjs/vite-plugin-federation"

// @ts-ignore
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
    const build = command === "build";
    return ({
        esbuild: {
            logOverride: { "this-is-undefined-in-esm": "silent" }
        },
        plugins: [
            react({
                // Use classic JSX runtime (React.createElement) instead of the
                // automatic runtime (react/jsx-runtime). This is critical because
                // the federation plugin can't share react/jsx-runtime as a subpath
                // import. With classic runtime, JSX goes through the shared "react"
                // module, ensuring the host and remote use the same React instance.
                jsxRuntime: "classic"
            }),
            tailwindcss(),
            federation({
                name: "remote_app",
                filename: "remoteEntry.js",
                exposes: {
                    "./config": "./src/index"
                },
                shared: {
                    "react": {
                        requiredVersion: "^18.0.0 || ^19.0.0",
                        generate: false,
                    },
                    "react-dom": {
                        requiredVersion: "^18.0.0 || ^19.0.0",
                        generate: false,
                    },
                    "@firecms/cloud": { requiredVersion: "^3.0.0", generate: false },
                    "@firecms/core": { requiredVersion: "^3.0.0", generate: false },
                    "@firecms/firebase": { requiredVersion: "^3.0.0", generate: false },
                    "@firecms/ui": { requiredVersion: "^3.0.0", generate: false },
                    "@firebase/firestore": { generate: false },
                    "@firebase/app": { generate: false },
                    "@firebase/functions": { generate: false },
                    "@firebase/auth": { generate: false },
                    "@firebase/storage": { generate: false },
                    "@firebase/analytics": { generate: false },
                    "@firebase/remote-config": { generate: false },
                    "@firebase/app-check": { generate: false },
                }
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
