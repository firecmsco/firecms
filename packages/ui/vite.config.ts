// @ts-ignore
import path from "path";

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react"

const isExternal = (id: string) => !id.startsWith(".") && !path.isAbsolute(id);

export default defineConfig(() => ({
    esbuild: {
        logOverride: { "this-is-undefined-in-esm": "silent" }
    },
    build: {
        lib: {
            entry: path.resolve(__dirname, "src/index.ts"),
            name: "FireCMS UI",
            fileName: (format) => `index.${format}.js`
        },
        target: "esnext",
        sourcemap: true,
        rollupOptions: {
            external: isExternal
        }
    },
    plugins: [
        react({})
    ]
}));
