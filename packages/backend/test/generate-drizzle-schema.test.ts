import { EntityCollection } from "@firecms/types";
import { generateSchema } from "../src/generate-drizzle-schema-logic";

describe("generateDrizzleSchema", () => {

    // Helper to remove comments and excessive whitespace for easier comparison
    const cleanSchema = (schema: string) => {
        return schema
            .replace(/\/\/.*$/gm, '') // Remove single-line comments
            .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
            .replace(/\n{2,}/g, '\n') // Collapse multiple newlines
            .trim();
    };

    it("should generate a simple table with basic types", async () => {
        const collections: EntityCollection[] = [
            {
                slug: "products",
                name: "Products",
                dbPath: "products",
                properties: {
                    id: { type: "number" },
                    name: { type: "string", validation: { required: true } },
                    price: { type: "number" },
                    available: { type: "boolean" },
                }
            }
        ];

        const result = await generateSchema(collections);
        const cleanResult = cleanSchema(result);

        expect(cleanResult).toContain(`export const products = pgTable("products",`);
        expect(cleanResult).toContain(`id: serial("id").primaryKey()`);
        expect(cleanResult).toContain(`name: varchar("name").notNull()`);
        expect(cleanResult).toContain(`price: numeric("price")`);
        expect(cleanResult).toContain(`available: boolean("available")`);
    });

    it("should handle various property types correctly", async () => {
        const collections: EntityCollection[] = [
            {
                slug: "inventory",
                name: "Inventory",
                dbPath: "inventory",
                properties: {
                    id: { type: "number" },
                    last_updated: { type: "date" },
                    metadata: { type: "map" },
                    tags: { type: "array", of: { type: "string" } },
                    quantity: { type: "number", validation: { integer: true } },
                }
            }
        ];

        const result = await generateSchema(collections);
        const cleanResult = cleanSchema(result);

        expect(cleanResult).toContain(`last_updated: timestamp("last_updated", { withTimezone: true, mode: 'string' })`);
        expect(cleanResult).toContain(`metadata: jsonb("metadata")`);
        expect(cleanResult).toContain(`tags: jsonb("tags")`);
        expect(cleanResult).toContain(`quantity: integer("quantity")`);
    });

    it("should generate enums from a string array and use them in tables", async () => {
        const collections: EntityCollection[] = [
            {
                slug: "articles",
                name: "Articles",
                dbPath: "articles",
                properties: {
                    id: { type: "number" },
                    status: { type: "string", enum: ["draft", "published", "archived"] },
                }
            }
        ];

        const result = await generateSchema(collections);
        const cleanResult = cleanSchema(result);

        expect(cleanResult).toContain(`export const articlesStatus = pgEnum("articles_status", ['draft', 'published', 'archived']);`);
        expect(cleanResult).toContain(`status: articlesStatus("status")`);
    });

    it("should generate enums from an array of objects", async () => {
        const collections: EntityCollection[] = [
            {
                slug: "products",
                name: "Products",
                dbPath: "products",
                properties: {
                    id: { type: "number" },
                    category: {
                        type: "string",
                        enum: [
                            { id: "electronics", label: "Electronics" },
                            { id: "books", label: "Books" },
                        ]
                    },
                }
            }
        ];

        const result = await generateSchema(collections);
        const cleanResult = cleanSchema(result);

        expect(cleanResult).toContain(`export const productsCategory = pgEnum("products_category", ['electronics', 'books']);`);
        expect(cleanResult).toContain(`category: productsCategory("category")`);
    });

    it("should generate a one-to-many relation correctly", async () => {
        const usersCollection: EntityCollection = {
            slug: "users",
            name: "Users",
            dbPath: "users",
            properties: {
                id: { type: "number" },
                name: { type: "string" }
            }
        };
        const postsCollection: EntityCollection = {
            slug: "posts",
            name: "Posts",
            dbPath: "posts",
            properties: {
                id: { type: "number" },
                title: { type: "string" },
                author: {
                    type: "relation",
                    relationName: "author"
                }
            },
            relations: [
                {
                    relationName: "author",
                    target: () => usersCollection,
                    cardinality: "one",
                    joins: [{ sourceColumn: "author_id", targetColumn: "id" }]
                }
            ]
        };

        const result = await generateSchema([usersCollection, postsCollection]);
        const cleanResult = cleanSchema(result);

        expect(cleanResult).toContain(`author_id: integer("author_id").references(() => users.id, { onDelete: "set null" })`);
        const expectedRelation = `export const postsRelations = drizzleRelations(posts, ({ one }) => ({
	author: one(users, {
		fields: [posts.author_id],
		references: [users.id],
		relationName: "author"
	})
}));`;
        expect(cleanSchema(result)).toContain(cleanSchema(expectedRelation));
    });

    it("should handle required relations and cascade delete", async () => {
        const usersCollection: EntityCollection = {
            slug: "users", name: "Users", dbPath: "users",
            properties: { id: { type: "number" }, name: { type: "string" } }
        };
        const profilesCollection: EntityCollection = {
            slug: "profiles", name: "Profiles", dbPath: "profiles",
            properties: {
                id: { type: "number" },
                bio: { type: "string" },
                user: {
                    type: "relation",
                    validation: { required: true },
                    relationName: "user"
                }
            },
            relations: [
                {
                    relationName: "user",
                    target: () => usersCollection,
                    cardinality: "one",
                    onDelete: "cascade",
                    joins: [{ sourceColumn: "user_id", targetColumn: "id" }]
                }
            ]
        };

        const result = await generateSchema([usersCollection, profilesCollection]);
        const cleanResult = cleanSchema(result);

        expect(cleanResult).toContain(`user_id: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull()`);
    });

    it("should handle a self-referencing one-to-many relation", async () => {
        const categoriesCollection: EntityCollection = {
            slug: "categories",
            name: "Categories",
            dbPath: "categories",
            properties: {
                id: { type: "number" },
                name: { type: "string" },
                parent: {
                    type: "relation",
                    relationName: "parent"
                }
            },
            relations: [
                {
                    relationName: "parent",
                    target: () => categoriesCollection,
                    cardinality: "one",
                    joins: [{ sourceColumn: "parent_id", targetColumn: "id" }]
                }
            ]
        };

        const result = await generateSchema([categoriesCollection]);
        const cleanResult = cleanSchema(result);

        expect(cleanResult).toContain(`parent_id: integer("parent_id").references(() => categories.id, { onDelete: "set null" })`);
        expect(cleanResult).toContain(`parent: one(categories,`);
    });

    it("should generate a many-to-many relation with a junction table", async () => {
        const postsCollection: EntityCollection = {
            slug: "posts",
            name: "Posts",
            dbPath: "posts",
            properties: {
                id: { type: "number" },
                title: { type: "string" },
                tags: {
                    type: "relation",
                    relationName: "tags"
                }
            },
            relations: [
                {
                    relationName: "tags",
                    target: () => tagsCollection,
                    cardinality: "many",
                    joins: [
                        { table: "posts_tags", sourceColumn: "id", targetColumn: "post_id" },
                        { table: "tags", sourceColumn: "tag_id", targetColumn: "id" }
                    ]
                }
            ]
        };
        const tagsCollection: EntityCollection = {
            slug: "tags",
            name: "Tags",
            dbPath: "tags",
            properties: {
                id: { type: "number" },
                name: { type: "string" }
            }
        };

        const result = await generateSchema([postsCollection, tagsCollection]);
        const cleanResult = cleanSchema(result);

        expect(cleanResult).toContain(`export const postsTags = pgTable("posts_tags",`);
        expect(cleanResult).toContain(`post_id: integer("post_id").references(() => posts.id, { onDelete: "cascade" }).notNull()`);
        expect(cleanResult).toContain(`tag_id: integer("tag_id").references(() => tags.id, { onDelete: "cascade" }).notNull()`);
        expect(cleanResult).toContain(`pk: primaryKey({ columns: [table.post_id, table.tag_id] })`);
        expect(cleanResult).toContain(`export const postsRelations = drizzleRelations(posts, ({ many }) => ({
	tags: many(postsTags, { relationName: "tags" })
}));`);
        expect(cleanResult).toContain(`export const postsTagsRelations = drizzleRelations(postsTags, ({ one }) =>`);
    });

    it("should handle custom table and column names", async () => {
        const collections: EntityCollection[] = [
            {
                slug: "articles",
                name: "Articles",
                dbPath: "cms_articles",
                properties: {
                    id: { type: "number" },
                    headline: { type: "string", name: "article_headline" },
                }
            }
        ];

        const result = await generateSchema(collections);
        const cleanResult = cleanSchema(result);

        expect(cleanResult).toContain(`export const cmsArticles = pgTable("cms_articles",`);
        expect(cleanResult).toContain(`headline: varchar("headline")`);
    });

    it("should handle custom ID columns", async () => {
        const collections: EntityCollection[] = [
            {
                slug: "categories",
                name: "Categories",
                dbPath: "categories",
                idField: "category_uuid",
                customId: true,
                properties: {
                    category_uuid: { type: "string" },
                    name: { type: "string" },
                }
            }
        ];

        const result = await generateSchema(collections);
        const cleanResult = cleanSchema(result);

        expect(cleanResult).toContain(`category_uuid: varchar("category_uuid").primaryKey()`);
        expect(cleanResult).not.toContain(`serial("id")`);
    });

    it("should handle array of objects property", async () => {
        const collections: EntityCollection[] = [
            {
                slug: "orders",
                name: "Orders",
                dbPath: "orders",
                properties: {
                    id: { type: "number" },
                    items: {
                        type: "array",
                        of: {
                            type: "map",
                            properties: {
                                product_id: { type: "string" },
                                quantity: { type: "number" }
                            }
                        }
                    }
                }
            }
        ];

        const result = await generateSchema(collections);
        const cleanResult = cleanSchema(result);

        expect(cleanResult).toContain(`items: jsonb("items")`);
    });

    it("should convert camelCase property names to snake_case", async () => {
        const collections: EntityCollection[] = [
            {
                slug: "user_profiles",
                name: "User Profiles",
                dbPath: "user_profiles",
                properties: {
                    id: { type: "number" },
                    firstName: { type: "string" },
                    lastName: { type: "string" },
                }
            }
        ];

        const result = await generateSchema(collections);
        const cleanResult = cleanSchema(result);

        expect(cleanResult).toContain(`firstName: varchar("first_name")`);
        expect(cleanResult).toContain(`lastName: varchar("last_name")`);
    });

    it("should handle one-to-one relations", async () => {
        const usersCollection: EntityCollection = {
            slug: "users", name: "Users", dbPath: "users",
            properties: { id: { type: "number" }, name: { type: "string" } }
        };
        const profilesCollection: EntityCollection = {
            slug: "profiles", name: "Profiles", dbPath: "profiles",
            properties: {
                id: { type: "number" },
                bio: { type: "string" },
                user: {
                    type: "relation",
                    relationName: "user"
                }
            },
            relations: [
                {
                    relationName: "user",
                    target: () => usersCollection,
                    cardinality: "one",
                    joins: [{ sourceColumn: "user_id", targetColumn: "id" }]
                }
            ]
        };

        const result = await generateSchema([usersCollection, profilesCollection]);
        const cleanResult = cleanSchema(result);

        expect(cleanResult).toContain(`user_id: integer("user_id").references(() => users.id, { onDelete: "set null" })`);
        expect(cleanResult).toContain(`export const profilesRelations = drizzleRelations(profiles, ({ one }) =>`);
    });

    it("should handle onUpdate actions in relations", async () => {
        const usersCollection: EntityCollection = {
            slug: "users", name: "Users", dbPath: "users",
            properties: { id: { type: "number" }, name: { type: "string" } }
        };
        const postsCollection: EntityCollection = {
            slug: "posts", name: "Posts", dbPath: "posts",
            properties: {
                id: { type: "number" },
                title: { type: "string" },
                author: {
                    type: "relation",
                    relationName: "author"
                }
            },
            relations: [
                {
                    relationName: "author",
                    target: () => usersCollection,
                    cardinality: "one",
                    onUpdate: "cascade",
                    joins: [{ sourceColumn: "author_id", targetColumn: "id" }]
                }
            ]
        };

        const result = await generateSchema([usersCollection, postsCollection]);
        const cleanResult = cleanSchema(result);

        expect(cleanResult).toContain(`author_id: integer("author_id").references(() => users.id, { onUpdate: "cascade", onDelete: "set null" })`);
    });

    it("should handle relations to collections with custom string IDs", async () => {
        const authorsCollection: EntityCollection = {
            slug: "authors",
            name: "Authors",
            dbPath: "authors",
            idField: "author_uuid",
            customId: true,
            properties: {
                author_uuid: { type: "string" },
                name: { type: "string" }
            }
        };
        const booksCollection: EntityCollection = {
            slug: "books",
            name: "Books",
            dbPath: "books",
            properties: {
                id: { type: "number" },
                title: { type: "string" },
                author: {
                    type: "relation",
                    relationName: "author"
                }
            },
            relations: [
                {
                    relationName: "author",
                    target: () => authorsCollection,
                    cardinality: "one",
                    joins: [{ sourceColumn: "author_uuid", targetColumn: "author_uuid" }]
                }
            ]
        };

        const result = await generateSchema([authorsCollection, booksCollection]);
        const cleanResult = cleanSchema(result);

        expect(cleanResult).toContain(`author_uuid: varchar("author_uuid").references(() => authors.author_uuid, { onDelete: "set null" })`);
    });

    it("should handle a collection with no properties other than the ID", async () => {
        const emptyCollection: EntityCollection = {
            slug: "empty",
            name: "Empty",
            dbPath: "empty",
            properties: {
                id: { type: "number" }
            }
        };

        const result = await generateSchema([emptyCollection]);
        const cleanResult = cleanSchema(result);

        expect(cleanResult).toContain(`export const empty = pgTable("empty", {\n\tid: serial("id").primaryKey()\n});`);
    });

    it("should handle combined onUpdate and onDelete actions in relations", async () => {
        const usersCollection: EntityCollection = {
            slug: "users", name: "Users", dbPath: "users",
            properties: { id: { type: "number" }, name: { type: "string" } }
        };
        const postsCollection: EntityCollection = {
            slug: "posts", name: "Posts", dbPath: "posts",
            properties: {
                id: { type: "number" },
                title: { type: "string" },
                author: {
                    type: "relation",
                    relationName: "author"
                }
            },
            relations: [
                {
                    relationName: "author",
                    target: () => usersCollection,
                    cardinality: "one",
                    onUpdate: "cascade",
                    onDelete: "restrict",
                    joins: [{ sourceColumn: "author_id", targetColumn: "id" }]
                }
            ]
        };

        const result = await generateSchema([usersCollection, postsCollection]);
        const cleanResult = cleanSchema(result);

        expect(cleanResult).toContain(`author_id: integer("author_id").references(() => users.id, { onUpdate: "cascade", onDelete: "restrict" })`);
    });

    it("should handle multiple relations to the same table", async () => {
        const usersCollection: EntityCollection = {
            slug: "users", name: "Users", dbPath: "users",
            properties: { id: { type: "number" }, name: { type: "string" } }
        };
        const storiesCollection: EntityCollection = {
            slug: "stories", name: "Stories", dbPath: "stories",
            properties: {
                id: { type: "number" },
                title: { type: "string" },
                author: {
                    type: "relation",
                    relationName: "author"
                },
                editor: {
                    type: "relation",
                    relationName: "editor"
                }
            },
            relations: [
                {
                    relationName: "author",
                    target: () => usersCollection,
                    cardinality: "one",
                    joins: [{ sourceColumn: "author_id", targetColumn: "id" }]
                },
                {
                    relationName: "editor",
                    target: () => usersCollection,
                    cardinality: "one",
                    joins: [{ sourceColumn: "editor_id", targetColumn: "id" }]
                }
            ]
        };

        const result = await generateSchema([usersCollection, storiesCollection]);
        const cleanResult = cleanSchema(result);

        expect(cleanResult).toContain(`author_id: integer("author_id").references(() => users.id, { onDelete: "set null" })`);
        expect(cleanResult).toContain(`editor_id: integer("editor_id").references(() => users.id, { onDelete: "set null" })`);
        expect(cleanResult).toContain(`author: one(users,`);
        expect(cleanResult).toContain(`editor: one(users,`);
    });

    it("should handle many-to-many with a custom string ID on one side", async () => {
        const postsCollection: EntityCollection = {
            slug: "posts", name: "Posts", dbPath: "posts", idField: "post_uuid", customId: true,
            properties: {
                post_uuid: { type: "string" },
                title: { type: "string" },
                tags: {
                    type: "relation",
                    relationName: "tags"
                }
            },
            relations: [
                {
                    relationName: "tags",
                    target: () => tagsCollection,
                    cardinality: "many",
                    joins: [
                        { table: "posts_tags", sourceColumn: "post_uuid", targetColumn: "post_id" },
                        { table: "tags", sourceColumn: "tag_id", targetColumn: "id" }
                    ]
                }
            ]
        };
        const tagsCollection: EntityCollection = {
            slug: "tags", name: "Tags", dbPath: "tags",
            properties: { id: { type: "number" }, name: { type: "string" } }
        };

        const result = await generateSchema([postsCollection, tagsCollection]);
        const cleanResult = cleanSchema(result);

        expect(cleanResult).toContain(`post_id: varchar("post_id").references(() => posts.post_uuid, { onDelete: "cascade" }).notNull()`);
        expect(cleanResult).toContain(`tag_id: integer("tag_id").references(() => tags.id, { onDelete: "cascade" }).notNull()`);
    });
});
