// @ts-ignore
import path from "path";
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

// @ts-ignore
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
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
        react({}),
        tailwindcss(),
    ],
    resolve: {
        // Point at the workspace sources so the demo exercises the code you are editing,
        // not a stale dist build.
        alias: {
            "@firecms/core": path.resolve(__dirname, "../../packages/firecms_core/src"),
            "@firecms/ui": path.resolve(__dirname, "../../packages/ui/src"),
            "@firecms/formex": path.resolve(__dirname, "../../packages/formex/src")
        }
    }
})
