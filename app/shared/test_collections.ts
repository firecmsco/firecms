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
            direction: "owning",
            localKey: "author_id"
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
    icon: "Edit",
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
            foreignKeyOnTarget: "author_id" // FK is on the 'profiles' table
        },
        // Inverse side of the One-to-Many relationship with Posts.
        // The author entity doesn't store post_ids.
        {
            relationName: "posts",
            target: () => postsCollection,
            cardinality: "many",
            direction: "inverse",
            foreignKeyOnTarget: "author_id" // FK is on the 'posts' table
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
            through: {
                table: "posts_tags",
                sourceColumn: "tag_id", // FK to this collection's PK in junction table
                targetColumn: "post_id" // FK to the target collection's PK in junction table
            }
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
            localKey: "author_id" // FK column in the 'posts' table
        },
        // Owning side of the Many-to-Many relationship with Tags.
        // This side manages the junction table.
        {
            relationName: "tags",
            target: () => tagsCollection,
            cardinality: "many",
            direction: "owning",
            through: {
                table: "posts_tags",
                sourceColumn: "post_id", // FK to this collection's PK in junction table
                targetColumn: "tag_id"  // FK to the target collection's PK in junction table
            }
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

export const test_collections = [
    authorsCollection,
    profilesCollection,
    postsCollection,
    tagsCollection
];
