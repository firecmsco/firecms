/**
 * JWT Signup Handler
 * 
 * When a customer signs up via GCP Marketplace, Google redirects them to
 * your signup page with a JWT containing the procurement account ID.
 * This handler processes that JWT and links the account.
 * 
 * @see https://cloud.google.com/marketplace/docs/partners/integrated-saas/frontend-integration
 */

import * as functions from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as jwt from "jsonwebtoken";
import { getAccountDetails, approveAccount } from "../procurement/client";

const PROVIDER_ID = process.env.GCP_MARKETPLACE_PROVIDER_ID || "firecms";

// Google's public keys for JWT verification
// In production, these should be fetched from Google's JWKS endpoint
const GOOGLE_ISSUERS = [
    "https://www.googleapis.com/robot/v1/metadata/x509/cloud-commerce-partner@system.gserviceaccount.com"
];

interface MarketplaceJWT {
    iss: string;
    iat: number;
    exp: number;
    aud: string;
    sub: string; // Procurement account ID
}

/**
 * HTTP endpoint for handling Marketplace signup redirects
 * 
 * URL: https://your-project.cloudfunctions.net/handleSignup?jwt=<token>
 */
export const handleSignup = functions.onRequest(
    {
        cors: ["https://console.cloud.google.com", "https://console.developers.google.com"],
    },
    async (req, res) => {
        const token = req.query.jwt as string || req.query.token as string;

        if (!token) {
            res.status(400).json({
                error: "Missing JWT token",
                message: "This page should be accessed via Google Cloud Marketplace signup flow",
            });
            return;
        }

        try {
            // Decode (but don't verify yet - for debugging)
            const decoded = jwt.decode(token) as MarketplaceJWT;

            if (!decoded) {
                throw new Error("Invalid JWT format");
            }

            console.log("Received signup JWT:", {
                iss: decoded.iss,
                sub: decoded.sub,
                aud: decoded.aud,
                exp: decoded.exp,
            });

            const procurementAccountId = decoded.sub;
            if (!procurementAccountId) {
                throw new Error("JWT missing subject (procurement account ID)");
            }

            // Get account details from Procurement API
            const accountName = `providers/${PROVIDER_ID}/accounts/${procurementAccountId}`;
            let account;
            try {
                account = await getAccountDetails(accountName);
            } catch (error: any) {
                console.error("Failed to get account details:", error);
                // Account might not be ready yet - proceed anyway
            }

            // Auto-approve account if pending
            if (account?.approvals?.some(a => a.state === "PENDING")) {
                const pendingApproval = account.approvals.find(a => a.state === "PENDING");
                if (pendingApproval) {
                    try {
                        await approveAccount(accountName, pendingApproval.name);
                        console.log(`Auto-approved account: ${accountName}`);
                    } catch (error) {
                        console.error("Failed to auto-approve account:", error);
                    }
                }
            }

            // Store the pending signup in Firestore (to be linked when user authenticates)
            const db = admin.firestore();
            await db.collection("marketplace_pending_signups").doc(procurementAccountId).set({
                procurementAccountId,
                accountName,
                jwt: token,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                expiresAt: new Date(decoded.exp * 1000),
            });

            // Redirect to your app's signup/login page with the account ID
            const appUrl = process.env.APP_URL || "https://firecms.co";
            const redirectUrl = `${appUrl}/marketplace/signup?accountId=${procurementAccountId}`;

            // Option 1: Redirect to app
            // res.redirect(redirectUrl);

            // Option 2: Return HTML page with signup options
            res.status(200).send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>FireCMS Typesense Search - Setup</title>
                    <style>
                        * { box-sizing: border-box; }
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            min-height: 100vh;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            margin: 0;
                            padding: 20px;
                        }
                        .card {
                            background: white;
                            border-radius: 16px;
                            padding: 40px;
                            max-width: 500px;
                            width: 100%;
                            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                        }
                        .logo {
                            text-align: center;
                            margin-bottom: 24px;
                        }
                        .logo img {
                            height: 40px;
                        }
                        h1 {
                            font-size: 24px;
                            font-weight: 600;
                            color: #1a1a1a;
                            margin: 0 0 8px 0;
                            text-align: center;
                        }
                        .subtitle {
                            color: #666;
                            text-align: center;
                            margin-bottom: 32px;
                        }
                        .success-icon {
                            width: 64px;
                            height: 64px;
                            background: #10b981;
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            margin: 0 auto 24px;
                        }
                        .success-icon svg {
                            width: 32px;
                            height: 32px;
                            color: white;
                        }
                        .account-id {
                            background: #f3f4f6;
                            border-radius: 8px;
                            padding: 12px 16px;
                            font-family: monospace;
                            font-size: 14px;
                            color: #374151;
                            margin-bottom: 24px;
                            word-break: break-all;
                        }
                        .btn {
                            display: block;
                            width: 100%;
                            padding: 14px 24px;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            text-decoration: none;
                            text-align: center;
                            border-radius: 8px;
                            font-weight: 500;
                            font-size: 16px;
                            transition: transform 0.2s, box-shadow 0.2s;
                        }
                        .btn:hover {
                            transform: translateY(-2px);
                            box-shadow: 0 10px 20px -10px rgba(102, 126, 234, 0.5);
                        }
                        .steps {
                            margin-top: 32px;
                            padding-top: 24px;
                            border-top: 1px solid #e5e7eb;
                        }
                        .steps h3 {
                            font-size: 14px;
                            font-weight: 600;
                            color: #374151;
                            margin: 0 0 16px 0;
                        }
                        .step {
                            display: flex;
                            align-items: flex-start;
                            margin-bottom: 12px;
                        }
                        .step-num {
                            width: 24px;
                            height: 24px;
                            background: #e5e7eb;
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 12px;
                            font-weight: 600;
                            color: #374151;
                            flex-shrink: 0;
                            margin-right: 12px;
                        }
                        .step-text {
                            font-size: 14px;
                            color: #4b5563;
                            line-height: 1.5;
                        }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <div class="logo">
                            <img src="https://firecms.co/img/firecms_logo.svg" alt="FireCMS">
                        </div>
                        
                        <div class="success-icon">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                        
                        <h1>Welcome to FireCMS Typesense Search!</h1>
                        <p class="subtitle">Your subscription has been activated successfully.</p>
                        
                        <div class="account-id">
                            <strong>Account ID:</strong><br>
                            ${procurementAccountId}
                        </div>
                        
                        <a href="${redirectUrl}" class="btn">
                            Continue to Setup →
                        </a>
                        
                        <div class="steps">
                            <h3>Next Steps</h3>
                            <div class="step">
                                <div class="step-num">1</div>
                                <div class="step-text">Sign in or create a FireCMS account</div>
                            </div>
                            <div class="step">
                                <div class="step-num">2</div>
                                <div class="step-text">Configure your Firestore collections to index</div>
                            </div>
                            <div class="step">
                                <div class="step-num">3</div>
                                <div class="step-text">Your Typesense server will be automatically provisioned</div>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `);

        } catch (error: any) {
            console.error("Signup handler error:", error);
            res.status(500).json({
                error: "Signup processing failed",
                message: error.message,
            });
        }
    }
);
