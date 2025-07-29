import { EntityCollection } from "@firecms/core";

export const allCollections: EntityCollection[] = [
    {
        slug: "customers",
        name: "Customers",
        dbPath: "customers",
        idField: "id",
        properties: {
            id: {
                type: "number",
                validation: { required: true }
            },
            name: {
                type: "string",
                validation: { required: true }
            },
            contactPerson: { type: "string" },
            email: {
                type: "string",
                validation: { required: true }
            },
            phoneNumber: { type: "string" },
            address: { type: "map" }
        }
    },
    {
        slug: "machinery",
        name: "Machinery",
        dbPath: "machinery",
        idField: "id",
        properties: {
            id: {
                type: "number",
                validation: { required: true }
            },
            name: {
                type: "string",
                validation: { required: true }
            },
            brand: { type: "string" },
            model: { type: "string" },
            serialNumber: {
                type: "string",
                validation: {
                    required: true,
                },

            },
            acquisitionDate: { type: "date" },
            status: {
                type: "string",
                validation: { required: true },
                enumValues: {
                    "Available": "Available",
                    "Rented": "Rented",
                    "Under Maintenance": "Under Maintenance",
                    "Out of Service": "Out of Service"
                }
            },
            dailyRate: {
                type: "number",
                validation: {
                    required: true,
                    min: 0
                },

            },
            specifications: { type: "map" },
            images: {
                type: "array",
                of: {
                    type: "string",
                    storage: {
                        storagePath: "machinery-images",
                        acceptedFiles: ["image/*"]
                    }
                }
            }
        }
    },
    {
        slug: "rentals",
        name: "Rentals",
        dbPath: "rentals",
        idField: "id",
        properties: {
            id: {
                type: "number",
                validation: { required: true }
            },
            rentalId: {
                type: "string",
                validation: {
                    required: true,
                }
            },
            customerId: {
                type: "reference",
                slug: "customers",
                validation: { required: true }
            },
            machineryId: {
                type: "reference",
                slug: "machinery",
                validation: { required: true }
            },
            startDate: {
                type: "date",
                validation: { required: true }
            },
            endDate: {
                type: "date",
                validation: { required: true }
            },
            status: {
                type: "string",
                validation: { required: true },
                enumValues: {
                    "Active": "Active",
                    "Completed": "Completed",
                    "Overdue": "Overdue",
                    "Cancelled": "Cancelled"
                }
            },
            totalPrice: {
                type: "number",
                validation: {
                    required: true,
                    min: 0
                },

            },
            paymentStatus: {
                type: "string",
                validation: { required: true },
                enumValues: {
                    "Paid": "Paid",
                    "Unpaid": "Unpaid",
                    "Partially Paid": "Partially Paid"
                }
            },
            contractDocumentUrl: { type: "string" }
        }
    },
    {
        slug: "offers",
        name: "Offers",
        dbPath: "offers",
        idField: "id",
        properties: {
            id: {
                type: "number",
                validation: { required: true }
            },
            offerId: {
                type: "string",
                validation: {
                    required: true,
                }
            },
            customerId: {
                type: "reference",
                slug: "customers",
                validation: { required: true }
            },
            machineryId: {
                type: "reference",
                slug: "machinery",
                validation: { required: true }
            },
            offerDate: {
                type: "date",
                validation: { required: true }
            },
            expirationDate: { type: "date" },
            price: {
                type: "number",
                validation: {
                    required: true,
                    min: 0
                },

            },
            status: {
                type: "string",
                validation: { required: true },
                enumValues: {
                    "Pending": "Pending",
                    "Accepted": "Accepted",
                    "Rejected": "Rejected",
                    "Expired": "Expired"
                }
            },
            relatedRentalId: {
                type: "reference",
                slug: "rentals"
            }
        }
    },
    {
        slug: "maintenance_history",
        name: "Maintenance History",
        dbPath: "maintenance_history",
        idField: "id",
        properties: {
            id: {
                type: "number",
                validation: { required: true }
            },
            machineryId: {
                type: "reference",
                slug: "machinery",
                validation: { required: true }
            },
            date: {
                type: "date",
                validation: { required: true }
            },
            description: {
                type: "string",
                validation: { required: true }
            },
            cost: {
                type: "number",
                validation: {
                    min: 0
                }
            }
        }
    },
    {
        slug: "payment_history",
        name: "Payment History",
        dbPath: "payment_history",
        idField: "id",
        properties: {
            id: {
                type: "number",
                validation: { required: true }
            },
            rentalId: {
                type: "reference",
                slug: "rentals",
                validation: { required: true }
            },
            date: {
                type: "date",
                validation: { required: true }
            },
            amount: {
                type: "number",
                validation: {
                    required: true,
                    min: 0
                },
            },
            paymentMethod: {
                type: "string",
                enumValues: {
                    "cash": "cash",
                    "check": "check",
                    "creditCard": "creditCard",
                    "bankTransfer": "bankTransfer",
                    "other": "other"
                }
            }
        }
    },
    {
        slug: "media",
        name: "Media",
        dbPath: "media",
        idField: "id",
        properties: {
            id: {
                type: "number",
                validation: { required: true }
            },
            alt: {
                type: "string",
                validation: { required: true }
            },
            url: { type: "string" },
            thumbnailUrl: { type: "string" },
            filename: { type: "string" },
            mimetype: { type: "string" },
            filesize: { type: "number" },
            width: { type: "number" },
            height: { type: "number" }
        }
    }
];
