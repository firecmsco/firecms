// @ts-ignore
import path from "path";

import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import federation from "@originjs/vite-plugin-federation"

// @ts-ignore
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
    const build = command === "build";
    return ({
        // Emit CSS asset URLs relative to the stylesheet.
        //
        // A deployed customization is served from a deep path — the FireCMS
        // backend hands it out under /projects/<id>/app_config/<revision>/… —
        // so Vite's default base of "/" makes the CSS ask for
        // /assets/<font>.woff2 at the host root, which 404s and leaves tenant
        // icons blank. Only CSS is switched: the remote entry resolves its own
        // chunks against the output root, so making those relative would have it
        // look for assets/assets/… and fail to load at all.
        experimental: {
            renderBuiltUrl(filename: string, { hostType }: { hostType: string }) {
                return hostType === "css" ? { relative: true } : undefined;
            }
        },
        esbuild: {
            logOverride: { "this-is-undefined-in-esm": "silent" }
        },
        plugins: [
            react({
                // Compile this project's own JSX through React.createElement rather
                // than the automatic runtime. Both routes now stay on the host's
                // React — react/jsx-runtime is shared below — but the classic runtime
                // keeps the dependency explicit, and it is what every existing
                // FireCMS project was built with.
                jsxRuntime: "classic"
            }),
            tailwindcss(),
            federation({
                name: "remote_app",
                filename: "remoteEntry.js",
                exposes: {
                    "./config": "./src/index"
                },
                // None of these declare a `requiredVersion`, deliberately.
                //
                // `generate: false` means this bundle ships no copy of these
                // packages at all: it consumes whatever the FireCMS host publishes
                // into the federation share scope at runtime. A `requiredVersion`
                // would add a semver gate with nothing behind it — when the gate
                // fails there is no local copy to fall back on, and the app dies on
                // an undefined module rather than degrading.
                //
                // The gate is also not what it appears to be. The federation
                // plugin's bundled semver cannot parse an OR range, so the
                // "^18.0.0 || ^19.0.0" that used to sit here matched no version
                // whatsoever, on any host.
                //
                // Leaving it out makes the host the single authority over these
                // versions, which is what lets FireCMS upgrade React underneath
                // deployments that were built years earlier.
                shared: {
                    "react": { generate: false },
                    "react-dom": { generate: false },
                    // Sharing these two subpaths is what keeps a second copy of React out
                    // of this bundle. A second copy is not merely wasteful — React 19
                    // refuses to render an element created by React 18, because the two
                    // use different element symbols, so a bundled copy is a hard crash on
                    // a newer host. Anything that pulls in the automatic JSX runtime, such
                    // as a third-party component library, would otherwise drag one in.
                    "react/jsx-runtime": { generate: false },
                    "react/jsx-dev-runtime": { generate: false },
                    "@firecms/cloud": { generate: false },
                    "@firecms/core": { generate: false },
                    "@firecms/firebase": { generate: false },
                    "@firecms/ui": { generate: false },
                    "@firebase/firestore": { generate: false },
                    "@firebase/app": { generate: false },
                    "@firebase/functions": { generate: false },
                    "@firebase/auth": { generate: false },
                    "@firebase/storage": { generate: false },
                    "@firebase/analytics": { generate: false },
                    "@firebase/remote-config": { generate: false },
                    "@firebase/app-check": { generate: false },
                }
            })
        ],
        build: {
            modulePreload: false,
            target: "ESNEXT",
            minify: false,
            cssCodeSplit: false,
        },
        resolve: {
            // Firebase must resolve to a single copy — see the note in example_pro's config.
            dedupe: ["firebase", "@firebase/app", "@firebase/auth", "@firebase/component", "@firebase/util", "@firebase/firestore", "@firebase/storage"],
            alias: {
                "@firecms/cloud": path.resolve(__dirname, "../../packages/firecms_cloud/src"),
                "@firecms/formex": path.resolve(__dirname, "../../packages/formex/src"),
                "@firecms/core": path.resolve(__dirname, "../../packages/firecms_core/src"),
                "@firecms/ui": path.resolve(__dirname, "../../packages/ui/src"),
                "@firecms/firebase": path.resolve(__dirname, "../../packages/firebase_firecms/src"),
                "@firecms/data_enhancement": path.resolve(__dirname, "../../packages/data_enhancement/src"),
                "@firecms/data_import": path.resolve(__dirname, "../../packages/data_import/src"),
                "@firecms/data_export": path.resolve(__dirname, "../../packages/data_export/src"),
                "@firecms/schema_inference": path.resolve(__dirname, "../../packages/schema_inference/src"),
                "@firecms/collection_editor": path.resolve(__dirname, "../../packages/collection_editor/src"),
                "@firecms/user_management": path.resolve(__dirname, "../../packages/user_management/src"),
                "@firecms/firebase_admin": path.resolve(__dirname, "../../packages/firebase_admin/src")
            }
        }
    });
})
