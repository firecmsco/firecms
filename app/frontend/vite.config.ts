// @ts-ignore
import path from "path";
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import svgr from "vite-plugin-svgr";
import tailwindcss from "@tailwindcss/vite";
import { rebaseCollectionsPlugin } from "@rebasepro/core/vitePlugin";

export default defineConfig({
    server: {
        fs: {
            allow: ['../../..'],
        },
    },
    esbuild: {
        logOverride: { "this-is-undefined-in-esm": "silent" }
    },
    build: {
        minify: true,
        outDir: "./build",
        target: "ESNEXT",
        sourcemap: true
    },
    optimizeDeps: { include: ["react/jsx-runtime"] },
    plugins: [
        svgr(),
        react({}),
        tailwindcss(),
        rebaseCollectionsPlugin({ collectionsDir: "../shared/collections" })
    ],
    css: {
        preprocessorOptions: {
            scss: {
                includePaths: [path.resolve(__dirname, "../../packages")]
            }
        }
    },
    resolve: {
        alias: {
            "@rebasepro/core": path.resolve(__dirname, "../../packages/core/src"),
            "@rebasepro/types": path.resolve(__dirname, "../../packages/types/src"),
            "@rebasepro/common": path.resolve(__dirname, "../../packages/common/src"),
            "@rebasepro/client": path.resolve(__dirname, "../../packages/client/src"),
            "@rebasepro/ui": path.resolve(__dirname, "../../packages/ui/src"),
            "@rebasepro/ui/index.css": path.resolve(__dirname, "../../packages/ui/index.css"),
            "@rebasepro/formex": path.resolve(__dirname, "../../packages/formex/src"),
            "@rebasepro/client-postgresql": path.resolve(__dirname, "../../packages/client-postgresql/src"),
            "@rebasepro/client-firebase": path.resolve(__dirname, "../../packages/client-firebase/src"),
            "@rebasepro/plugin-data-enhancement": path.resolve(__dirname, "../../packages/plugin-data-enhancement/src"),
            "@rebasepro/schema-inference": path.resolve(__dirname, "../../packages/schema-inference/src"),
            "@rebasepro/auth": path.resolve(__dirname, "../../packages/auth/src"),
            "@rebasepro/cms": path.resolve(__dirname, "../../packages/cms/src"),
            "@rebasepro/studio": path.resolve(__dirname, "../../packages/studio/src"),
            "shared": path.resolve(__dirname, "../shared")
        }
    }
})
