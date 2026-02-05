/**
 * Entitlement Management
 * 
 * Handles entitlement lifecycle for GCP Marketplace customers:
 * - Approve new subscription requests
 * - Handle plan changes
 * - Process cancellations
 */

import * as functions from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import {
    getEntitlementDetails,
    approveEntitlementRequest,
    approvePlanChange,
    rejectEntitlementRequest,
    Entitlement,
} from "./client";

const PROVIDER_ID = process.env.GCP_MARKETPLACE_PROVIDER_ID || "firecms";

/**
 * Firestore collection for storing entitlement data
 */
const ENTITLEMENTS_COLLECTION = "marketplace_entitlements";

/**
 * Cloud Function: Approve an entitlement
 */
export const approveEntitlement = functions.onCall(
    { cors: true },
    async (request) => {
        // Verify admin access
        if (!request.auth?.token?.admin) {
            throw new functions.HttpsError("permission-denied", "Admin access required");
        }

        const { entitlementId } = request.data;
        if (!entitlementId) {
            throw new functions.HttpsError("invalid-argument", "entitlementId is required");
        }

        const entitlementName = `providers/${PROVIDER_ID}/entitlements/${entitlementId}`;

        try {
            const entitlement = await getEntitlementDetails(entitlementName);

            if (entitlement.state === "ENTITLEMENT_ACTIVATION_REQUESTED") {
                // New subscription - approve it
                await approveEntitlementRequest(entitlementName);
                console.log(`Approved new entitlement: ${entitlementName}`);
            } else if (entitlement.state === "ENTITLEMENT_PENDING_PLAN_CHANGE_APPROVAL" && entitlement.newPendingPlan) {
                // Plan change - approve it
                await approvePlanChange(entitlementName, entitlement.newPendingPlan);
                console.log(`Approved plan change for: ${entitlementName} to ${entitlement.newPendingPlan}`);
            }

            // Store entitlement in Firestore
            await storeEntitlement(entitlement);

            return { success: true, entitlement };
        } catch (error: any) {
            console.error(`Failed to approve entitlement ${entitlementName}:`, error);
            throw new functions.HttpsError("internal", error.message);
        }
    }
);

/**
 * Cloud Function: Reject an entitlement
 */
export const rejectEntitlement = functions.onCall(
    { cors: true },
    async (request) => {
        // Verify admin access
        if (!request.auth?.token?.admin) {
            throw new functions.HttpsError("permission-denied", "Admin access required");
        }

        const { entitlementId, reason } = request.data;
        if (!entitlementId) {
            throw new functions.HttpsError("invalid-argument", "entitlementId is required");
        }

        const entitlementName = `providers/${PROVIDER_ID}/entitlements/${entitlementId}`;

        try {
            await rejectEntitlementRequest(entitlementName, reason || "Rejected by provider");
            console.log(`Rejected entitlement: ${entitlementName}`);

            return { success: true };
        } catch (error: any) {
            console.error(`Failed to reject entitlement ${entitlementName}:`, error);
            throw new functions.HttpsError("internal", error.message);
        }
    }
);

/**
 * Cloud Function: Get entitlement details
 */
export const getEntitlement = functions.onCall(
    { cors: true },
    async (request) => {
        if (!request.auth) {
            throw new functions.HttpsError("unauthenticated", "Must be authenticated");
        }

        const { entitlementId } = request.data;
        if (!entitlementId) {
            throw new functions.HttpsError("invalid-argument", "entitlementId is required");
        }

        const entitlementName = `providers/${PROVIDER_ID}/entitlements/${entitlementId}`;

        try {
            const entitlement = await getEntitlementDetails(entitlementName);
            return { success: true, entitlement };
        } catch (error: any) {
            console.error(`Failed to get entitlement ${entitlementName}:`, error);
            throw new functions.HttpsError("internal", error.message);
        }
    }
);

/**
 * Store entitlement data in Firestore
 */
async function storeEntitlement(entitlement: Entitlement): Promise<void> {
    const db = admin.firestore();

    // Extract entitlement ID from name: providers/{provider}/entitlements/{id}
    const entitlementId = entitlement.name.split("/").pop()!;

    await db.collection(ENTITLEMENTS_COLLECTION).doc(entitlementId).set({
        ...entitlement,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
}

/**
 * Get entitlement by account ID from Firestore
 */
export async function getEntitlementByAccount(accountId: string): Promise<Entitlement | null> {
    const db = admin.firestore();

    const snapshot = await db.collection(ENTITLEMENTS_COLLECTION)
        .where("account", "==", `providers/${PROVIDER_ID}/accounts/${accountId}`)
        .where("state", "==", "ENTITLEMENT_ACTIVE")
        .limit(1)
        .get();

    if (snapshot.empty) {
        return null;
    }

    return snapshot.docs[0].data() as Entitlement;
}

/**
 * Map entitlement plan to Typesense VM machine type
 */
export function planToMachineType(plan: string): string {
    switch (plan) {
        case "micro":
        case "starter":
            return "e2-micro";
        case "small":
        case "professional":
            return "e2-small";
        case "medium":
        case "enterprise":
            return "e2-medium";
        default:
            return "e2-micro";
    }
}

/**
 * Map entitlement plan to disk size
 */
export function planToDiskSize(plan: string): number {
    switch (plan) {
        case "micro":
        case "starter":
            return 10;
        case "small":
        case "professional":
            return 50;
        case "medium":
        case "enterprise":
            return 100;
        default:
            return 10;
    }
}
