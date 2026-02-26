/**
 * FireCMS Typesense Marketplace - Main Entry Point
 * 
 * Google Cloud Marketplace SaaS integration with:
 * - Partner Procurement API for customer/entitlement management
 * - Pub/Sub handlers for marketplace events
 * - Typesense VM provisioning and Firestore sync
 */

import * as admin from "firebase-admin";

// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp();
}

// Pub/Sub handlers for Marketplace events
export { handleMarketplaceEvent } from "./pubsub/handlers";

// Procurement API functions
export { approveEntitlement, rejectEntitlement, getEntitlement } from "./procurement/entitlements";
export { createAccount, getAccount } from "./procurement/accounts";

// Core Typesense functions (migrated from Firebase Extension)
export { provisionSearchNode } from "./functions/provision";
export { onFirestoreWrite } from "./functions/sync";
export { backfill } from "./functions/backfill";
export { getSearchConfig } from "./functions/config";
export { api } from "./functions/proxy";

// Signup page handler for JWT processing
export { handleSignup } from "./frontend/signup";
