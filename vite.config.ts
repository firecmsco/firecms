import path from "path";

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const isExternal = (id: string) => !id.startsWith(".") && !path.isAbsolute(id);

export default defineConfig(() => ({
    esbuild: {
        // jsxInject: "import React from 'react'",
    },
    build: {
        lib: {
            entry: path.resolve(__dirname, "src/index.ts"),
            name: 'FireCMS',
            fileName: (format) => `index.${format}.js`,
        },
        collection_editor: {
            entry: path.resolve(__dirname, "src/index.ts"),
            name: 'FireCMS',
            fileName: (format:string) => `index.${format}.js`,
        },
        target: 'esnext',
        sourcemap: true,
        rollupOptions: {
            external: isExternal,
        },
    },
    plugins: [
        react({
            jsxImportSource: "@emotion/react",
            babel: {
                plugins: ["@emotion/babel-plugin"],
            },
        })],
}));
