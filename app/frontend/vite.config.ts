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
            "@rebasepro/client-rebase": path.resolve(__dirname, "../../packages/client-rebase/src"),
            "@rebasepro/ui": path.resolve(__dirname, "../../packages/ui/src"),
            "@rebasepro/ui/index.css": path.resolve(__dirname, "../../packages/ui/index.css"),
            "@rebasepro/formex": path.resolve(__dirname, "../../packages/formex/src"),
            "@rebasepro/datatalk": path.resolve(__dirname, "../../packages/datatalk/src"),
            "@rebasepro/postgresql": path.resolve(__dirname, "../../packages/postgresql/src"),
            "@rebasepro/firebase": path.resolve(__dirname, "../../packages/firebase/src"),
            "@rebasepro/data_enhancement": path.resolve(__dirname, "../../packages/data_enhancement/src"),
            "@rebasepro/schema_inference": path.resolve(__dirname, "../../packages/schema_inference/src"),

            "@rebasepro/auth-rebase": path.resolve(__dirname, "../../packages/auth-rebase/src"),
            "@rebasepro/cms": path.resolve(__dirname, "../../packages/cms/src"),
            "@rebasepro/studio": path.resolve(__dirname, "../../packages/studio/src"),
            "shared": path.resolve(__dirname, "../shared")
        }
    }
})
