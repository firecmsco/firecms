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
            name: "Rebase CLI",
            fileName: (format) => {
                if (format === "es")
                    return `index.${format}.js`;
                else if (format === "umd")
                    return `index.cjs`;
                throw new Error("Unexpected format");
            }
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
            "@rebasepro/core": path.resolve(__dirname, "../core/src"),
            "@rebasepro/types": path.resolve(__dirname, "../types/src"),
            "@rebasepro/ui": path.resolve(__dirname, "../ui/src"),
            "@rebasepro/schema_inference": path.resolve(__dirname, "../schema_inference/src"),
            "@rebasepro/studio": path.resolve(__dirname, "../studio/src"),
            "@rebasepro/data_enhancement": path.resolve(__dirname, "../data_enhancement/src"),
            "@rebasepro/data_import": path.resolve(__dirname, "../data_import/src"),
            "@rebasepro/data_export": path.resolve(__dirname, "../data_export/src"),
            "@rebasepro/data_import_export": path.resolve(__dirname, "../data_import_export/src"),
        }
    },
    plugins: [
    ]
}));
