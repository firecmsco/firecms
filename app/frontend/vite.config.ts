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
            "@rebasepro/ui": path.resolve(__dirname, "../../packages/ui/src"),
            "@rebasepro/ui/index.css": path.resolve(__dirname, "../../packages/ui/index.css"),
            "@rebasepro/formex": path.resolve(__dirname, "../../packages/formex/src"),
            "@rebasepro/editor": path.resolve(__dirname, "../../packages/editor/src"),
            "@rebasepro/datatalk": path.resolve(__dirname, "../../packages/datatalk/src"),
            "@rebasepro/postgresql": path.resolve(__dirname, "../../packages/postgresql/src"),
            "@rebasepro/firebase": path.resolve(__dirname, "../../packages/firebase/src"),
            "@rebasepro/data_enhancement": path.resolve(__dirname, "../../packages/data_enhancement/src"),
            "@rebasepro/data_import": path.resolve(__dirname, "../../packages/data_import/src"),
            "@rebasepro/entity_history": path.resolve(__dirname, "../../packages/entity_history/src"),
            "@rebasepro/data_export": path.resolve(__dirname, "../../packages/data_export/src"),
            "@rebasepro/schema_inference": path.resolve(__dirname, "../../packages/schema_inference/src"),
            "@rebasepro/collection_editor": path.resolve(__dirname, "../../packages/collection_editor/src"),
            "@rebasepro/user_management": path.resolve(__dirname, "../../packages/user_management/src"),
            "@rebasepro/auth": path.resolve(__dirname, "../../packages/auth/src"),
            "shared": path.resolve(__dirname, "../shared")
        }
    }
})
