// @ts-ignore
import path from "path";

import { defineConfig } from "vite";

const isExternal = (id: string) => !id.startsWith(".") && !path.isAbsolute(id);

export default defineConfig(() => ({
    esbuild: {
        logOverride: { "this-is-undefined-in-esm": "silent" }
    },
    build: {
        lib: {
            entry: path.resolve(__dirname, "src/index.ts"),
            name: "FireCMS schema inference",
            fileName: (format) => {
                if (format === "es") return "index.es.js";
                if (format === "umd") return "index.umd.cjs";
                return `index.${format}.js`;
            }
        },
        target: "ESNEXT",
        sourcemap: true,
        minify: false,
        rollupOptions: {
            external: isExternal
        }
    },
    resolve: {
        alias: {
            "@firecms/types": path.resolve(__dirname, "../types/src")
        }
    },
}));
