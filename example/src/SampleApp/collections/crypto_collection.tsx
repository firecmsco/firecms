import { buildCollection } from "firecms";

export const cryptoCollection = buildCollection({
    name: "Crypto",
    path: "alpaca",
    icon: "AttachMoney",
    description: "Example of a read-only collection with near real-time updates",
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
        price: {
            name: "Price",
            dataType: "number"
        },
        symbol: {
            name: "Symbol",
            dataType: "string"
        },
        updated_on: {
            name: "Updated on",
            dataType: "date"
        }
    }
});
