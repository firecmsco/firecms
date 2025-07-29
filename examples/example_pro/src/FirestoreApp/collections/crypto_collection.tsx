import { buildCollection } from "@firecms/core";

export const cryptoCollection = buildCollection({
    name: "Crypto",
    slug: "crypto",
    dbPath: "crypto",
    icon: "AttachMoney",
    description: "This collection is updated in real time every minute. The UI will update automatically.",
    permissions: {
        create: false,
        delete: false,
        read: true,
        edit: false
    },
    properties: {
        image: {
            name: "Image",
            type: "string",
            storage: {
                storagePath: "alpaca",
                acceptedFiles: ["image/*"],
                maxSize: 1024 * 1024,
                metadata: {
                    cacheControl: "max-age=1000000"
                }
            }
        },
        name: {
            name: "Name",
            type: "string"
        },
        usd: {
            name: "Price (USD)",
            type: "number"
        },
        updated_on: {
            name: "Updated on",
            type: "date"
        }
    }
});
