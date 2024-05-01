// @ts-ignore
import path from "path";
import { defineConfig, loadEnv } from "vite";
// import { sentryVitePlugin } from "@sentry/vite-plugin";
import sourcemaps from "rollup-plugin-sourcemaps";
import { sentryRollupPlugin } from "@sentry/rollup-plugin";

import federation from "@originjs/vite-plugin-federation"
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
    process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };
    const build = command === "build";
    // const build = false;
    return ({
        esbuild: {
            logOverride: { "this-is-undefined-in-esm": "silent" }
        },
        build: {
            target: "esnext",
            modulePreload: false,
            minify: true,
            cssCodeSplit: false,
            outDir: "./build",
            sourcemap: true,
            rollupOptions: {
                plugins: [
                    sourcemaps({
                        exclude: [/.*node_modules\/@sentry.*/],
                    }),
                    [...process.env.VITE_SUBMIT_SENTRY_RELEASE === "true"
                        ? sentryRollupPlugin({
                            authToken: process.env.SENTRY_AUTH_TOKEN,
                            org: "firecms",
                            project: "firecms-sass",
                        })
                        : []
                    ]
                ]
            }
        },
        plugins: [
            react(),
            // [...process.env.VITE_SUBMIT_SENTRY_RELEASE === "true"
            //     ? sentryVitePlugin({
            //         authToken: process.env.SENTRY_AUTH_TOKEN,
            //         org: "firecms",
            //         project: "firecms-sass"
            //     })
            //     : []
            // ],
            federation({
                name: "app",
                remotes: {
                    // FIXME: need a dummy import here or we get a:
                    // "ReferenceError: __rf_placeholder__shareScope is not defined"
                    dummyApp: "dummy.js"
                },
                shared: ["react", "react-dom",
                    ...(build
                        ? [
                            "@firecms/cloud", "@firecms/core", "@firecms/firebase", "@firecms/ui",
                        ]
                        : [])
                ]
            }),

        ],
        resolve: {
            alias: {
                "@firecms/cloud": build ? path.resolve(__dirname, "../packages/firecms_cloud") : path.resolve(__dirname, "../packages/firecms_cloud/src"),
                "@firecms/core": build ? path.resolve(__dirname, "../packages/firecms_core") : path.resolve(__dirname, "../packages/firecms_core/src"),
                "@firecms/ui": build ? path.resolve(__dirname, "../packages/ui") : path.resolve(__dirname, "../packages/ui/src"),
                "@firecms/formex": build ? path.resolve(__dirname, "../packages/formex") : path.resolve(__dirname, "../packages/formex/src"),
                "@firecms/firebase": build ? path.resolve(__dirname, "../packages/firebase_firecms") : path.resolve(__dirname, "../packages/firebase_firecms/src"),
                "@firecms/collection_editor_firebase": build ? path.resolve(__dirname, "../packages/collection_editor_firebase") : path.resolve(__dirname, "../packages/collection_editor_firebase/src"),
                "@firecms/data_enhancement": build ? path.resolve(__dirname, "../packages/data_enhancement") : path.resolve(__dirname, "../packages/data_enhancement/src"),
                "@firecms/data_import_export": build ? path.resolve(__dirname, "../packages/data_import_export") : path.resolve(__dirname, "../packages/data_import_export/src"),
                "@firecms/schema_inference": build ? path.resolve(__dirname, "../packages/schema_inference") : path.resolve(__dirname, "../packages/schema_inference/src"),
                "@firecms/datatalk":  path.resolve(__dirname, "../packages/datatalk/src")
            }
        }
    });
})
