import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { federation } from "@module-federation/vite"

// @ts-ignore
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
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
        // Build only. `vite` (dev) runs this project standalone — App.tsx mounts
        // FireCMSCloudApp with this config — so it has to bundle React and FireCMS
        // itself, which the `import: false` shares below forbid. The previous
        // federation plugin's remote side was build-only as well.
        command === "build" && federation({
            name: "remote_app",
            // `firecms deploy` uploads dist/assets and the backend serves the remote
            // entry from the root of that upload, so it has to be emitted there.
            filename: "assets/remoteEntry.js",
            exposes: {
                "./config": "./src/index"
            },
            // The build emits one stylesheet (`cssCodeSplit: false` below) that
            // belongs to no chunk, so without this the remote entry would load
            // `./config` without its styles. `bundleAllCSS` makes the entry inject
            // it, relative to remoteEntry.js, before the module loads.
            bundleAllCSS: true,
            // The FireCMS host does not read generated remote types, and generating
            // them runs a second, stricter type-check during `vite build`.
            dts: false,
            // Every package below is `import: false` with `requiredVersion: false`.
            //
            // `import: false` means this bundle ships no copy of these packages at
            // all: it consumes whatever the FireCMS host provides in the federation
            // share scope at runtime, and there is no local fallback.
            //
            // `requiredVersion: false` is deliberate, not an omission. Left out,
            // @module-federation/vite fills it in from package.json (`^19.2.3` for
            // react, `^3.0.0` for @firecms/cloud, ...), which would put back a semver
            // gate with nothing behind it: when the gate fails there is no local
            // copy to fall back on, and the app dies on an undefined module rather
            // than degrading.
            //
            // Turning the check off makes the host the single authority over these
            // versions, which is what lets FireCMS upgrade React underneath
            // deployments that were built years earlier.
            shared: {
                "react": { import: false, requiredVersion: false },
                "react-dom": { import: false, requiredVersion: false },
                // Sharing these two subpaths is what keeps a second copy of React out
                // of this bundle. A second copy is not merely wasteful — React 19
                // refuses to render an element created by React 18, because the two
                // use different element symbols, so a bundled copy is a hard crash on
                // a newer host. Anything that pulls in the automatic JSX runtime, such
                // as a third-party component library, would otherwise drag one in.
                "react/jsx-runtime": { import: false, requiredVersion: false },
                "react/jsx-dev-runtime": { import: false, requiredVersion: false },
                "@firecms/cloud": { import: false, requiredVersion: false },
                "@firecms/core": { import: false, requiredVersion: false },
                "@firecms/firebase": { import: false, requiredVersion: false },
                "@firecms/ui": { import: false, requiredVersion: false },
                "@firebase/firestore": { import: false, requiredVersion: false },
                "@firebase/app": { import: false, requiredVersion: false },
                "@firebase/functions": { import: false, requiredVersion: false },
                "@firebase/auth": { import: false, requiredVersion: false },
                "@firebase/storage": { import: false, requiredVersion: false },
                "@firebase/analytics": { import: false, requiredVersion: false },
                "@firebase/remote-config": { import: false, requiredVersion: false },
                "@firebase/app-check": { import: false, requiredVersion: false },
            }
        })
    ],
    build: {
        modulePreload: false,
        minify: false,
        target: "ESNEXT",
        cssCodeSplit: false,
    }
}));
