import { buildCollection } from "@firecms/core";

export const cryptoCollection = buildCollection({
    name: "Crypto",
    id: "crypto",
    path: "crypto",
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
            dataType: "string",
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
            dataType: "string"
        },
        usd: {
            name: "Price (USD)",
            dataType: "number"
        },
        updated_on: {
            name: "Updated on",
            dataType: "date"
        }
    }
});
