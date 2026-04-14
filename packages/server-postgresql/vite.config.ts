// @ts-ignore
import path from "path";

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react"

const ReactCompilerConfig = {
    target: "18"
};

/**
 * Only externalize dependencies that the consumer app installs directly.
 * Everything else (transitive deps like jsonwebtoken, ws, zod, etc.)
 * gets inlined so linked consumers work without installing them.
 */
const CONSUMER_EXTERNALS = [
    "hono",
    "drizzle-orm",
    "@hono/node-server",
    "dotenv",
    "pg",
    "chokidar",
    "fsevents",
    "ws",
    "ts-morph",
];
const isExternal = (id: string) => {
    if (id.startsWith(".") || path.isAbsolute(id)) return false;
    // Externalize server-core to prevent singleton duplication (e.g. JWT config, etc)
    if (id === "@rebasepro/server-core" || id.startsWith("@rebasepro/server-core/")) return true;
    // Inline other @rebasepro/* packages (like common, types)
    if (id.startsWith("@rebasepro/")) return false;
    // Externalize only deps the consumer app explicitly installs
    if (CONSUMER_EXTERNALS.some(ext => id === ext || id.startsWith(ext + "/"))) return true;
    // Externalize Node built-ins
    if (["fs", "path", "url", "util", "crypto", "http", "https", "net", "tls", "stream", "events", "os", "child_process", "buffer", "assert", "node:"].some(b => id === b || id.startsWith("node:") || id.startsWith(b + "/"))) return true;
    // Inline everything else (jsonwebtoken, ws, zod, etc.)
    return false;
};

export default defineConfig(() => ({
    esbuild: {
        logOverride: { "this-is-undefined-in-esm": "silent" }
    },
    build: {
        lib: {
            entry: path.resolve(__dirname, "src/index.ts"),
            name: "Rebase Backend",
            fileName: (format) => `index.${format}.js`
        },
        target: "ESNEXT",
        minify: false,
        sourcemap: true,
        rollupOptions: {
            external: isExternal,
            output: {
                globals: {
                    "json-logic-js": "jsonLogic",
                    "fast-equals": "fastEquals",
                    "lodash/cloneDeep.js": "cloneDeep"
                }
            }
        }
    },
    resolve: {
        alias: {
            "@rebasepro/common": path.resolve(__dirname, "../common/src"),
            "@rebasepro/server-core": path.resolve(__dirname, "../server-core/src"),
            "@rebasepro/types": path.resolve(__dirname, "../types/src"),
            "@rebasepro/utils": path.resolve(__dirname, "../utils/src"),
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
