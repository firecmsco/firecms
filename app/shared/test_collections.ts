import { EntityCollection } from "@firecms/types";

// -----------------------------------------------------------------------------
// 1. Profiles Collection (for One-to-One)
// -----------------------------------------------------------------------------
const profilesCollection: EntityCollection = {
    name: "Profiles",
    singularName: "Profile",
    slug: "profiles",
    dbPath: "profiles",
    icon: "AccountCircle",
    textSearchEnabled: true,
    properties: {
        id: {
            type: "number",
            validation: { required: true }
        },
        bio: {
            name: "Biography",
            type: "string",
            multiline: true
        },
        website: {
            name: "Website",
            type: "string"
        },
        author: {
            name: "Author",
            type: "relation",
            relationName: "author"
        }
    },
    relations: [
        {
            relationName: "author",
            target: () => authorsCollection,
            cardinality: "one",
        }
    ]
};

// -----------------------------------------------------------------------------
// 2. Authors Collection (for One-to-One and One-to-Many)
// -----------------------------------------------------------------------------
const authorsCollection: EntityCollection = {
    name: "Authors",
    singularName: "Author",
    slug: "authors",
    dbPath: "authors",
    icon: "Person",
    properties: {
        id: {
            type: "number",
            validation: { required: true }
        },
        name: {
            name: "Name",
            type: "string",
            validation: { required: true }
        },
        email: {
            name: "Email",
            type: "string",
            email: true,
            validation: { required: true }
        },
        picture: {
            name: "Picture",
            type: "string",
            validation: { required: false },
            storage: {
                storagePath: "author_pictures/",
            }
        },
        profile: {
            name: "Profile",
            type: "relation",
            relationName: "profile"
        }
    },
    relations: [
        // Inverse side of the One-to-One relationship with Profiles.
        // The author entity doesn't store the profile_id.
        {
            relationName: "profile",
            target: () => profilesCollection,
            cardinality: "one",
            direction: "inverse",
            inverseRelationName: "author"
        },
        // Inverse side of the One-to-Many relationship with Posts.
        // The author entity doesn't store post_ids.
        {
            relationName: "posts",
            target: () => postsCollection,
            cardinality: "many",
            direction: "inverse",
            inverseRelationName: "author"
        }
    ]
};

// -----------------------------------------------------------------------------
// 3. Tags Collection (for Many-to-Many)
// -----------------------------------------------------------------------------
const tagsCollection: EntityCollection = {
    name: "Tags",
    singularName: "Tag",
    slug: "tags",
    dbPath: "tags",
    icon: "Tag",
    properties: {
        id: {
            type: "number",
            validation: { required: true }
        },
        name: {
            name: "Tag Name",
            type: "string",
            validation: { required: true }
        }
    },
    relations: [
        // Inverse side of the Many-to-Many relationship with Posts.
        // This side is read-only and uses the same junction table definition.
        {
            relationName: "posts",
            target: () => postsCollection,
            cardinality: "many",
            direction: "inverse",
            inverseRelationName: "tags",
        }
    ]
};

// -----------------------------------------------------------------------------
// 4. Posts Collection (for Many-to-One, Many-to-Many, and Multi-hop)
// -----------------------------------------------------------------------------
const postsCollection: EntityCollection = {
    name: "Posts",
    singularName: "Post",
    slug: "posts",
    dbPath: "posts",
    icon: "Article",
    properties: {
        id: {
            type: "number",
            validation: { required: true }
        },
        title: {
            name: "Title",
            type: "string",
            validation: { required: true }
        },
        content: {
            name: "Content",
            type: "string",
            multiline: true
        },
        status: {
            name: "Status",
            type: "string",
            enum: [
                { id: "draft", label: "Draft", color: "grayLight" },
                { id: "review", label: "In Review", color: "orangeLight" },
                { id: "published", label: "Published", color: "greenLight" },
                { id: "archived", label: "Archived", color: "redLight" }
            ]
        },
        // A property to demonstrate a relation field in the UI
        author: {
            name: "Author",
            type: "relation",
            relationName: "author" // This now refers to the relation defined below
        },
        profile: {
            name: "Profile",
            type: "relation",
            relationName: "author_profile"
        },
        tags: {
            name: "Tags",
            type: "relation",
            relationName: "tags"
        }

    },
    relations: [
        // Owning side of the Many-to-One relationship with Authors.
        {
            relationName: "author",
            target: () => authorsCollection,
            cardinality: "one",
            direction: "owning",
        },
        // Owning side of the Many-to-Many relationship with Tags.
        // This side manages the junction table.
        {
            relationName: "tags",
            target: () => tagsCollection,
            cardinality: "many",
            direction: "owning",
        },
        // Advanced: A multi-hop, read-only relation from Post -> Author -> Profile.
        // This demonstrates the use of the `joinPath` property for complex lookups.
        {
            relationName: "author_profile",
            target: () => profilesCollection,
            cardinality: "one",
            direction: "inverse", // Read-only from the post's perspective
            joinPath: [
                {
                    // First, join posts to authors
                    table: "authors",
                    on: {
                        from: "posts.author_id",
                        to: "authors.id"
                    }
                },
                {
                    // Then, join authors to profiles
                    table: "profiles",
                    on: {
                        from: "authors.id",
                        to: "profiles.author_id"
                    }
                }
            ]
        }
    ]
};

// -----------------------------------------------------------------------------
// 5. Private Notes Collection (RLS Demo)
// -----------------------------------------------------------------------------
const privateNotesCollection: EntityCollection = {
    name: "Private Notes",
    singularName: "Private Note",
    slug: "private_notes",
    dbPath: "private_notes",
    icon: "Lock",
    description: "Demonstrates Supabase-style RLS policies. Users can only access their own notes. Admins can read all. Locked notes cannot be updated.",
    securityRules: [
        // Admins have unfiltered access to all rows (roles + raw SQL)
        { name: "admin_bypass", operation: "all", roles: ["admin"], using: "true" },
        // Regular users: full access to own rows only (operations array reduces boilerplate)
        { name: "owner_access", operation: "all", ownerField: "user_id" },
        // Restrictive gate: prevent updates on locked notes.
        // Both `using` (old row state) and `withCheck` (new row state) are constrained
        // to prevent both editing locked notes AND locking unlocked notes.
        {
            name: "no_update_locked",
            operation: "update",
            mode: "restrictive",
            using: "{is_locked} = false",
            withCheck: "{is_locked} = false"
        }
    ],
    properties: {
        title: {
            name: "Title",
            type: "string",
            validation: { required: true }
        },
        content: {
            name: "Content",
            type: "string",
            multiline: true
        },
        user_id: {
            name: "User ID",
            type: "string",
            disabled: true,
            validation: { required: true },
            description: "The ID of the user who owns this note"
        },
        is_locked: {
            name: "Locked",
            type: "boolean",
            description: "When true, RLS restrictive policy prevents updates"
        }
    }
};

export const test_collections = [
    authorsCollection,
    profilesCollection,
    postsCollection,
    tagsCollection,
    privateNotesCollection
];
