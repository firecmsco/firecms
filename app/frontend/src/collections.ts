import { EntityCollection } from "@firecms/types";

export const customersCollection: EntityCollection = {
    name: "Customers",
    singularName: "Customer",
    slug: "customers",
    dbPath: "customers",
    icon: "Person",
    group: "Customer Management",
    textSearchEnabled: true,
    description: "Customer database for machinery rental",
    idField: "id",
    properties: {
        id: {
            type: "number",
            validation: { required: true }
        },
        name: {
            name: "Company Name",
            validation: { required: true },
            type: "string"
        },
        contactPerson: {
            name: "Contact Person",
            type: "string"
        },
        email: {
            name: "Email",
            email: true,
            validation: { required: true },
            type: "string"
        },
        phoneNumber: {
            name: "Phone Number",
            type: "string"
        },
        address: {
            name: "Address",
            type: "map",
            properties: {
                street: {
                    name: "Street",
                    type: "string"
                },
                city: {
                    name: "City",
                    type: "string"
                },
                state: {
                    name: "State/Province",
                    type: "string"
                },
                zipCode: {
                    name: "ZIP/Postal Code",
                    type: "string"
                },
                country: {
                    name: "Country",
                    type: "string"
                }
            }
        }
    }
};

export const machineryCollection: EntityCollection = {
    name: "Machinery",
    singularName: "Machine",
    slug: "machinery",
    dbPath: "machinery",
    icon: "Construction",
    group: "Inventory",
    textSearchEnabled: true,
    description: "Machinery inventory for rental",
    idField: "id",
    properties: {
        id: {
            type: "number",
            validation: { required: true }
        },
        name: {
            name: "Machine Name",
            validation: { required: true },
            type: "string"
        },
        brand: {
            name: "Brand",
            type: "string"
        },
        model: {
            name: "Model",
            type: "string"
        },
        serialNumber: {
            name: "Serial Number",
            validation: { required: true, },
            type: "string"
        },
        acquisitionDate: {
            name: "Acquisition Date",
            type: "date"
        },
        status: {
            name: "Status",
            validation: { required: true },
            type: "string",
            enumValues: {
                "available": "Available",
                "rented": "Rented",
                "under_maintenance": "Under Maintenance",
                "retired": "Retired"
            }
        },
        dailyRate: {
            name: "Daily Rental Rate",
            validation: {
                required: true,
                min: 0
            },
            type: "number"
        },
        specifications: {
            name: "Specifications",
            type: "map",
            properties: {
                weight: {
                    name: "Weight (kg)",
                    type: "number"
                },
                dimensions: {
                    name: "Dimensions",
                    type: "string"
                },
                power: {
                    name: "Power",
                    type: "string"
                },
                fuelType: {
                    name: "Fuel Type",
                    type: "string"
                },
                capacity: {
                    name: "Capacity",
                    type: "string"
                },
                yearManufactured: {
                    name: "Year Manufactured",
                    type: "number"
                }
            }
        },
        images: {
            name: "Images",
            type: "array",
            of: {
                type: "string",
                storage: {
                    storagePath: "machinery-images",
                    acceptedFiles: ["image/*"]
                }
            }
        },
        createdAt: {
            name: "Created At",
            type: "date",
            autoValue: "on_create"
        },
        updatedAt: {
            name: "Updated At",
            type: "date",
            autoValue: "on_update"
        },
    }
};

export const rentalsCollection: EntityCollection = {
    name: "Rentals",
    singularName: "Rental",
    slug: "rentals",
    dbPath: "rentals",
    icon: "Assignment",
    group: "Operations",
    textSearchEnabled: true,
    description: "Active and historical machinery rentals",
    idField: "id",
    properties: {
        id: {
            type: "number",
            validation: { required: true }
        },
        rentalId: {
            name: "Rental ID",
            validation: { required: true, },
            type: "string"
        },

        customerId: {
            name: "Customer",
            type: "reference",
            path: "customers",
            validation: { required: true }
        },
        machineryId: {
            name: "Machinery",
            type: "reference",
            path: "machinery",
            validation: { required: true }
        },
        startDate: {
            name: "Start Date",
            validation: { required: true },
            type: "date"
        },
        endDate: {
            name: "End Date",
            validation: { required: true },
            type: "date"
        },
        status: {
            name: "Rental Status",
            validation: { required: true },
            type: "string",
            enumValues: {
                active: "Active",
                completed: "Completed",
                cancelled: "Cancelled",
                overdue: "Overdue"
            }
        },
        totalPrice: {
            name: "Total Price",
            validation: {
                required: true,
                min: 0
            },
            type: "number"
        },
        paymentStatus: {
            name: "Payment Status",
            validation: { required: true },
            type: "string",
            enumValues: {
                "pending": "Pending",
                "paid": "Paid",
                "partially_paid": "Partially Paid",
                "overdue": "Overdue"
            }
        },
        contractDocumentUrl: {
            name: "Contract Document",
            type: "string",
            storage: {
                storagePath: "contracts",
                acceptedFiles: ["application/pdf", ".doc", ".docx"]
            }
        }
    }
};

export const offersCollection: EntityCollection = {
    name: "Offers",
    singularName: "Offer",
    slug: "offers",
    dbPath: "offers",
    icon: "LocalOffer",
    group: "Sales",
    textSearchEnabled: true,
    description: "Customer offers and quotes",
    idField: "id",
    properties: {
        id: {
            type: "number",
            validation: { required: true }
        },
        offerId: {
            name: "Offer ID",
            validation: { required: true, },
            type: "string"
        },
        customerId: {
            name: "Customer",
            type: "reference",
            path: "customers",
            validation: { required: true }
        },
        machineryId: {
            name: "Machinery",
            type: "reference",
            path: "machinery",
            validation: { required: true }
        },
        offerDate: {
            name: "Offer Date",
            validation: { required: true },
            type: "date"
        },
        expirationDate: {
            name: "Expiration Date",
            type: "date"
        },
        price: {
            name: "Offer Price",
            validation: {
                required: true,
                min: 0
            },
            type: "number"
        },
        status: {
            name: "Status",
            validation: { required: true },
            type: "string",
            enumValues: {
                "draft": "Draft",
                "sent": "Sent",
                "accepted": "Accepted",
                "rejected": "Rejected",
                "expired": "Expired",
                "cancelled": "Cancelled"
            }
        },
        createdAt: {
            name: "Created At",
            type: "date",
            autoValue: "on_create"
        },
        relatedRentalId: {
            name: "Related Rental",
            type: "reference",
            path: "rentals"
        }
    }
};

export const maintenanceHistoryCollection: EntityCollection = {
    name: "Maintenance History",
    singularName: "Maintenance Record",
    slug: "maintenance_history",
    dbPath: "maintenance_history",
    icon: "Build",
    group: "Maintenance",
    textSearchEnabled: true,
    description: "Machinery maintenance records",
    idField: "id",
    properties: {
        id: {
            type: "number",
            validation: { required: true }
        },
        machineryId: {
            name: "Machinery",
            type: "reference",
            path: "machinery",
            validation: { required: true }
        },
        date: {
            name: "Maintenance Date",
            validation: { required: true },
            type: "date"
        },
        description: {
            name: "Description",
            validation: { required: true },
            type: "string",
            multiline: true
        },
        cost: {
            name: "Cost",
            type: "number",
            validation: { min: 0 }
        }
    }
};

export const paymentHistoryCollection: EntityCollection = {
    name: "Payment History",
    singularName: "Payment",
    slug: "payment_history",
    dbPath: "payment_history",
    icon: "Payment",
    group: "Finance",
    textSearchEnabled: true,
    description: "Payment records for rentals",
    idField: "id",
    properties: {
        id: {
            type: "number",
            validation: { required: true }
        },
        rentalId: {
            name: "Rental",
            type: "reference",
            path: "rentals",
            validation: { required: true }
        },
        date: {
            name: "Payment Date",
            validation: { required: true },
            type: "date"
        },
        amount: {
            name: "Amount",
            validation: {
                required: true,
                min: 0
            },
            type: "number"
        },
        paymentMethod: {
            name: "Payment Method",
            type: "string",
            enumValues: {
                cash: "Cash",
                check: "Check",
                creditCard: "Credit Card",
                bankTransfer: "Bank Transfer",
                other: "Other"
            }
        }
    }
};

export const mediaCollection: EntityCollection = {
    name: "Media",
    singularName: "Media File",
    slug: "media",
    dbPath: "media",
    icon: "Image",
    group: "Assets",
    textSearchEnabled: true,
    description: "Media files and images",
    idField: "id",
    properties: {
        id: {
            type: "number",
            validation: { required: true }
        },
        alt: {
            name: "Alt Text",
            validation: { required: true },
            type: "string"
        },
        url: {
            name: "File URL",
            type: "string",
            storage: {
                storagePath: "media"
            }
        },
        thumbnailUrl: {
            name: "Thumbnail URL",
            type: "string"
        },
        filename: {
            name: "Filename",
            type: "string"
        },
        mimeType: {
            name: "MIME Type",
            type: "string"
        },
        filesize: {
            name: "File Size (bytes)",
            type: "number"
        },
        width: {
            name: "Width",
            type: "number"
        },
        height: {
            name: "Height",
            type: "number"
        }
    }
};

// Export all collections for easy import
export const allCollections = [
    customersCollection,
    machineryCollection,
    rentalsCollection,
    offersCollection,
    maintenanceHistoryCollection,
    paymentHistoryCollection,
    mediaCollection
];
