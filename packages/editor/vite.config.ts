// @ts-ignore
import path from "path";

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react"
import { resolve } from 'path';

const isExternal = (id: string) => !id.startsWith(".") && !path.isAbsolute(id);

export default defineConfig(() => ({
    esbuild: {
        logOverride: { "this-is-undefined-in-esm": "silent" }
    },
    build: {
        lib: {
            entry: path.resolve(__dirname, "src/index.ts"),
            name: "FireCMS Editor",
            fileName: (format) => `index.${format}.js`
        },
        target: "ESNEXT",
        sourcemap: true,
        minify: false,
        rollupOptions: {
            external: isExternal
        },
    },
    resolve: {
        alias: {
            "@firecms/ui": path.resolve(__dirname, "../ui/src"),
        }
    },
    plugins: [
        react({})
    ]
}));
