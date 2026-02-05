/**
 * HTTPS Proxy for Typesense
 * 
 * Migrated from Firebase Extension - proxies requests to Typesense VM
 */

import * as functions from "firebase-functions/v2/https";
import { createProxyMiddleware } from "http-proxy-middleware";
import { getVMExternalIP } from "./provision";

const TYPESENSE_PORT = 8108;
const vmZone = process.env.VM_ZONE || "us-central1-a";

/**
 * HTTP proxy to Typesense VM
 */
export const api = functions.onRequest(
    {
        memory: "256MiB",
        timeoutSeconds: 60,
        cors: true,
    },
    async (req, res) => {
        console.log("Request received:", req.method, req.url);

        // Handle CORS
        res.set("Access-Control-Allow-Origin", "*");
        res.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.set("Access-Control-Allow-Headers", "*");

        if (req.method === "OPTIONS") {
            res.status(204).send("");
            return;
        }

        // Determine which Typesense instance to proxy to
        // Check for account-specific instance first
        const accountId = req.headers["x-firecms-account-id"] as string;
        let vmIp: string;

        try {
            if (accountId) {
                // Get customer-specific VM IP from Firestore
                const admin = await import("firebase-admin");
                const db = admin.default.firestore();
                const provision = await db.collection("marketplace_provisions").doc(accountId).get();

                if (provision.exists && provision.data()?.status === "ACTIVE") {
                    vmIp = provision.data()!.externalIp;
                } else {
                    res.status(404).send("No active Typesense instance for this account");
                    return;
                }
            } else {
                // Default instance
                vmIp = await getVMExternalIP("firecms-typesense", vmZone);
            }
            console.log(`Resolved VM IP: ${vmIp}`);
        } catch (error) {
            console.error("Failed to get VM IP", error);
            res.status(500).send("Internal Server Error: Could not determine backend IP");
            return;
        }

        const target = `http://${vmIp}:${TYPESENSE_PORT}`;
        console.log(`Proxying to target: ${target}`);

        const middleware = createProxyMiddleware({
            target,
            changeOrigin: true,
            pathRewrite: (path) => {
                // Remove function name prefix from path
                let newPath = path.replace(/^\/api/, "").replace(/^\/[^/]+-api/, "");
                if (newPath === "") newPath = "/";
                return newPath;
            },
            on: {
                proxyReq: (proxyReq, req: any) => {
                    // Forward the API key if present
                    if (req.headers["x-typesense-api-key"]) {
                        proxyReq.setHeader("X-TYPESENSE-API-KEY", req.headers["x-typesense-api-key"]);
                    }
                    console.log(`Proxying ${req.method} request to: ${proxyReq.path}`);
                },
                error: (err, _req, res: any) => {
                    console.error("Proxy error:", err);
                    if (!res.headersSent) {
                        res.status(500).send("Proxy Error");
                    }
                }
            },
        });

        return middleware(req, res, (err: any) => {
            if (err) {
                console.error("Middleware error:", err);
                if (!res.headersSent) res.status(500).send("Middleware functionality error");
            } else {
                console.warn("Proxy middleware passed request through (not handled)");
                if (!res.headersSent) res.status(404).send("Not Found by Proxy");
            }
        });
    }
);
