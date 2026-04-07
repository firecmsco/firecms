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
            entry: {
                index: path.resolve(__dirname, "src/index.ts"),
                cms: path.resolve(__dirname, "src/cms/index.ts")
            },
            name: "Rebase Types",
            fileName: (format, entryName) => `${entryName}.${format}.js`
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
