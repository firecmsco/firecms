# FireCMS Typesense Search - Google Cloud Marketplace

Full-text search for Firestore powered by Typesense, distributed via Google Cloud Marketplace.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Google Cloud Marketplace                         │
│                                                                      │
│  Customer signs up → JWT → handleSignup → Account created           │
│                              ↓                                       │
│  Entitlement approved ← Pub/Sub ← Google Commerce                   │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Your GCP Project                                  │
│                                                                      │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────────┐  │
│  │  Firestore   │───▶│Cloud Function│───▶│  Compute Engine VM   │  │
│  │  (write)     │    │ (onWrite)    │    │  (Typesense)         │  │
│  └──────────────┘    └──────────────┘    └──────────────────────┘  │
│                                                       │             │
│                                                       ▼             │
│                                           ┌──────────────────────┐  │
│                                           │   Persistent Disk    │  │
│                                           │   (Typesense Data)   │  │
│                                           └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

## Project Structure

```
typesense_marketplace/
├── backend/
│   ├── src/
│   │   ├── index.ts              # Main entry point
│   │   ├── procurement/          # GCP Marketplace integration
│   │   │   ├── client.ts         # Partner Procurement API client
│   │   │   ├── entitlements.ts   # Entitlement management
│   │   │   └── accounts.ts       # Account management
│   │   ├── pubsub/
│   │   │   └── handlers.ts       # Marketplace event handlers
│   │   ├── functions/            # Typesense core functions
│   │   │   ├── provision.ts      # VM provisioning
│   │   │   ├── sync.ts           # Firestore sync trigger
│   │   │   ├── backfill.ts       # Bulk indexing
│   │   │   ├── config.ts         # Client configuration
│   │   │   └── proxy.ts          # HTTPS proxy
│   │   └── frontend/
│   │       └── signup.ts         # JWT signup handler
│   ├── package.json
│   └── tsconfig.json
├── marketplace/
│   └── solution.yaml             # Marketplace metadata
├── terraform/
│   └── main.tf                   # Infrastructure config
├── firebase.json
├── firestore.rules
└── firestore.indexes.json
```

## Prerequisites

1. **Google Cloud Partner Advantage** membership
2. **Marketplace Vendor Agreement** signed
3. **Producer Portal** access from Google

## Deployment

### 1. Set up infrastructure

```bash
cd terraform
terraform init
terraform apply -var="project_id=YOUR_PROJECT_ID"
```

### 2. Deploy Cloud Functions

```bash
cd backend
npm install
npm run build

cd ..
firebase deploy --only functions
```

### 3. Deploy Firestore rules and indexes

```bash
firebase deploy --only firestore
```

### 4. Configure Producer Portal

1. Go to [Producer Portal](https://console.cloud.google.com/producer-portal)
2. Create a new product listing
3. Set the signup URL to your `handleSignup` function URL
4. Configure Pub/Sub topic for events
5. Submit for review

## Environment Variables

Set these in your Cloud Functions environment:

```bash
GCP_MARKETPLACE_PROVIDER_ID=firecms
GCP_MARKETPLACE_PUBSUB_TOPIC=cloud-commerce-procurement
APP_URL=https://firecms.co
FUNCTIONS_LOCATION=us-central1
VM_ZONE=us-central1-a
COLLECTIONS_TO_INDEX=*
```

## Pricing Tiers

| Plan | Machine | RAM | Disk | Price |
|------|---------|-----|------|-------|
| Starter | e2-micro | 1GB | 10GB | $15/mo |
| Professional | e2-small | 2GB | 50GB | $29/mo |
| Enterprise | e2-medium | 4GB | 100GB | $59/mo |

## API Reference

### handleSignup
Receives JWT from Google Cloud Marketplace when customer signs up.

### handleMarketplaceEvent  
Pub/Sub handler for all marketplace events (entitlement created, cancelled, etc.)

### provisionSearchNode
HTTP endpoint to provision Typesense VM for a customer.

### onFirestoreWrite
Firestore trigger that syncs documents to Typesense in real-time.

### backfill
HTTP endpoint to index existing Firestore documents.

### getSearchConfig
Callable function returning Typesense connection info for client SDK.

### api
HTTP proxy to Typesense VM for CORS-safe search from browsers.

## License

Apache-2.0
