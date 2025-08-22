// @ts-ignore
import path from "path";
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import svgr from "vite-plugin-svgr";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    server: {
        fs: {
            allow: ['../../..'],
        },
    },
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
        svgr(),
        react({}),
        tailwindcss(),
    ],
    css: {
        preprocessorOptions: {
            scss: {
                includePaths: [path.resolve(__dirname, "../../packages")]
            }
        }
    },
    resolve: {
        alias: {
            "@firecms/core": path.resolve(__dirname, "../../packages/firecms_core/src"),
            "@firecms/types": path.resolve(__dirname, "../../packages/types/src"),
            "@firecms/ui": path.resolve(__dirname, "../../packages/ui/src"),
            "@firecms/ui/index.css": path.resolve(__dirname, "../../packages/ui/index.css"),
            "@firecms/formex": path.resolve(__dirname, "../../packages/formex/src"),
            "@firecms/editor": path.resolve(__dirname, "../../packages/editor/src"),
            "@firecms/datatalk": path.resolve(__dirname, "../../packages/datatalk/src"),
            "@firecms/mongodb": path.resolve(__dirname, "../../packages/mongodb/src"),
            "@firecms/postgresql": path.resolve(__dirname, "../../packages/postgresql/src"),
            "@firecms/firebase": path.resolve(__dirname, "../../packages/firebase_firecms/src"),
            "@firecms/data_enhancement": path.resolve(__dirname, "../../packages/data_enhancement/src"),
            "@firecms/data_import": path.resolve(__dirname, "../../packages/data_import/src"),
            "@firecms/entity_history": path.resolve(__dirname, "../../packages/entity_history/src"),
            "@firecms/data_export": path.resolve(__dirname, "../../packages/data_export/src"),
            "@firecms/schema_inference": path.resolve(__dirname, "../../packages/schema_inference/src"),
            "@firecms/collection_editor": path.resolve(__dirname, "../../packages/collection_editor/src"),
            "@firecms/collection_editor_firebase": path.resolve(__dirname, "../../packages/collection_editor_firebase/src"),
            "@firecms/user_management": path.resolve(__dirname, "../../packages/user_management/src"),
            "shared": path.resolve(__dirname, "../shared")
        }
    }
})
