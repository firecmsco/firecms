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
            name: "Rebase",
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
            "@rebasepro/types": path.resolve(__dirname, "../types/src"),
            "@rebasepro/ui": path.resolve(__dirname, "../ui/src"),
            "@rebasepro/editor": path.resolve(__dirname, "../editor/src"),
        }
    },
    plugins: [react({
        babel: {
            plugins: [
                ["babel-plugin-react-compiler", ReactCompilerConfig],
            ],
        }
    })]
}));
