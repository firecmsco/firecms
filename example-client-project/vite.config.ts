import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path";
import { federation } from '@module-federation/vite';
import { createEsBuildAdapter } from '@softarc/native-federation-esbuild';
import { importMaps } from './module-federation/vite-importmap-shim';
// these are the dependencies of the SaaS project
// Is there a better way to do this?
// const isExternal = (id: string) => {
//     return [
//         "@camberi/firecms",
//         // "@camberi/firecms_collection_editor",
//         // "@emotion/react",
//         // "@emotion/styled",
//         // "@mui/icons-material",
//         // "@mui/lab",
//         // "@mui/material",
//         // "algoliasearch",
//         // "firebase",
//         // "react",
//         // "react-dom",
//         // "react-router",
//         // "react-router-dom"
//     ].includes(id);
// };
const isExternal = (id: string) => !id.startsWith(".") && !path.isAbsolute(id);

// https://vitejs.dev/config/
export default defineConfig(async ({ command }) => ({
    esbuild: {
        // logOverride: { "this-is-undefined-in-esm": "silent" },
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
            // external: isExternal,
        },
    },
    plugins: [
        importMaps(
            command === 'serve'
                ? {
                    '__x00__react/jsx-dev-runtime':
                        'https://esm.sh/react@18.2.0?pin=v74&path=/jsx-dev-runtime',
                }
                : {
                    'react/jsx-runtime':
                        'https://esm.sh/react@18.2.0?pin=v74&path=/jsx-runtime',
                }
        ),
        await federation({
            options: {
                workspaceRoot: __dirname,
                outputPath: 'dist',
                tsConfig: 'tsconfig.json',
                federationConfig: `module-federation/federation.${
                    command === 'serve' ? 'dev.' : ''
                }config.cjs`,
                verbose: false,
                dev: command === 'serve',
            },
            adapter: createEsBuildAdapter({ plugins: [] }),
        }),
        react({
            jsxImportSource: "@emotion/react",
            babel: {
                plugins: ["@emotion/babel-plugin"]
            }
        }),
    ],
    resolve: {
        alias: {
            "@camberi/firecms": path.resolve(__dirname, "../lib/src")
        }
    }
}))
