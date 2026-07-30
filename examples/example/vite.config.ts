// @ts-ignore
import path from "path";
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

// @ts-ignore
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    esbuild: {
        logOverride: { "this-is-undefined-in-esm": "silent" }
    },
    build: {
        minify: true,
        outDir: "./build",
        target: "ESNEXT",
        sourcemap: true
    },
    optimizeDeps: { include: ["react/jsx-runtime"] },
    plugins: [
        react({}),
        tailwindcss(),
    ],
    resolve: {
        // Firebase must resolve to a single copy. @firecms/firebase imports the scoped
        // @firebase/* packages while apps install the `firebase` umbrella, which can
        // bundle two copies of @firebase/component — the auth component then registers
        // into one container and getAuth() looks in the other, throwing
        // "Component auth has not been registered yet".
        dedupe: ["firebase", "@firebase/app", "@firebase/auth", "@firebase/component", "@firebase/util", "@firebase/firestore", "@firebase/storage"],
        alias: {
            "@firecms/core": path.resolve(__dirname, "../../packages/firecms_core/src"),
            "@firecms/ui": path.resolve(__dirname, "../../packages/ui/src"),
            "@firecms/formex": path.resolve(__dirname, "../../packages/formex/src"),
            "@firecms/firebase": path.resolve(__dirname, "../../packages/firebase_firecms/src"),
            "@firecms/data_enhancement": path.resolve(__dirname, "../../packages/data_enhancement/src"),
            "@firecms/data_import": path.resolve(__dirname, "../../packages/data_import/src"),
            "@firecms/data_export": path.resolve(__dirname, "../../packages/data_export/src"),
            "@firecms/data_import_export": path.resolve(__dirname, "../../packages/data_import_export/src"),
            "@firecms/schema_inference": path.resolve(__dirname, "../../packages/schema_inference/src"),
            "@firecms/collection_editor": path.resolve(__dirname, "../../packages/collection_editor/src"),
            "@firecms/user_management": path.resolve(__dirname, "../../packages/user_management/src")
        }
    }
})
