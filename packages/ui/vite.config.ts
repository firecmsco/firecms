// @ts-ignore
import path from "path";
import preserveDirectives from "rollup-preserve-directives";

import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";

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
            name: "FireCMS UI",
            fileName: (format) => `index.${format}.js`
        },
        target: "ESNEXT",
        minify: false,
        sourcemap: true,
        rollupOptions: {
            external: isExternal
        }
    },
    plugins: [
        preserveDirectives() as Plugin,
        react({
            babel: {
                plugins: [
                    ["babel-plugin-react-compiler", ReactCompilerConfig],
                ],
            }
        }),
        viteStaticCopy({
            targets: [
                {
                    src: path.resolve(__dirname, "src/index.css"),
                    dest: ""
                }
            ]
        }),
    ]
}));
