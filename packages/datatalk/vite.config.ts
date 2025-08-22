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
            "@firecms/ui": path.resolve(__dirname, "../ui/src"),
            "@firecms/core": path.resolve(__dirname, "../core/src"),
            "@firecms/types": path.resolve(__dirname, "../types/src"),
            "@firecms/firebase": path.resolve(__dirname, "../firebase_firecms/src"),
            "@firecms/formex": path.resolve(__dirname, "../formex/src"),
            "@firecms/schema_inference": path.resolve(__dirname, "../schema_inference/src"),
            "@firecms/collection_editor_firebase": path.resolve(__dirname, "../collection_editor_firebase/src"),
            "@firecms/data_import": path.resolve(__dirname, "../data_import/src"),
            "@firecms/data_export": path.resolve(__dirname, "../data_export/src"),
            "@firecms/data_import_export": path.resolve(__dirname, "../data_import_export/src"),
        }
    },
    plugins: [
        react({})
    ]
}));
