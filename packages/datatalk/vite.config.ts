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
            name: "Rebase Editor",
            fileName: (format) => `index.${format}.js`
        },
        target: "ESNEXT",
        sourcemap: true,
        minify: false,
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
            "@rebasepro/ui": path.resolve(__dirname, "../ui/src"),
            "@rebasepro/core": path.resolve(__dirname, "../core/src"),
            "@rebasepro/types": path.resolve(__dirname, "../types/src"),
            "@rebasepro/firebase": path.resolve(__dirname, "../firebase/src"),
            "@rebasepro/formex": path.resolve(__dirname, "../formex/src"),
            "@rebasepro/schema_inference": path.resolve(__dirname, "../schema_inference/src"),
            "@rebasepro/data_import": path.resolve(__dirname, "../data_import/src"),
            "@rebasepro/data_export": path.resolve(__dirname, "../data_export/src"),
            "@rebasepro/data_import_export": path.resolve(__dirname, "../data_import_export/src"),
        }
    },
    plugins: [
        react({})
    ]
}));
