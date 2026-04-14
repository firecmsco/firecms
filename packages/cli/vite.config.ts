// @ts-ignore
import path from "path";
import { defineConfig } from "vite";

const isExternal = (id: string) => {
    if (id.startsWith(".") || path.isAbsolute(id)) return false;
    if (id.startsWith("@rebasepro/")) return false;
    return true;
};

export default defineConfig(() => ({
    esbuild: {
        logOverride: { "this-is-undefined-in-esm": "silent" }
    },
    build: {
        lib: {
            entry: path.resolve(__dirname, "src/index.ts"),
            name: "Rebase CLI",
            fileName: (format) => {
                if (format === "es")
                    return `index.${format}.js`;
                else if (format === "umd")
                    return `index.cjs`;
                throw new Error("Unexpected format");
            }
        },
        minify: false,
        target: "ESNEXT",
        sourcemap: true,
        rollupOptions: {
            external: isExternal
        }
    },
        resolve: {
        alias: {
            "@rebasepro/server-core": path.resolve(__dirname, "../server-core/src"),
            "@rebasepro/sdk-generator": path.resolve(__dirname, "../sdk-generator/src"),
            "@rebasepro/types": path.resolve(__dirname, "../types/src"),
        }
    },
    plugins: []
}));
