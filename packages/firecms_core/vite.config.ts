// @ts-ignore
import path from "path";

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react"

const ReactCompilerConfig = {
    target: "18"
};

const isExternal = (id: string) => !id.startsWith(".") && !path.isAbsolute(id);

export default defineConfig(() => ({
    optimizeDeps: {
        exclude: ["@firecms/ui", "@firecms/util", "@firecms/types", "@firecms/editor", "@firecms/formex"]
    },
    server: {
        fs: {
            allow: ["../.."]
        }
    },
    esbuild: {
        logOverride: { "this-is-undefined-in-esm": "silent" }
    },
    build: {
        lib: {
            entry: path.resolve(__dirname, "src/index.ts"),
            name: "FireCMS Core",
            fileName: (format) => `index.${format}.js`
        },
        target: "ESNEXT",
        minify: false,
        sourcemap: true,
        rollupOptions: {
            external: isExternal
        }
    },
    resolve: {
        alias: {
            "@firecms/ui": path.resolve(__dirname, "../ui/src"),
            "@firecms/util": path.resolve(__dirname, "../util/src"),
            "@firecms/types": path.resolve(__dirname, "../types/src"),
            "@firecms/editor": path.resolve(__dirname, "../editor/src"),
            "@firecms/formex": path.resolve(__dirname, "../formex/src")
        }
    },
    plugins: [
        react({
            babel: {
                plugins: [
                    ["babel-plugin-react-compiler", ReactCompilerConfig],
                ],
            }
        })
    ]
}));
