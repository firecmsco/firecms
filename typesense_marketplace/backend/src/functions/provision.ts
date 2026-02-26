/**
 * Typesense VM Provisioning
 * 
 * Migrated from Firebase Extension - provisions Compute Engine VM with Typesense
 * Modified to work with GCP Marketplace entitlements
 */

import * as functions from "firebase-functions/v2/https";
import { google } from "googleapis";
import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
import * as crypto from "crypto";
import * as admin from "firebase-admin";
import { performBackfill } from "./backfill";
import { getEntitlementByAccount, planToMachineType, planToDiskSize } from "../procurement/entitlements";

const projectId = process.env.GCLOUD_PROJECT!;
const defaultVmZone = process.env.VM_ZONE || "us-central1-a";
const TYPESENSE_PORT = 8108;

/**
 * HTTP function to provision the Typesense VM.
 * For marketplace customers, uses entitlement-based configuration.
 */
export const provisionSearchNode = functions.onRequest(
    {
        timeoutSeconds: 540,
        memory: "512MiB",
        cors: true,
    },
    async (req, res) => {
        console.log("provisionSearchNode triggered", { method: req.method });

        if (req.method !== "POST" && req.method !== "GET") {
            res.status(405).send({ error: "Method Not Allowed. Use GET or POST." });
            return;
        }

        try {
            // Get account ID from request or auth token
            const accountId = req.query.accountId as string || req.body?.accountId;

            let machineType = process.env.TYPESENSE_MACHINE_TYPE || "e2-micro";
            let diskSizeGb = parseInt(process.env.DISK_SIZE_GB || "10", 10);
            let vmZone = req.query.zone as string || defaultVmZone;
            let collectionsToIndex = (req.body?.collections || process.env.COLLECTIONS_TO_INDEX || "*").split(",").map((s: string) => s.trim());

            // If marketplace customer, get plan from entitlement
            if (accountId) {
                const entitlement = await getEntitlementByAccount(accountId);
                if (entitlement) {
                    machineType = planToMachineType(entitlement.plan);
                    diskSizeGb = planToDiskSize(entitlement.plan);
                    console.log(`Using entitlement plan: ${entitlement.plan} -> ${machineType}, ${diskSizeGb}GB`);
                }
            }

            const instanceName = accountId ? `typesense-${accountId.substring(0, 20)}` : "firecms-typesense";
            const diskName = `${instanceName}-data`;
            const secretId = accountId ? `typesense-api-key-${accountId.substring(0, 20)}` : "firecms-search-api-key";

            const typesenseUrl = await runSetup({
                instanceName,
                diskName,
                secretId,
                machineType,
                diskSizeGb,
                vmZone,
                collectionsToIndex,
                accountId,
            });

            res.status(200).json({
                success: true,
                message: "Typesense VM provisioned successfully",
                typesenseUrl,
                accountId,
            });
        } catch (error: any) {
            console.error("provisionSearchNode failed:", error);

            if (error.code === 403 || error.code === 7 || error.message?.includes("PERMISSION_DENIED")) {
                res.status(403).json({
                    success: false,
                    error: "Permission denied",
                    message: "Missing required IAM roles. Please check Compute Admin permissions.",
                });
            } else {
                res.status(500).json({
                    success: false,
                    error: error.message || "Unknown error",
                });
            }
        }
    }
);

interface SetupConfig {
    instanceName: string;
    diskName: string;
    secretId: string;
    machineType: string;
    diskSizeGb: number;
    vmZone: string;
    collectionsToIndex: string[];
    accountId?: string;
}

/**
 * Core setup logic
 */
async function runSetup(config: SetupConfig): Promise<string> {
    const { instanceName, diskName, secretId, machineType, diskSizeGb, vmZone, collectionsToIndex, accountId } = config;

    console.log("=== Typesense VM Setup Started ===");
    console.log(`Project: ${projectId}`);
    console.log(`VM Zone: ${vmZone}`);
    console.log(`Machine Type: ${machineType}`);
    console.log(`Disk Size: ${diskSizeGb}GB`);
    console.log(`Account ID: ${accountId || "N/A"}`);

    // 1. Get or Generate API key
    let apiKey = await retrieveExistingApiKey(secretId);
    if (!apiKey) {
        apiKey = crypto.randomBytes(32).toString("hex");
        await storeApiKey(secretId, apiKey);
    }

    // 2. Create firewall rule
    const firewallName = `allow-typesense-${instanceName.substring(0, 20)}`;
    await createFirewallRule(firewallName, instanceName);

    // 3. Create persistent disk
    await createPersistentDisk(diskName, diskSizeGb, vmZone);

    // 4. Deploy VM
    await deployTypesenseVM(instanceName, diskName, machineType, vmZone, apiKey);

    // 5. Get external IP
    const externalIp = await getVMExternalIP(instanceName, vmZone);
    const typesenseUrl = `http://${externalIp}:${TYPESENSE_PORT}`;

    // 6. Wait for health
    await waitForTypesenseHealth(externalIp);

    // 7. Store provision info
    if (accountId) {
        const db = admin.firestore();
        await db.collection("marketplace_provisions").doc(accountId).set({
            instanceName,
            diskName,
            secretId,
            machineType,
            diskSizeGb,
            vmZone,
            externalIp,
            typesenseUrl,
            collectionsToIndex,
            status: "ACTIVE",
            provisionedAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
    }

    // 8. Trigger backfill
    try {
        await performBackfill({ accountId, collectionsToIndex });
    } catch (e: any) {
        console.warn("Backfill failed (non-fatal):", e.message);
    }

    console.log("=== Typesense VM Setup Completed ===");
    return typesenseUrl;
}

async function storeApiKey(secretId: string, apiKey: string): Promise<void> {
    const client = new SecretManagerServiceClient();

    try {
        await client.createSecret({
            parent: `projects/${projectId}`,
            secretId,
            secret: { replication: { automatic: {} } },
        });
    } catch (e: any) {
        if (e.code !== 6) throw e; // 6 = ALREADY_EXISTS
    }

    await client.addSecretVersion({
        parent: `projects/${projectId}/secrets/${secretId}`,
        payload: { data: Buffer.from(apiKey) },
    });
}

async function retrieveExistingApiKey(secretId: string): Promise<string | null> {
    const client = new SecretManagerServiceClient();
    try {
        const [version] = await client.accessSecretVersion({
            name: `projects/${projectId}/secrets/${secretId}/versions/latest`,
        });
        return version.payload?.data?.toString() || null;
    } catch {
        return null;
    }
}

async function createFirewallRule(firewallName: string, instanceName: string): Promise<void> {
    const compute = google.compute("v1");
    const auth = new google.auth.GoogleAuth({
        scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });
    const authClient = await auth.getClient();
    google.options({ auth: authClient as any });

    try {
        await compute.firewalls.get({ project: projectId, firewall: firewallName });
    } catch (e: any) {
        if (e.code === 404 || e.response?.status === 404) {
            await compute.firewalls.insert({
                project: projectId,
                requestBody: {
                    name: firewallName,
                    description: `Allow Typesense traffic for ${instanceName}`,
                    network: `projects/${projectId}/global/networks/default`,
                    direction: "INGRESS",
                    priority: 1000,
                    sourceRanges: ["0.0.0.0/0"],
                    targetTags: [instanceName],
                    allowed: [{ IPProtocol: "tcp", ports: [String(TYPESENSE_PORT)] }],
                },
            });
        } else {
            throw e;
        }
    }
}

async function createPersistentDisk(diskName: string, diskSizeGb: number, vmZone: string): Promise<void> {
    const compute = google.compute("v1");

    try {
        await compute.disks.get({ project: projectId, zone: vmZone, disk: diskName });
    } catch (e: any) {
        if (e.code === 404 || e.response?.status === 404) {
            const diskOp = await compute.disks.insert({
                project: projectId,
                zone: vmZone,
                requestBody: {
                    name: diskName,
                    sizeGb: String(diskSizeGb),
                    type: `zones/${vmZone}/diskTypes/pd-standard`,
                    description: "Typesense data disk",
                },
            });
            await waitForZoneOperation(diskOp.data.name!, vmZone);
        } else {
            throw e;
        }
    }
}

async function deployTypesenseVM(
    instanceName: string,
    diskName: string,
    machineType: string,
    vmZone: string,
    apiKey: string
): Promise<void> {
    const compute = google.compute("v1");

    const startupScript = `#!/bin/bash
set -e

if ! mount | grep -q /mnt/disks/typesense-data; then
    if ! blkid /dev/disk/by-id/google-${diskName}; then
        mkfs.ext4 -m 0 -E lazy_itable_init=0,lazy_journal_init=0,discard /dev/disk/by-id/google-${diskName}
    fi
    mkdir -p /mnt/disks/typesense-data
    mount -o discard,defaults /dev/disk/by-id/google-${diskName} /mnt/disks/typesense-data
    chmod a+w /mnt/disks/typesense-data
    echo '/dev/disk/by-id/google-${diskName} /mnt/disks/typesense-data ext4 discard,defaults,nofail 0 2' | tee -a /etc/fstab
fi

if ! command -v docker &> /dev/null; then
    apt-get update
    apt-get install -y docker.io
    systemctl enable docker
    systemctl start docker
fi

docker stop typesense 2>/dev/null || true
docker rm typesense 2>/dev/null || true

docker run -d \\
    --name typesense \\
    --restart=always \\
    -p ${TYPESENSE_PORT}:${TYPESENSE_PORT} \\
    -v /mnt/disks/typesense-data:/data \\
    typesense/typesense:27.1 \\
    --data-dir=/data \\
    --api-key=${apiKey} \\
    --api-port=${TYPESENSE_PORT} \\
    --enable-cors
`;

    let instanceExists = false;
    try {
        await compute.instances.get({ project: projectId, zone: vmZone, instance: instanceName });
        instanceExists = true;
    } catch (e: any) {
        if (e.code !== 404 && e.response?.status !== 404) throw e;
    }

    if (instanceExists) {
        const instance = await compute.instances.get({ project: projectId, zone: vmZone, instance: instanceName });
        await compute.instances.setMetadata({
            project: projectId,
            zone: vmZone,
            instance: instanceName,
            requestBody: {
                fingerprint: instance.data.metadata?.fingerprint,
                items: [{ key: "startup-script", value: startupScript }],
            },
        });
        const resetOp = await compute.instances.reset({ project: projectId, zone: vmZone, instance: instanceName });
        await waitForZoneOperation(resetOp.data.name!, vmZone);
    } else {
        const insertOp = await compute.instances.insert({
            project: projectId,
            zone: vmZone,
            requestBody: {
                name: instanceName,
                machineType: `zones/${vmZone}/machineTypes/${machineType}`,
                tags: { items: [instanceName] },
                disks: [
                    {
                        boot: true,
                        autoDelete: true,
                        initializeParams: {
                            sourceImage: "projects/debian-cloud/global/images/family/debian-12",
                            diskSizeGb: "10",
                            diskType: `zones/${vmZone}/diskTypes/pd-standard`,
                        },
                    },
                    {
                        source: `zones/${vmZone}/disks/${diskName}`,
                        autoDelete: false,
                        deviceName: diskName,
                    },
                ],
                networkInterfaces: [{
                    network: `projects/${projectId}/global/networks/default`,
                    accessConfigs: [{ name: "External NAT", type: "ONE_TO_ONE_NAT", networkTier: "STANDARD" }],
                }],
                metadata: { items: [{ key: "startup-script", value: startupScript }] },
            },
        });
        await waitForZoneOperation(insertOp.data.name!, vmZone);
    }
}

async function waitForZoneOperation(operationName: string, zone: string): Promise<void> {
    const compute = google.compute("v1");

    for (let i = 0; i < 60; i++) {
        const op = await compute.zoneOperations.get({ project: projectId, zone, operation: operationName });
        if (op.data.status === "DONE") {
            if (op.data.error) throw new Error(`Operation failed: ${JSON.stringify(op.data.error)}`);
            return;
        }
        await new Promise(resolve => setTimeout(resolve, 5000));
    }
    throw new Error(`Operation ${operationName} timed out`);
}

export async function getVMExternalIP(instanceName: string, vmZone: string): Promise<string> {
    const compute = google.compute("v1");
    const auth = new google.auth.GoogleAuth({
        scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });
    const authClient = await auth.getClient();
    google.options({ auth: authClient as any });

    const instance = await compute.instances.get({ project: projectId, zone: vmZone, instance: instanceName });
    const externalIp = instance.data.networkInterfaces?.[0]?.accessConfigs?.[0]?.natIP;

    if (!externalIp) throw new Error("Could not find external IP for Typesense VM");
    return externalIp;
}

async function waitForTypesenseHealth(externalIp: string): Promise<void> {
    const healthUrl = `http://${externalIp}:${TYPESENSE_PORT}/health`;

    for (let i = 0; i < 60; i++) {
        try {
            const response = await fetch(healthUrl, { signal: AbortSignal.timeout(5000) });
            if (response.ok) return;
        } catch {
            // Not ready yet
        }
        await new Promise(resolve => setTimeout(resolve, 5000));
    }
    console.warn("Typesense health check timed out - VM may still be starting");
}

/**
 * Get Typesense host and key for an account
 */
export async function getTypesenseHostAndKey(accountId?: string): Promise<{ host: string; port: number; protocol: string; apiKey: string }> {
    const db = admin.firestore();

    if (accountId) {
        const provision = await db.collection("marketplace_provisions").doc(accountId).get();
        if (provision.exists) {
            const data = provision.data()!;
            const secretClient = new SecretManagerServiceClient();
            const [version] = await secretClient.accessSecretVersion({
                name: `projects/${projectId}/secrets/${data.secretId}/versions/latest`,
            });
            return {
                host: data.externalIp,
                port: TYPESENSE_PORT,
                protocol: "http",
                apiKey: version.payload?.data?.toString() || "",
            };
        }
    }

    // Fallback to default
    const secretClient = new SecretManagerServiceClient();
    const [version] = await secretClient.accessSecretVersion({
        name: `projects/${projectId}/secrets/firecms-search-api-key/versions/latest`,
    });

    const host = await getVMExternalIP("firecms-typesense", defaultVmZone);

    return { host, port: TYPESENSE_PORT, protocol: "http", apiKey: version.payload?.data?.toString() || "" };
}
