import { EntityCollection } from "@firecms/core";

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

// New collections showcasing relationship properties

export const authorsCollection: EntityCollection = {
    name: "Authors",
    singularName: "Author",
    slug: "authors",
    dbPath: "authors",
    icon: "Person",
    group: "Content Management",
    textSearchEnabled: true,
    description: "Blog authors and writers",
    idField: "id",
    properties: {
        id: {
            type: "number",
            validation: { required: true }
        },
        name: {
            name: "Full Name",
            validation: { required: true },
            type: "string"
        },
        email: {
            name: "Email",
            email: true,
            validation: { required: true },
            type: "string"
        },
        bio: {
            name: "Biography",
            type: "string",
            multiline: true
        },
        profileImage: {
            name: "Profile Image",
            type: "string",
            storage: {
                storagePath: "authors/profiles",
                acceptedFiles: ["image/*"]
            }
        },
        joinDate: {
            name: "Join Date",
            type: "date",
            autoValue: "on_create"
        },
        // One-to-many relationship: Author has many posts
        posts: {
            name: "Posts",
            type: "relationship",
            target: "posts",
            hasMany: true,
            targetForeignKey: "authorId",
            widget: "subcollection",
            previewProperties: ["title", "status", "publishedAt"]
        }
    }
};

export const categoriesCollection: EntityCollection = {
    name: "Categories",
    singularName: "Category",
    slug: "categories",
    dbPath: "categories",
    icon: "Category",
    group: "Content Management",
    textSearchEnabled: true,
    description: "Blog post categories",
    idField: "id",
    properties: {
        id: {
            type: "number",
            validation: { required: true }
        },
        name: {
            name: "Category Name",
            validation: { required: true },
            type: "string"
        },
        slug: {
            name: "URL Slug",
            validation: { required: true },
            type: "string"
        },
        description: {
            name: "Description",
            type: "string",
            multiline: true
        },
        color: {
            name: "Color",
            type: "string"
        },
        // Self-referential relationship: Category can have a parent category
        parentCategory: {
            name: "Parent Category",
            type: "relationship",
            target: "categories",
            hasMany: false,
            sourceForeignKey: "parentCategoryId",
            widget: "select",
            previewProperties: ["name"]
        },
        // One-to-many relationship: Category has many subcategories
        subcategories: {
            name: "Subcategories",
            type: "relationship",
            target: "categories",
            hasMany: true,
            targetForeignKey: "parentCategoryId",
            widget: "subcollection",
            previewProperties: ["name", "slug"]
        },
        // One-to-many relationship: Category has many posts
        posts: {
            name: "Posts",
            type: "relationship",
            target: "posts",
            hasMany: true,
            targetForeignKey: "categoryId",
            widget: "subcollection",
            previewProperties: ["title", "status", "publishedAt"]
        }
    }
};

export const tagsCollection: EntityCollection = {
    name: "Tags",
    singularName: "Tag",
    slug: "tags",
    dbPath: "tags",
    icon: "LocalOffer",
    group: "Content Management",
    textSearchEnabled: true,
    description: "Blog post tags",
    idField: "id",
    properties: {
        id: {
            type: "number",
            validation: { required: true }
        },
        name: {
            name: "Tag Name",
            validation: { required: true },
            type: "string"
        },
        slug: {
            name: "URL Slug",
            validation: { required: true },
            type: "string"
        },
        description: {
            name: "Description",
            type: "string"
        },
        color: {
            name: "Color",
            type: "string"
        },
        // Many-to-many relationship: Tag belongs to many posts
        posts: {
            name: "Posts",
            type: "relationship",
            target: "posts",
            hasMany: true,
            through: {
                junctionTable: "posts_tags",
                sourceForeignKey: "tagId",
                targetForeignKey: "postId"
            },
            widget: "subcollection",
            previewProperties: ["title", "status", "publishedAt"]
        }
    }
};

export const postsCollection: EntityCollection = {
    name: "Posts",
    singularName: "Post",
    slug: "posts",
    dbPath: "posts",
    icon: "Article",
    group: "Content Management",
    textSearchEnabled: true,
    description: "Blog posts and articles",
    idField: "id",
    properties: {
        id: {
            type: "number",
            validation: { required: true }
        },
        title: {
            name: "Title",
            validation: { required: true },
            type: "string"
        },
        slug: {
            name: "URL Slug",
            validation: { required: true },
            type: "string"
        },
        content: {
            name: "Content",
            type: "string",
            multiline: true
        },
        excerpt: {
            name: "Excerpt",
            type: "string",
            multiline: true
        },
        featuredImage: {
            name: "Featured Image",
            type: "string",
            storage: {
                storagePath: "posts/featured",
                acceptedFiles: ["image/*"]
            }
        },
        status: {
            name: "Status",
            validation: { required: true },
            type: "string",
            enumValues: {
                "draft": "Draft",
                "published": "Published",
                "archived": "Archived"
            }
        },
        publishedAt: {
            name: "Published At",
            type: "date"
        },
        // Many-to-one relationship: Post belongs to one author
        author: {
            name: "Author",
            type: "relationship",
            target: "authors",
            hasMany: false,
            sourceForeignKey: "authorId",
            widget: "select",
            previewProperties: ["name", "email"]
        },
        // Many-to-one relationship: Post belongs to one category
        category: {
            name: "Category",
            type: "relationship",
            target: "categories",
            hasMany: false,
            sourceForeignKey: "categoryId",
            widget: "select",
            previewProperties: ["name", "slug"]
        },
        // Many-to-many relationship: Post has many tags
        tags: {
            name: "Tags",
            type: "relationship",
            target: "tags",
            hasMany: true,
            through: {
                junctionTable: "posts_tags",
                sourceForeignKey: "postId",
                targetForeignKey: "tagId"
            },
            widget: "select",
            previewProperties: ["name", "slug"]
        },
        // One-to-many relationship: Post has many comments
        comments: {
            name: "Comments",
            type: "relationship",
            target: "comments",
            hasMany: true,
            targetForeignKey: "postId",
            widget: "subcollection",
            previewProperties: ["authorName", "content", "createdAt"]
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
        }
    }
};

export const commentsCollection: EntityCollection = {
    name: "Comments",
    singularName: "Comment",
    slug: "comments",
    dbPath: "comments",
    icon: "Comment",
    group: "Content Management",
    textSearchEnabled: true,
    description: "Blog post comments",
    idField: "id",
    properties: {
        id: {
            type: "number",
            validation: { required: true }
        },
        content: {
            name: "Comment Content",
            validation: { required: true },
            type: "string",
            multiline: true
        },
        authorName: {
            name: "Author Name",
            validation: { required: true },
            type: "string"
        },
        authorEmail: {
            name: "Author Email",
            email: true,
            validation: { required: true },
            type: "string"
        },
        status: {
            name: "Status",
            validation: { required: true },
            type: "string",
            enumValues: {
                "pending": "Pending",
                "approved": "Approved",
                "spam": "Spam",
                "rejected": "Rejected"
            }
        },
        // Many-to-one relationship: Comment belongs to one post
        post: {
            name: "Post",
            type: "relationship",
            target: "posts",
            hasMany: false,
            sourceForeignKey: "postId",
            widget: "select",
            previewProperties: ["title", "status"]
        },
        // Self-referential relationship: Comment can have a parent comment (for replies)
        parentComment: {
            name: "Parent Comment",
            type: "relationship",
            target: "comments",
            hasMany: false,
            sourceForeignKey: "parentCommentId",
            widget: "select",
            previewProperties: ["authorName", "content"]
        },
        // One-to-many relationship: Comment can have many replies
        replies: {
            name: "Replies",
            type: "relationship",
            target: "comments",
            hasMany: true,
            targetForeignKey: "parentCommentId",
            widget: "subcollection",
            previewProperties: ["authorName", "content", "createdAt"]
        },
        createdAt: {
            name: "Created At",
            type: "date",
            autoValue: "on_create"
        }
    }
};

export const userProfilesCollection: EntityCollection = {
    name: "User Profiles",
    singularName: "User Profile",
    slug: "user_profiles",
    dbPath: "user_profiles",
    icon: "AccountCircle",
    group: "User Management",
    textSearchEnabled: true,
    description: "Extended user profile information",
    idField: "id",
    properties: {
        id: {
            type: "number",
            validation: { required: true }
        },
        userId: {
            name: "User ID",
            validation: { required: true },
            type: "string"
        },
        firstName: {
            name: "First Name",
            validation: { required: true },
            type: "string"
        },
        lastName: {
            name: "Last Name",
            validation: { required: true },
            type: "string"
        },
        avatar: {
            name: "Avatar",
            type: "string",
            storage: {
                storagePath: "users/avatars",
                acceptedFiles: ["image/*"]
            }
        },
        bio: {
            name: "Biography",
            type: "string",
            multiline: true
        },
        dateOfBirth: {
            name: "Date of Birth",
            type: "date"
        },
        // One-to-one relationship: User Profile has one address
        address: {
            name: "Address",
            type: "relationship",
            target: "user_addresses",
            hasMany: false,
            sourceForeignKey: "addressId",
            widget: "select",
            previewProperties: ["street", "city", "country"]
        },
        // One-to-many relationship: User Profile has many social media accounts
        socialAccounts: {
            name: "Social Media Accounts",
            type: "relationship",
            target: "social_accounts",
            hasMany: true,
            targetForeignKey: "userProfileId",
            widget: "subcollection",
            previewProperties: ["platform", "username"]
        }
    }
};

export const userAddressesCollection: EntityCollection = {
    name: "User Addresses",
    singularName: "User Address",
    slug: "user_addresses",
    dbPath: "user_addresses",
    icon: "LocationOn",
    group: "User Management",
    textSearchEnabled: true,
    description: "User address information",
    idField: "id",
    properties: {
        id: {
            type: "number",
            validation: { required: true }
        },
        street: {
            name: "Street Address",
            validation: { required: true },
            type: "string"
        },
        city: {
            name: "City",
            validation: { required: true },
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
            validation: { required: true },
            type: "string"
        },
        // One-to-one relationship: Address belongs to one user profile
        userProfile: {
            name: "User Profile",
            type: "relationship",
            target: "user_profiles",
            hasMany: false,
            targetForeignKey: "addressId",
            widget: "select",
            previewProperties: ["firstName", "lastName"]
        }
    }
};

export const socialAccountsCollection: EntityCollection = {
    name: "Social Accounts",
    singularName: "Social Account",
    slug: "social_accounts",
    dbPath: "social_accounts",
    icon: "Share",
    group: "User Management",
    textSearchEnabled: true,
    description: "User social media accounts",
    idField: "id",
    properties: {
        id: {
            type: "number",
            validation: { required: true }
        },
        platform: {
            name: "Platform",
            validation: { required: true },
            type: "string",
            enumValues: {
                "twitter": "Twitter/X",
                "facebook": "Facebook",
                "instagram": "Instagram",
                "linkedin": "LinkedIn",
                "github": "GitHub",
                "youtube": "YouTube"
            }
        },
        username: {
            name: "Username",
            validation: { required: true },
            type: "string"
        },
        url: {
            name: "Profile URL",
            type: "string"
        },
        isVerified: {
            name: "Is Verified",
            type: "boolean"
        },
        // Many-to-one relationship: Social Account belongs to one user profile
        userProfile: {
            name: "User Profile",
            type: "relationship",
            target: "user_profiles",
            hasMany: false,
            sourceForeignKey: "userProfileId",
            widget: "select",
            previewProperties: ["firstName", "lastName"]
        }
    }
};

// Export all collections for easy import
export const collections = [
    customersCollection,
    machineryCollection,
    rentalsCollection,
    offersCollection,
    maintenanceHistoryCollection,
    paymentHistoryCollection,
    mediaCollection,
    // New collections with relationship properties
    authorsCollection,
    categoriesCollection,
    tagsCollection,
    postsCollection,
    commentsCollection,
    userProfilesCollection,
    userAddressesCollection,
    socialAccountsCollection
];
