// @ts-ignore
import path from "path";

import { defineConfig } from "vite";

const isExternal = (id: string) => {
    if (id.startsWith(".") || path.isAbsolute(id)) return false;
    if (id.startsWith("@rebasepro/")) return false;
    return true;
};

export default defineConfig(() => ({
    esbuild: {
        logOverride: { "this-is-undefined-in-esm": "silent" }
    },
    build: {
        lib: {
            entry: path.resolve(__dirname, "src/index.ts"),
            name: "Rebase Client",
            fileName: (format) => `index.${format}.js`
        },
        target: "ESNEXT",
        minify: false,
        sourcemap: true,
        rollupOptions: {
            external: isExternal
        }
    },
    resolve: {
        alias: {
            "@rebasepro/types": path.resolve(__dirname, "../types/src"),
        }
    }
}));
