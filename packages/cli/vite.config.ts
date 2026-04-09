// @ts-ignore
import path from "path";
import { defineConfig } from "vite";

const isExternal = (id: string) => !id.startsWith(".") && !path.isAbsolute(id);

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
            "@rebasepro/backend": path.resolve(__dirname, "../backend/src"),
            "@rebasepro/sdk_generator": path.resolve(__dirname, "../sdk_generator/src"),
            "@rebasepro/types": path.resolve(__dirname, "../types/src"),
        }
    },
    plugins: []
}));
