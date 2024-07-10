// @ts-ignore
import path from "path";

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react"

const isExternal = (id: string) => {
    return !id.startsWith(".") && !path.isAbsolute(id);
};

export default defineConfig(() => ({
    esbuild: {
        logOverride: { "this-is-undefined-in-esm": "silent" }
    },
    build: {
        lib: {
            entry: path.resolve(__dirname, "src/index.ts"),
            name: "FireCMS PRO",
            fileName: (format) => `index.${format}.js`
        },
        target: "ESNEXT",
        sourcemap: true,
        rollupOptions: {
            external: isExternal
        }
    },
    resolve: {
        alias: {
            "@firecms/firebase": path.resolve(__dirname, "../firebase_firecms/src"),
            "@firecms/ui": path.resolve(__dirname, "../ui/src"),
            "@firecms/core": path.resolve(__dirname, "../firecms_core/src"),
            "@firecms/data_import": path.resolve(__dirname, "../data_import/src"),
            "@firecms/data_export": path.resolve(__dirname, "../data_export/src"),
            "@firecms/data_import_export": path.resolve(__dirname, "../data_import_export/src"),
        }
    },
    plugins: [react({})]
}));
