// @ts-ignore
import path from "path";

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react"

const ReactCompilerConfig = {
    target: "18"
};

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
            name: "Rebase Firebase",
            fileName: (format: string) => `index.${format}.js`
        },
        target: "ESNEXT",
        sourcemap: true,
        minify: false,
        rollupOptions: {
            external: isExternal,
            output: {
                globals: {
                    "json-logic-js": "jsonLogic",
                    "fast-equals": "fastEquals",
                    "lodash/cloneDeep.js": "cloneDeep"
                }
            }
        }
    },
    resolve: {
        alias: {
            "@rebasepro/common": path.resolve(__dirname, "../common/src"),
            "@rebasepro/core": path.resolve(__dirname, "../core/src"),
            "@rebasepro/plugin-data-enhancement": path.resolve(__dirname, "../plugin-data-enhancement/src"),
            "@rebasepro/schema-inference": path.resolve(__dirname, "../schema-inference/src"),
            "@rebasepro/studio": path.resolve(__dirname, "../studio/src"),
            "@rebasepro/types": path.resolve(__dirname, "../types/src"),
            "@rebasepro/ui": path.resolve(__dirname, "../ui/src"),
        }
    },
    plugins: [
        ...react({
            babel: {
                plugins: [
                    ["babel-plugin-react-compiler", ReactCompilerConfig],
                ],
            }
        })
    ]
} as any));
