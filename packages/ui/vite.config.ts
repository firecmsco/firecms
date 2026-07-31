// @ts-ignore
import path from "path";
import preserveDirectives from "rollup-preserve-directives";

import fs from "fs";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

const ReactCompilerConfig = {
    target: "18"
};

/**
 * Copy src/index.css to dist/index.css.
 *
 * This file is part of the public API — the "exports" map publishes it as
 * `@firecms/ui/index.css`, and every consumer imports it. It was previously copied with
 * vite-plugin-static-copy, whose v4 release changed how a source path resolves against
 * `dest` and silently moved the output to dist/src/index.css, breaking that subpath for
 * everyone. Done by hand here so the location cannot drift with a dependency bump.
 */
function copyIndexCss(): Plugin {
    return {
        name: "firecms-copy-index-css",
        closeBundle() {
            const from = path.resolve(__dirname, "src/index.css");
            const to = path.resolve(__dirname, "dist/index.css");
            fs.mkdirSync(path.dirname(to), { recursive: true });
            fs.copyFileSync(from, to);
        }
    };
}

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
        copyIndexCss(),
    ]
}));
