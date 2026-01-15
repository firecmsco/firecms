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
            name: "FireCMS Auth",
            fileName: (format) => `index.${format}.js`
        },
        minify: false,
        target: "ESNEXT",
        sourcemap: true,
        rollupOptions: {
            external: isExternal
        }
    },
    resolve: {
        alias: {
            "@firecms/ui": path.resolve(__dirname, "../ui/src"),
            "@firecms/core": path.resolve(__dirname, "../firecms_core/src"),
            "@firecms/types": path.resolve(__dirname, "../types/src"),
        }
    },
    plugins: [react({})]
}));
