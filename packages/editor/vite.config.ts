// @ts-ignore
import path from "path";

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react"
import { resolve } from 'path';

const isExternal = (id: string) => !id.startsWith(".") && !path.isAbsolute(id);

export default defineConfig(() => ({
    esbuild: {
        logOverride: { "this-is-undefined-in-esm": "silent" }
    },
    build: {
        lib: {
            entry: path.resolve(__dirname, "src/index.ts"),
            name: "FireCMS Editor",
            fileName: (format) => `index.${format}.js`
        },
        target: "ESNEXT",
        sourcemap: true,

        rollupOptions: {
            // input: {
            //     index: resolve(__dirname, 'src/components/index.ts'),
            //     extensions: resolve(__dirname, 'src/extensions/index.ts'),
            //     plugins: resolve(__dirname, 'src/plugins/index.ts'),
            // },
            external: isExternal,
            // output: [
            //     {
            //         format: 'cjs',
            //         dir: 'dist',
            //         entryFileNames: '[name].cjs.js',
            //     },
            //     {
            //         format: 'esm',
            //         dir: 'dist',
            //         entryFileNames: '[name].esm.js',
            //     },
            // ],
        },
    },
    resolve: {
        alias: {
            "@firecms/ui": path.resolve(__dirname, "../ui/src"),
        }
    },
    plugins: [
        react({})
    ]
}));
