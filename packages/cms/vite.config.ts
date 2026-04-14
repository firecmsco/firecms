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
    optimizeDeps: {
    },
    server: {
        fs: {
            allow: ["../.."]
        }
    },
    esbuild: {
        logOverride: { "this-is-undefined-in-esm": "silent" }
    },
    build: {
        lib: {
            entry: {
                index: path.resolve(__dirname, "src/index.ts"),
                collection_editor_ui: path.resolve(__dirname, "src/collection_editor_ui.ts"),
            },
            name: "Rebase CMS",
            formats: ["es"],
        },
        target: "ESNEXT",
        minify: false,
        sourcemap: true,
        rollupOptions: {
            external: isExternal,
            output: {
                preserveModules: false,
            }
        }
    },
    resolve: {
        alias: {
            "@rebasepro/client": path.resolve(__dirname, "../client/src"),
            "@rebasepro/common": path.resolve(__dirname, "../common/src"),
            "@rebasepro/core": path.resolve(__dirname, "../core/src"),
            "@rebasepro/formex": path.resolve(__dirname, "../formex/src"),
            "@rebasepro/schema-inference": path.resolve(__dirname, "../schema-inference/src"),
            "@rebasepro/types": path.resolve(__dirname, "../types/src"),
            "@rebasepro/ui": path.resolve(__dirname, "../ui/src"),
        }
    },
    plugins: [
        react({
            babel: {
                plugins: [
                    ["babel-plugin-react-compiler", ReactCompilerConfig],
                ],
            }
        })
    ]
}));
