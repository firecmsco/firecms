// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";
import path from "node:path";

const __dirname = new URL(".", import.meta.url).pathname;

// https://astro.build/config
export default defineConfig({
    output: "server",
    integrations: [
        react({
            experimentalReactChildren: true
        })
    ],
    vite: {
        plugins: [
            tailwindcss()
        ],
        resolve: {
            alias: {
                "@": path.resolve(__dirname, "src"),
                "@firecms/core": path.resolve(__dirname, "../../packages/firecms_core/src"),
                "@firecms/firebase": path.resolve(__dirname, "../../packages/firebase_firecms/src"),
                "@firecms/ui": path.resolve(__dirname, "../../packages/ui/src"),
                "@firecms/editor": path.resolve(__dirname, "../../packages/editor/src"),
                "@firecms/data_enhancement": path.resolve(__dirname, "../../packages/data_enhancement/src"),
                "@firecms/collection_editor": path.resolve(__dirname, "../../packages/collection_editor/src"),
                "@firecms/collection_editor_firebase": path.resolve(__dirname, "../../packages/collection_editor_firebase/src"),
                "@firecms/data_import": path.resolve(__dirname, "../../packages/data_import/src"),
                "@firecms/data_export": path.resolve(__dirname, "../../packages/data_export/src"),
                "@firecms/user_management": path.resolve(__dirname, "../../packages/user_management/src"),
                "@firecms/schema_inference": path.resolve(__dirname, "../../packages/schema_inference/src"),
            }
        },
        server: {
            fs: {
                allow: [
                    path.resolve(__dirname, "../.."),
                    path.resolve(__dirname, ".")
                ]
            }
        }
    },
});
