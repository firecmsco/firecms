/**
 * Account Management
 * 
 * Handles customer account lifecycle for GCP Marketplace:
 * - Create accounts when customers sign up
 * - Link GCP accounts to FireCMS accounts
 * - Handle account status changes
 */

import * as functions from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import {
    getAccountDetails,
    approveAccount,
    Account,
} from "./client";

const PROVIDER_ID = process.env.GCP_MARKETPLACE_PROVIDER_ID || "firecms";

/**
 * Firestore collection for storing account data
 */
const ACCOUNTS_COLLECTION = "marketplace_accounts";

/**
 * Cloud Function: Create/link a marketplace account
 */
export const createAccount = functions.onCall(
    { cors: true },
    async (request) => {
        if (!request.auth) {
            throw new functions.HttpsError("unauthenticated", "Must be authenticated");
        }

        const { procurementAccountId, approvalName } = request.data;
        if (!procurementAccountId) {
            throw new functions.HttpsError("invalid-argument", "procurementAccountId is required");
        }

        const accountName = `providers/${PROVIDER_ID}/accounts/${procurementAccountId}`;

        try {
            // Get account details from Procurement API
            const account = await getAccountDetails(accountName);

            // If account needs approval, approve it
            if (account.approvals?.some(a => a.state === "PENDING")) {
                const pendingApproval = account.approvals.find(a => a.state === "PENDING");
                if (pendingApproval) {
                    await approveAccount(accountName, approvalName || pendingApproval.name);
                    console.log(`Approved account: ${accountName}`);
                }
            }

            // Link the marketplace account to the Firebase user
            const firebaseUid = request.auth.uid;
            await linkAccountToUser(procurementAccountId, firebaseUid, account);

            return {
                success: true,
                accountId: procurementAccountId,
                state: account.state,
            };
        } catch (error: any) {
            console.error(`Failed to create/link account ${accountName}:`, error);
            throw new functions.HttpsError("internal", error.message);
        }
    }
);

/**
 * Cloud Function: Get account details
 */
export const getAccount = functions.onCall(
    { cors: true },
    async (request) => {
        if (!request.auth) {
            throw new functions.HttpsError("unauthenticated", "Must be authenticated");
        }

        const { procurementAccountId } = request.data;

        // If no ID provided, get the account linked to current user
        if (!procurementAccountId) {
            const userAccount = await getAccountByFirebaseUid(request.auth.uid);
            if (!userAccount) {
                return { success: false, error: "No marketplace account linked" };
            }
            return { success: true, account: userAccount };
        }

        const accountName = `providers/${PROVIDER_ID}/accounts/${procurementAccountId}`;

        try {
            const account = await getAccountDetails(accountName);
            return { success: true, account };
        } catch (error: any) {
            console.error(`Failed to get account ${accountName}:`, error);
            throw new functions.HttpsError("internal", error.message);
        }
    }
);

/**
 * Link a marketplace account to a Firebase user
 */
async function linkAccountToUser(
    procurementAccountId: string,
    firebaseUid: string,
    account: Account
): Promise<void> {
    const db = admin.firestore();

    await db.collection(ACCOUNTS_COLLECTION).doc(procurementAccountId).set({
        procurementAccountId,
        firebaseUid,
        accountName: account.name,
        state: account.state,
        provider: account.provider,
        createdAt: account.createTime,
        linkedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    // Also store reference in user's document
    await db.collection("users").doc(firebaseUid).set({
        marketplaceAccountId: procurementAccountId,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    console.log(`Linked account ${procurementAccountId} to user ${firebaseUid}`);
}

/**
 * Get account by Firebase UID
 */
export async function getAccountByFirebaseUid(firebaseUid: string): Promise<any | null> {
    const db = admin.firestore();

    const snapshot = await db.collection(ACCOUNTS_COLLECTION)
        .where("firebaseUid", "==", firebaseUid)
        .limit(1)
        .get();

    if (snapshot.empty) {
        return null;
    }

    return snapshot.docs[0].data();
}

/**
 * Get account by procurement account ID
 */
export async function getAccountByProcurementId(procurementAccountId: string): Promise<any | null> {
    const db = admin.firestore();

    const doc = await db.collection(ACCOUNTS_COLLECTION).doc(procurementAccountId).get();

    if (!doc.exists) {
        return null;
    }

    return doc.data();
}

/**
 * Update account status
 */
export async function updateAccountStatus(
    procurementAccountId: string,
    state: string
): Promise<void> {
    const db = admin.firestore();

    await db.collection(ACCOUNTS_COLLECTION).doc(procurementAccountId).update({
        state,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`Updated account ${procurementAccountId} status to ${state}`);
}
