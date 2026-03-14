// @ts-ignore
import path from "path";

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react"

const ReactCompilerConfig = {
    target: "18"
};
const isExternal = (id: string) => !id.startsWith(".") && !path.isAbsolute(id);

export default defineConfig(() => ({
    esbuild: {
        logOverride: { "this-is-undefined-in-esm": "silent" }
    },
    build: {
        lib: {
            entry: path.resolve(__dirname, "src/index.ts"),
            name: "Rebase collection editor",
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
            "@rebasepro/core": path.resolve(__dirname, "../core/src"),
            "@rebasepro/common": path.resolve(__dirname, "../common/src"),
            "@rebasepro/types": path.resolve(__dirname, "../types/src"),
            "@rebasepro/ui": path.resolve(__dirname, "../ui/src"),
            "@rebasepro/formex": path.resolve(__dirname, "../formex/src"),
            "@rebasepro/schema_inference": path.resolve(__dirname, "../schema_inference/src"),
            "@rebasepro/data_import": path.resolve(__dirname, "../data_import/src"),
            "@rebasepro/data_export": path.resolve(__dirname, "../data_export/src"),
            "@rebasepro/data_import_export": path.resolve(__dirname, "../data_import_export/src"),
        }
    },
    plugins: [
        react({
            babel: {
                plugins: [
                    ["babel-plugin-react-compiler", ReactCompilerConfig],
                ]
            }
        })
    ]
}));
