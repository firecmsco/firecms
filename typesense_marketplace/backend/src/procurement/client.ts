/**
 * Partner Procurement API Client
 * 
 * Google Cloud Marketplace requires building a custom client library
 * from the Discovery Document since the Partner Procurement API is restricted.
 * 
 * @see https://cloud.google.com/marketplace/docs/partners/integrated-saas/backend-integration
 */

import { google } from "googleapis";
import { GaxiosResponse } from "gaxios";

// Discovery document URL for Partner Procurement API
const DISCOVERY_URL = "https://cloudcommerceprocurement.googleapis.com/$discovery/rest?version=v1";

let procurementApi: any = null;

/**
 * Get authenticated Procurement API client
 */
export async function getProcurementClient(): Promise<any> {
    if (procurementApi) return procurementApi;

    const auth = new google.auth.GoogleAuth({
        scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });

    const authClient = await auth.getClient();

    // Build client from discovery document
    procurementApi = await google.discoverAPI(DISCOVERY_URL);
    google.options({ auth: authClient as any });

    return procurementApi;
}

/**
 * Partner Procurement API types
 */
export interface Account {
    name: string;
    state: "ACCOUNT_STATE_UNSPECIFIED" | "ACCOUNT_ACTIVE" | "ACCOUNT_CANCELLED";
    provider: string;
    createTime: string;
    updateTime: string;
    approvals?: Approval[];
}

export interface Approval {
    name: string;
    state: "STATE_UNSPECIFIED" | "PENDING" | "APPROVED" | "REJECTED";
    reason?: string;
    updateTime?: string;
}

export interface Entitlement {
    name: string;
    account: string;
    provider: string;
    product: string;
    plan: string;
    state: "ENTITLEMENT_STATE_UNSPECIFIED" | "ENTITLEMENT_ACTIVATION_REQUESTED" |
    "ENTITLEMENT_ACTIVE" | "ENTITLEMENT_PENDING_CANCELLATION" |
    "ENTITLEMENT_CANCELLED" | "ENTITLEMENT_PENDING_PLAN_CHANGE" |
    "ENTITLEMENT_PENDING_PLAN_CHANGE_APPROVAL" | "ENTITLEMENT_SUSPENDED";
    newPendingPlan?: string;
    usageReportingId?: string;
    messageToUser?: string;
    createTime: string;
    updateTime: string;
}

export interface EntitlementMessage {
    entitlement: Entitlement;
    eventType: "ENTITLEMENT_CREATED" | "ENTITLEMENT_ACTIVE" | "ENTITLEMENT_PLAN_CHANGE_REQUESTED" |
    "ENTITLEMENT_PLAN_CHANGED" | "ENTITLEMENT_PLAN_CHANGE_CANCELLED" |
    "ENTITLEMENT_PENDING_CANCELLATION" | "ENTITLEMENT_CANCELLED" |
    "ENTITLEMENT_CANCELLATION_REVERTED" | "ENTITLEMENT_DELETED";
}

export interface AccountMessage {
    account: Account;
    eventType: "ACCOUNT_ACTIVE" | "ACCOUNT_DELETED";
}

/**
 * List all accounts for the provider
 */
export async function listAccounts(provider: string): Promise<Account[]> {
    const client = await getProcurementClient();

    const response: GaxiosResponse = await client.providers.accounts.list({
        parent: `providers/${provider}`,
    });

    return response.data.accounts || [];
}

/**
 * Get a specific account
 */
export async function getAccountDetails(accountName: string): Promise<Account> {
    const client = await getProcurementClient();

    const response: GaxiosResponse = await client.providers.accounts.get({
        name: accountName,
    });

    return response.data;
}

/**
 * Approve an account
 */
export async function approveAccount(
    accountName: string,
    approvalName: string,
    reason?: string
): Promise<void> {
    const client = await getProcurementClient();

    await client.providers.accounts.approve({
        name: accountName,
        requestBody: {
            approvalName,
            reason,
        },
    });
}

/**
 * List entitlements for an account
 */
export async function listEntitlements(provider: string, filter?: string): Promise<Entitlement[]> {
    const client = await getProcurementClient();

    const response: GaxiosResponse = await client.providers.entitlements.list({
        parent: `providers/${provider}`,
        filter,
    });

    return response.data.entitlements || [];
}

/**
 * Get a specific entitlement
 */
export async function getEntitlementDetails(entitlementName: string): Promise<Entitlement> {
    const client = await getProcurementClient();

    const response: GaxiosResponse = await client.providers.entitlements.get({
        name: entitlementName,
    });

    return response.data;
}

/**
 * Approve an entitlement
 */
export async function approveEntitlementRequest(entitlementName: string): Promise<void> {
    const client = await getProcurementClient();

    await client.providers.entitlements.approve({
        name: entitlementName,
        requestBody: {},
    });
}

/**
 * Approve a plan change for an entitlement
 */
export async function approvePlanChange(entitlementName: string, pendingPlanName: string): Promise<void> {
    const client = await getProcurementClient();

    await client.providers.entitlements.approvePlanChange({
        name: entitlementName,
        requestBody: {
            pendingPlanName,
        },
    });
}

/**
 * Reject an entitlement
 */
export async function rejectEntitlementRequest(entitlementName: string, reason: string): Promise<void> {
    const client = await getProcurementClient();

    await client.providers.entitlements.reject({
        name: entitlementName,
        requestBody: {
            reason,
        },
    });
}

/**
 * Suspend an entitlement
 */
export async function suspendEntitlement(entitlementName: string, reason: string): Promise<void> {
    const client = await getProcurementClient();

    await client.providers.entitlements.suspend({
        name: entitlementName,
        requestBody: {
            reason,
        },
    });
}
