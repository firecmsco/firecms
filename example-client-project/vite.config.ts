import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path";

// these are the dependencies of the SaaS project
// Is there a better way to do this?
// const isExternal = (id: string) => {
//     return [
//         "@camberi/firecms",
//         "@camberi/firecms_collection_editor",
//         "@emotion/react",
//         "@emotion/styled",
//         "@mui/icons-material",
//         "@mui/lab",
//         "@mui/material",
//         "algoliasearch",
//         "firebase",
//         "react",
//         "react-dom",
//         "react-router",
//         "react-router-dom"
//     ].includes(id);
// };
const isExternal = (id: string) => !id.startsWith(".") && !path.isAbsolute(id);


// https://vitejs.dev/config/
export default defineConfig({
    esbuild: {
        logOverride: { "this-is-undefined-in-esm": "silent" },
        // jsxInject: "import React from 'react'",
    },
    build: {
        lib: {
            entry: path.resolve(__dirname, "src/index.tsx"),
            name: "FireCMS custom app",
            fileName: (format) => `index.${format}.js`
        },
        // minify: false,
        target: "esnext",
        sourcemap: true,
        rollupOptions: {
            // external: isExternal
        }
    },
    plugins: [react({
        jsxImportSource: "@emotion/react",
        babel: {
            plugins: ["@emotion/babel-plugin"]
        }
    })],
    resolve: {
        alias: {
            "@camberi/firecms": path.resolve(__dirname, "../lib/src")
        }
    }
})
