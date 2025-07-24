// Backend collections registry - mirrors the frontend collections
export interface BackendCollection {
    id: string;
    name: string;
    path: string;
    idField: string;
    properties: Record<string, any>;
}

export const backendCollections: BackendCollection[] = [
    {
        id: "customers",
        name: "Customers",
        path: "customers",
        idField: "id",
        properties: {
            id: {
                type: "number",
                required: true
            },
            name: {
                type: "string",
                required: true
            },
            contactPerson: { type: "string" },
            email: {
                type: "string",
                required: true
            },
            phoneNumber: { type: "string" },
            address: { type: "map" }
        }
    },
    {
        id: "machinery",
        name: "Machinery",
        path: "machinery",
        idField: "id",
        properties: {
            id: {
                type: "number",
                required: true
            },
            name: {
                type: "string",
                required: true
            },
            brand: { type: "string" },
            model: { type: "string" },
            serialNumber: {
                type: "string",
                required: true,
                unique: true
            },
            acquisitionDate: { type: "date" },
            status: {
                type: "string",
                required: true,
                enum: ["available", "rented", "maintenance", "retired"]
            },
            dailyRate: {
                type: "number",
                required: true,
                min: 0
            },
            specifications: { type: "map" },
            images: { type: "array" }
        }
    },
    {
        id: "rentals",
        name: "Rentals",
        path: "rentals",
        idField: "id",
        properties: {
            id: {
                type: "number",
                required: true
            },
            rentalId: {
                type: "string",
                required: true,
                unique: true
            },
            customerId: {
                type: "reference",
                path: "customers",
                required: true
            },
            machineryId: {
                type: "reference",
                path: "machinery",
                required: true
            },
            startDate: {
                type: "date",
                required: true
            },
            endDate: {
                type: "date",
                required: true
            },
            status: {
                type: "string",
                required: true,
                enum: ["active", "completed", "cancelled", "overdue"]
            },
            totalPrice: {
                type: "number",
                required: true,
                min: 0
            },
            paymentStatus: {
                type: "string",
                required: true,
                enum: ["pending", "paid", "partial", "overdue"]
            },
            contractDocumentUrl: { type: "string" }
        }
    },
    {
        id: "offers",
        name: "Offers",
        path: "offers",
        idField: "id",
        properties: {
            id: {
                type: "number",
                required: true
            },
            offerId: {
                type: "string",
                required: true,
                unique: true
            },
            customerId: {
                type: "reference",
                path: "customers",
                required: true
            },
            machineryId: {
                type: "reference",
                path: "machinery",
                required: true
            },
            offerDate: {
                type: "date",
                required: true
            },
            expirationDate: { type: "date" },
            price: {
                type: "number",
                required: true,
                min: 0
            },
            status: {
                type: "string",
                required: true,
                enum: ["draft", "sent", "accepted", "rejected", "expired"]
            },
            relatedRentalId: {
                type: "reference",
                path: "rentals"
            }
        }
    },
    {
        id: "maintenance_history",
        name: "Maintenance History",
        path: "maintenance_history",
        idField: "id",
        properties: {
            id: {
                type: "number",
                required: true
            },
            machineryId: {
                type: "reference",
                path: "machinery",
                required: true
            },
            date: {
                type: "date",
                required: true
            },
            description: {
                type: "string",
                required: true
            },
            cost: {
                type: "number",
                min: 0
            }
        }
    },
    {
        id: "payment_history",
        name: "Payment History",
        path: "payment_history",
        idField: "id",
        properties: {
            id: {
                type: "number",
                required: true
            },
            rentalId: {
                type: "reference",
                path: "rentals",
                required: true
            },
            date: {
                type: "date",
                required: true
            },
            amount: {
                type: "number",
                required: true,
                min: 0
            },
            paymentMethod: {
                type: "string",
                enum: ["cash", "check", "creditCard", "bankTransfer", "other"]
            }
        }
    },
    {
        id: "media",
        name: "Media",
        path: "media",
        idField: "id",
        properties: {
            id: {
                type: "number",
                required: true
            },
            alt: {
                type: "string",
                required: true
            },
            url: { type: "string" },
            thumbnailUrl: { type: "string" },
            filename: { type: "string" },
            mimeType: { type: "string" },
            filesize: { type: "number" },
            width: { type: "number" },
            height: { type: "number" }
        }
    }
];

export function getCollectionByPath(path: string): BackendCollection | undefined {
    return backendCollections.find(collection => collection.path === path);
}

export function validateEntityData(path: string, data: any): { valid: boolean; errors?: string[] } {
    const collection = getCollectionByPath(path);
    if (!collection) {
        return {
            valid: false,
            errors: [`Collection not found for path: ${path}`]
        };
    }

    const errors: string[] = [];

    // Check required fields
    for (const [fieldName, fieldConfig] of Object.entries(collection.properties)) {
        if (fieldConfig.required && (data[fieldName] === undefined || data[fieldName] === null)) {
            errors.push(`Required field '${fieldName}' is missing`);
        }

        // Basic type validation
        if (data[fieldName] !== undefined && data[fieldName] !== null) {
            const value = data[fieldName];
            const expectedType = fieldConfig.type;

            switch (expectedType) {
                case "string":
                    if (typeof value !== "string") {
                        errors.push(`Field '${fieldName}' must be a string`);
                    }
                    break;
                case "number":
                    if (typeof value !== "number") {
                        errors.push(`Field '${fieldName}' must be a number`);
                    } else if (fieldConfig.min !== undefined && value < fieldConfig.min) {
                        errors.push(`Field '${fieldName}' must be >= ${fieldConfig.min}`);
                    }
                    break;
                case "boolean":
                    if (typeof value !== "boolean") {
                        errors.push(`Field '${fieldName}' must be a boolean`);
                    }
                    break;
                case "date":
                    if (!(value instanceof Date) && typeof value !== "string") {
                        errors.push(`Field '${fieldName}' must be a date`);
                    }
                    break;
            }

            // Enum validation
            if (fieldConfig.enum && !fieldConfig.enum.includes(value)) {
                errors.push(`Field '${fieldName}' must be one of: ${fieldConfig.enum.join(", ")}`);
            }
        }
    }

    return {
        valid: errors.length === 0,
        errors: errors.length > 0 ? errors : undefined
    };
}
