/**
 * Pub/Sub Handlers for GCP Marketplace Events
 * 
 * Google Cloud Marketplace sends events via Pub/Sub for:
 * - New customer signups
 * - Entitlement activation requests
 * - Plan changes
 * - Cancellations
 * 
 * @see https://cloud.google.com/marketplace/docs/partners/integrated-saas/backend-integration#receive-messages
 */

import * as functions from "firebase-functions/v2/pubsub";
import * as admin from "firebase-admin";
import {
    getEntitlementDetails,
    approveEntitlementRequest,
    approvePlanChange,
    Entitlement,
    Account,
    EntitlementMessage,
    AccountMessage,
} from "../procurement/client";
import { getAccountByProcurementId, updateAccountStatus } from "../procurement/accounts";
import { planToMachineType, planToDiskSize } from "../procurement/entitlements";

// The Pub/Sub topic is provided by Google during onboarding
const MARKETPLACE_PUBSUB_TOPIC = process.env.GCP_MARKETPLACE_PUBSUB_TOPIC || "cloud-commerce-procurement";
const PROVIDER_ID = process.env.GCP_MARKETPLACE_PROVIDER_ID || "firecms";

/**
 * Firestore collections
 */
const ENTITLEMENTS_COLLECTION = "marketplace_entitlements";
const PROVISIONS_COLLECTION = "marketplace_provisions";

/**
 * Main Pub/Sub handler for all marketplace events
 */
export const handleMarketplaceEvent = functions.onMessagePublished(
    {
        topic: MARKETPLACE_PUBSUB_TOPIC,
        retry: true,
    },
    async (event) => {
        const message = event.data.message;
        const data = message.json as any;

        console.log("Received marketplace event:", JSON.stringify(data));

        // Determine event type
        if (data.entitlement) {
            await handleEntitlementEvent(data as EntitlementMessage);
        } else if (data.account) {
            await handleAccountEvent(data as AccountMessage);
        } else {
            console.warn("Unknown marketplace event type:", data);
        }
    }
);

/**
 * Handle entitlement-related events
 */
async function handleEntitlementEvent(message: EntitlementMessage): Promise<void> {
    const { entitlement, eventType } = message;
    const entitlementId = entitlement.name.split("/").pop()!;

    console.log(`Processing entitlement event: ${eventType} for ${entitlementId}`);

    switch (eventType) {
        case "ENTITLEMENT_CREATED":
        case "ENTITLEMENT_ACTIVE":
            // Auto-approve new entitlements
            if (entitlement.state === "ENTITLEMENT_ACTIVATION_REQUESTED") {
                await autoApproveEntitlement(entitlement);
            }
            // Store entitlement and trigger VM provisioning
            await storeEntitlement(entitlement);
            if (entitlement.state === "ENTITLEMENT_ACTIVE") {
                await triggerVMProvisioning(entitlement);
            }
            break;

        case "ENTITLEMENT_PLAN_CHANGE_REQUESTED":
            // Auto-approve plan changes
            if (entitlement.newPendingPlan) {
                await autoApprovePlanChange(entitlement);
            }
            break;

        case "ENTITLEMENT_PLAN_CHANGED":
            // Plan change approved - update VM if needed
            await storeEntitlement(entitlement);
            await updateVMForPlanChange(entitlement);
            break;

        case "ENTITLEMENT_PENDING_CANCELLATION":
        case "ENTITLEMENT_CANCELLED":
            // Handle cancellation - mark entitlement as cancelled
            await storeEntitlement(entitlement);
            if (eventType === "ENTITLEMENT_CANCELLED") {
                await handleCancellation(entitlement);
            }
            break;

        case "ENTITLEMENT_DELETED":
            // Entitlement deleted - cleanup
            await deleteEntitlement(entitlementId);
            break;

        default:
            console.log(`Unhandled entitlement event type: ${eventType}`);
            await storeEntitlement(entitlement);
    }
}

/**
 * Handle account-related events
 */
async function handleAccountEvent(message: AccountMessage): Promise<void> {
    const { account, eventType } = message;
    const accountId = account.name.split("/").pop()!;

    console.log(`Processing account event: ${eventType} for ${accountId}`);

    switch (eventType) {
        case "ACCOUNT_ACTIVE":
            await updateAccountStatus(accountId, "ACCOUNT_ACTIVE");
            break;

        case "ACCOUNT_DELETED":
            await updateAccountStatus(accountId, "ACCOUNT_DELETED");
            // Cleanup associated resources
            await cleanupAccountResources(accountId);
            break;

        default:
            console.log(`Unhandled account event type: ${eventType}`);
    }
}

/**
 * Auto-approve a new entitlement
 */
async function autoApproveEntitlement(entitlement: Entitlement): Promise<void> {
    try {
        await approveEntitlementRequest(entitlement.name);
        console.log(`Auto-approved entitlement: ${entitlement.name}`);
    } catch (error) {
        console.error(`Failed to auto-approve entitlement ${entitlement.name}:`, error);
        throw error;
    }
}

/**
 * Auto-approve a plan change
 */
async function autoApprovePlanChange(entitlement: Entitlement): Promise<void> {
    if (!entitlement.newPendingPlan) return;

    try {
        await approvePlanChange(entitlement.name, entitlement.newPendingPlan);
        console.log(`Auto-approved plan change for ${entitlement.name} to ${entitlement.newPendingPlan}`);
    } catch (error) {
        console.error(`Failed to auto-approve plan change for ${entitlement.name}:`, error);
        throw error;
    }
}

/**
 * Store entitlement data in Firestore
 */
async function storeEntitlement(entitlement: Entitlement): Promise<void> {
    const db = admin.firestore();
    const entitlementId = entitlement.name.split("/").pop()!;

    await db.collection(ENTITLEMENTS_COLLECTION).doc(entitlementId).set({
        ...entitlement,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    console.log(`Stored entitlement: ${entitlementId}`);
}

/**
 * Delete entitlement from Firestore
 */
async function deleteEntitlement(entitlementId: string): Promise<void> {
    const db = admin.firestore();
    await db.collection(ENTITLEMENTS_COLLECTION).doc(entitlementId).delete();
    console.log(`Deleted entitlement: ${entitlementId}`);
}

/**
 * Trigger VM provisioning for a new entitlement
 */
async function triggerVMProvisioning(entitlement: Entitlement): Promise<void> {
    const db = admin.firestore();
    const entitlementId = entitlement.name.split("/").pop()!;
    const accountId = entitlement.account.split("/").pop()!;

    // Check if already provisioned
    const existingProvision = await db.collection(PROVISIONS_COLLECTION).doc(accountId).get();
    if (existingProvision.exists && existingProvision.data()?.status === "ACTIVE") {
        console.log(`VM already provisioned for account ${accountId}`);
        return;
    }

    // Determine VM specs based on plan
    const machineType = planToMachineType(entitlement.plan);
    const diskSize = planToDiskSize(entitlement.plan);

    // Create provisioning task
    await db.collection(PROVISIONS_COLLECTION).doc(accountId).set({
        accountId,
        entitlementId,
        plan: entitlement.plan,
        machineType,
        diskSize,
        status: "PENDING",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`Created provisioning task for account ${accountId} with plan ${entitlement.plan}`);

    // TODO: Trigger actual VM provisioning via Cloud Tasks or direct call
    // This would call the provisionSearchNode function with account-specific parameters
}

/**
 * Update VM for plan change (resize if needed)
 */
async function updateVMForPlanChange(entitlement: Entitlement): Promise<void> {
    const accountId = entitlement.account.split("/").pop()!;
    const db = admin.firestore();

    const newMachineType = planToMachineType(entitlement.plan);
    const newDiskSize = planToDiskSize(entitlement.plan);

    // Update provision record
    await db.collection(PROVISIONS_COLLECTION).doc(accountId).update({
        plan: entitlement.plan,
        machineType: newMachineType,
        diskSize: newDiskSize,
        status: "RESIZE_PENDING",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`Plan change for account ${accountId}: resize to ${newMachineType}`);

    // TODO: Trigger VM resize operation
}

/**
 * Handle entitlement cancellation
 */
async function handleCancellation(entitlement: Entitlement): Promise<void> {
    const accountId = entitlement.account.split("/").pop()!;
    const db = admin.firestore();

    // Mark provision as cancelled (don't delete VM immediately - grace period)
    await db.collection(PROVISIONS_COLLECTION).doc(accountId).update({
        status: "CANCELLED",
        cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`Cancelled provision for account ${accountId}`);

    // TODO: Schedule VM deletion after grace period (e.g., 30 days)
}

/**
 * Cleanup resources when account is deleted
 */
async function cleanupAccountResources(accountId: string): Promise<void> {
    const db = admin.firestore();

    // Delete provision record
    await db.collection(PROVISIONS_COLLECTION).doc(accountId).delete();

    // TODO: Delete VM and associated resources

    console.log(`Cleaned up resources for account ${accountId}`);
}
