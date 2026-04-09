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
            "@rebasepro/cms": path.resolve(__dirname, "../cms/src"),
            "@rebasepro/common": path.resolve(__dirname, "../common/src"),
            "@rebasepro/core": path.resolve(__dirname, "../core/src"),
            "@rebasepro/firebase": path.resolve(__dirname, "../firebase/src"),
            "@rebasepro/formex": path.resolve(__dirname, "../formex/src"),
            "@rebasepro/schema_inference": path.resolve(__dirname, "../schema_inference/src"),
            "@rebasepro/studio": path.resolve(__dirname, "../studio/src"),
            "@rebasepro/types": path.resolve(__dirname, "../types/src"),
            "@rebasepro/ui": path.resolve(__dirname, "../ui/src"),
        }
    },
    plugins: [
        react({})
    ]
}));
