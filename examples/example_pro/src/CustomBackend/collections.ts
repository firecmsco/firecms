// Collections for machinery rental company based on existing database structure
import { buildCollection } from "@firecms/core";

export const customersCollection = buildCollection({
    name: "Customers",
    singularName: "Customer",
    id: "customers",
    path: "customers",
    icon: "Person",
    group: "Customer Management",
    textSearchEnabled: true,
    description: "Customer database for machinery rental",
    properties: {
        name: {
            name: "Company Name",
            validation: { required: true },
            dataType: "string"
        },
        contactPerson: {
            name: "Contact Person",
            dataType: "string"
        },
        email: {
            name: "Email",
            email: true,
            validation: { required: true },
            dataType: "string"
        },
        phoneNumber: {
            name: "Phone Number",
            dataType: "string"
        },
        address: {
            name: "Address",
            dataType: "map",
            properties: {
                street: {
                    name: "Street",
                    dataType: "string"
                },
                city: {
                    name: "City",
                    dataType: "string"
                },
                state: {
                    name: "State/Province",
                    dataType: "string"
                },
                zipCode: {
                    name: "ZIP/Postal Code",
                    dataType: "string"
                },
                country: {
                    name: "Country",
                    dataType: "string"
                }
            }
        }
    }
});

export const machineryCollection = buildCollection({
    name: "Machinery",
    singularName: "Machine",
    id: "machinery",
    path: "machinery",
    icon: "Construction",
    group: "Inventory",
    textSearchEnabled: true,
    description: "Machinery inventory for rental",
    properties: {
        name: {
            name: "Machine Name",
            validation: { required: true },
            dataType: "string"
        },
        brand: {
            name: "Brand",
            dataType: "string"
        },
        model: {
            name: "Model",
            dataType: "string"
        },
        serialNumber: {
            name: "Serial Number",
            validation: { required: true, },
            dataType: "string"
        },
        acquisitionDate: {
            name: "Acquisition Date",
            dataType: "date"
        },
        status: {
            name: "Status",
            validation: { required: true },
            dataType: "string",
            enumValues: {
                "Available": "Available",
                "Rented": "Rented",
                "Under Maintenance": "Under Maintenance",
                "Retired": "Retired"
            }
        },
        dailyRate: {
            name: "Daily Rental Rate",
            validation: {
                required: true,
                min: 0
            },
            dataType: "number"
        },
        specifications: {
            name: "Specifications",
            dataType: "map",
            properties: {
                weight: {
                    name: "Weight (kg)",
                    dataType: "number"
                },
                dimensions: {
                    name: "Dimensions",
                    dataType: "string"
                },
                power: {
                    name: "Power",
                    dataType: "string"
                },
                fuelType: {
                    name: "Fuel Type",
                    dataType: "string"
                },
                capacity: {
                    name: "Capacity",
                    dataType: "string"
                },
                yearManufactured: {
                    name: "Year Manufactured",
                    dataType: "number"
                }
            }
        },
        images: {
            name: "Images",
            dataType: "array",
            of: {
                dataType: "string",
                storage: {
                    storagePath: "machinery-images",
                    acceptedFiles: ["image/*"]
                }
            }
        },
        createdAt: {
            name: "Created At",
            dataType: "date",
            autoValue: "on_create"
        },
        updatedAt: {
            name: "Updated At",
            dataType: "date",
            autoValue: "on_update"
        },
    }
});

export const rentalsCollection = buildCollection({
    name: "Rentals",
    singularName: "Rental",
    id: "rentals",
    path: "rentals",
    icon: "Assignment",
    group: "Operations",
    textSearchEnabled: true,
    description: "Active and historical machinery rentals",
    properties: {
        rentalId: {
            name: "Rental ID",
            validation: { required: true, },
            dataType: "string"
        },

        customerId: {
            name: "Customer",
            dataType: "reference",
            path: "customers",
            validation: { required: true }
        },
        machineryId: {
            name: "Machinery",
            dataType: "reference",
            path: "machinery",
            validation: { required: true }
        },
        startDate: {
            name: "Start Date",
            validation: { required: true },
            dataType: "date"
        },
        endDate: {
            name: "End Date",
            validation: { required: true },
            dataType: "date"
        },
        status: {
            name: "Rental Status",
            validation: { required: true },
            dataType: "string",
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
            dataType: "number"
        },
        paymentStatus: {
            name: "Payment Status",
            validation: { required: true },
            dataType: "string",
            enumValues: {
                "Pending": "Pending",
                "Paid": "Paid",
                "Partially Paid": "Partially Paid",
                "Overdue": "Overdue"
            }
        },
        contractDocumentUrl: {
            name: "Contract Document",
            dataType: "string",
            storage: {
                storagePath: "contracts",
                acceptedFiles: ["application/pdf", ".doc", ".docx"]
            }
        }
    }
});

export const offersCollection = buildCollection({
    name: "Offers",
    singularName: "Offer",
    id: "offers",
    path: "offers",
    icon: "LocalOffer",
    group: "Sales",
    textSearchEnabled: true,
    description: "Customer offers and quotes",
    properties: {
        offerId: {
            name: "Offer ID",
            validation: { required: true, },
            dataType: "string"
        },
        customerId: {
            name: "Customer",
            dataType: "reference",
            path: "customers",
            validation: { required: true }
        },
        machineryId: {
            name: "Machinery",
            dataType: "reference",
            path: "machinery",
            validation: { required: true }
        },
        offerDate: {
            name: "Offer Date",
            validation: { required: true },
            dataType: "date"
        },
        expirationDate: {
            name: "Expiration Date",
            dataType: "date"
        },
        price: {
            name: "Offer Price",
            validation: {
                required: true,
                min: 0
            },
            dataType: "number"
        },
        status: {
            name: "Status",
            validation: { required: true },
            dataType: "string",
            enumValues: {
                "Pending": "Pending",
                "Accepted": "Accepted",
                "Rejected": "Rejected",
                "Expired": "Expired"
            }
        },
        createdAt: {
            name: "Created At",
            dataType: "date",
            autoValue: "on_create"
        },
        relatedRentalId: {
            name: "Related Rental",
            dataType: "reference",
            path: "rentals"
        }
    }
});

export const maintenanceHistoryCollection = buildCollection({
    name: "Maintenance History",
    singularName: "Maintenance Record",
    id: "maintenance_history",
    path: "maintenance_history",
    icon: "Build",
    group: "Maintenance",
    textSearchEnabled: true,
    description: "Machinery maintenance records",
    properties: {
        machineryId: {
            name: "Machinery",
            dataType: "reference",
            path: "machinery",
            validation: { required: true }
        },
        date: {
            name: "Maintenance Date",
            validation: { required: true },
            dataType: "date"
        },
        description: {
            name: "Description",
            validation: { required: true },
            dataType: "string",
            multiline: true
        },
        cost: {
            name: "Cost",
            dataType: "number",
            validation: { min: 0 }
        }
    }
});

export const paymentHistoryCollection = buildCollection({
    name: "Payment History",
    singularName: "Payment",
    id: "payment_history",
    path: "payment_history",
    icon: "Payment",
    group: "Finance",
    textSearchEnabled: true,
    description: "Payment records for rentals",
    properties: {
        rentalId: {
            name: "Rental",
            dataType: "reference",
            path: "rentals",
            validation: { required: true }
        },
        date: {
            name: "Payment Date",
            validation: { required: true },
            dataType: "date"
        },
        amount: {
            name: "Amount",
            validation: {
                required: true,
                min: 0
            },
            dataType: "number"
        },
        paymentMethod: {
            name: "Payment Method",
            dataType: "string",
            enumValues: {
                cash: "Cash",
                check: "Check",
                creditCard: "Credit Card",
                bankTransfer: "Bank Transfer",
                other: "Other"
            }
        }
    }
});

export const mediaCollection = buildCollection({
    name: "Media",
    singularName: "Media File",
    id: "media",
    path: "media",
    icon: "Image",
    group: "Assets",
    textSearchEnabled: true,
    description: "Media files and images",
    properties: {
        alt: {
            name: "Alt Text",
            validation: { required: true },
            dataType: "string"
        },
        url: {
            name: "File URL",
            dataType: "string",
            storage: {
                storagePath: "media"
            }
        },
        thumbnailUrl: {
            name: "Thumbnail URL",
            dataType: "string"
        },
        filename: {
            name: "Filename",
            dataType: "string"
        },
        mimeType: {
            name: "MIME Type",
            dataType: "string"
        },
        filesize: {
            name: "File Size (bytes)",
            dataType: "number"
        },
        width: {
            name: "Width",
            dataType: "number"
        },
        height: {
            name: "Height",
            dataType: "number"
        }
    }
});

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
