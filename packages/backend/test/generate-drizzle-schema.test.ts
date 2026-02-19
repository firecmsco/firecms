import { EntityCollection } from "@firecms/types";
import { generateSchema } from "../src/generate-drizzle-schema-logic";

describe("generateDrizzleSchema", () => {

    // Helper to remove comments and excessive whitespace for easier comparison
    const cleanSchema = (schema: string) => {
        return schema
            .replace(/\/\/.*$/gm, "") // Remove single-line comments
            .replace(/\/\*[\s\S]*?\*\//g, "") // Remove multi-line comments
            .replace(/\n{2,}/g, "\n") // Collapse multiple newlines
            .replace(/\s+/g, " ") // Collapse whitespace
            .trim();
    };

    it("should generate a simple table with basic types", async () => {
        const collections: EntityCollection[] = [
            {
                slug: "products",
                name: "Products",
                properties: {
                    name: { type: "string", validation: { required: true } },
                    price: { type: "number" },
                    available: { type: "boolean" },
                }
            }
        ];

        const result = await generateSchema(collections);
        const cleanResult = cleanSchema(result);

        expect(cleanResult).toContain("export const products = pgTable(\"products\", {");
        expect(cleanResult).toContain("id: serial(\"id\").primaryKey(),");
        expect(cleanResult).toContain("name: varchar(\"name\").notNull(),");
        expect(cleanResult).toContain("price: numeric(\"price\"),");
        expect(cleanResult).toContain("available: boolean(\"available\")");
    });

    it("should generate a one-to-many relation correctly", async () => {
        const usersCollection: EntityCollection = {
            slug: "users",
            name: "Users",
            properties: {
                name: { type: "string" }
            }
        };
        const postsCollection: EntityCollection = {
            slug: "posts",
            name: "Posts",
            properties: {
                title: { type: "string" },
                author: { type: "relation", relationName: "author" }
            },
            relations: [
                {
                    relationName: "author",
                    target: () => usersCollection,
                    cardinality: "one",
                    localKey: "author_id",
                    onDelete: "set null"
                }
            ]
        };

        const result = await generateSchema([usersCollection, postsCollection]);
        const cleanResult = cleanSchema(result);

        expect(cleanResult).toContain("author_id: integer(\"author_id\").references(() => users.id, { onDelete: \"set null\" })");
        const expectedRelation = `export const postsRelations = drizzleRelations(posts, ({ one, many }) => ({ author: one(users, { fields: [posts.author_id], references: [users.id], relationName: \"author\" }) }));`;
        expect(cleanResult).toContain(cleanSchema(expectedRelation));
    });

    it("should generate a many-to-many relation with a junction table", async () => {
        const postsCollection: EntityCollection = {
            slug: "posts",
            name: "Posts",
            properties: {
                title: { type: "string" },
                tags: { type: "relation", relationName: "tags" }
            },
            relations: [
                {
                    relationName: "tags",
                    target: () => tagsCollection,
                    cardinality: "many",
                    direction: "owning",
                    through: {
                        table: "posts_to_tags",
                        sourceColumn: "post_id",
                        targetColumn: "tag_id"
                    }
                }
            ]
        };
        const tagsCollection: EntityCollection = {
            slug: "tags",
            name: "Tags",
            properties: {
                name: { type: "string" }
            }
        };

        const result = await generateSchema([postsCollection, tagsCollection]);
        const cleanResult = cleanSchema(result);

        expect(cleanResult).toContain("export const postsToTags = pgTable(\"posts_to_tags\",");
        expect(cleanResult).toContain("post_id: integer(\"post_id\").notNull().references(() => posts.id, { onDelete: \"cascade\" })");
        expect(cleanResult).toContain("tag_id: integer(\"tag_id\").notNull().references(() => tags.id, { onDelete: \"cascade\" })");
        expect(cleanResult).toContain("(table) => ({ pk: primaryKey({ columns: [table.post_id, table.tag_id] }) })");
        expect(cleanResult).toContain("export const postsRelations = drizzleRelations(posts, ({ one, many }) => ({ tags: many(postsToTags, { relationName: \"tags\" }) }));");
    });

    // ── RLS Policy Tests ────────────────────────────────────────────────

    describe("RLS policy generation", () => {
        it("should generate ownerField policy with USING and WITH CHECK for 'all'", async () => {
            const collections: EntityCollection[] = [{
                slug: "notes",
                name: "Notes",
                properties: {
                    title: { type: "string" },
                    user_id: { type: "string", validation: { required: true } }
                },
                securityRules: [
                    { operation: "all", ownerField: "user_id" }
                ]
            }];

            const result = await generateSchema(collections);
            expect(result).toContain("pgPolicy");
            expect(result).toContain('as: "permissive"');
            expect(result).toContain('for: "all"');
            expect(result).toContain("${table.user_id} = auth.uid()");
            // 'all' needs both using and withCheck
            expect(result).toContain("using:");
            expect(result).toContain("withCheck:");
        });

        it("should generate SELECT policy with only USING clause", async () => {
            const collections: EntityCollection[] = [{
                slug: "notes",
                name: "Notes",
                properties: {
                    title: { type: "string" },
                    user_id: { type: "string" }
                },
                securityRules: [
                    { operation: "select", ownerField: "user_id" }
                ]
            }];

            const result = await generateSchema(collections);
            expect(result).toContain('for: "select"');
            expect(result).toContain("using:");
            expect(result).not.toContain("withCheck:");
        });

        it("should generate INSERT policy with only WITH CHECK clause", async () => {
            const collections: EntityCollection[] = [{
                slug: "notes",
                name: "Notes",
                properties: {
                    title: { type: "string" },
                    user_id: { type: "string" }
                },
                securityRules: [
                    { operation: "insert", ownerField: "user_id" }
                ]
            }];

            const result = await generateSchema(collections);
            expect(result).toContain('for: "insert"');
            expect(result).toContain("withCheck:");
            expect(result).not.toContain("using:");
        });

        it("should generate public access policy", async () => {
            const collections: EntityCollection[] = [{
                slug: "articles",
                name: "Articles",
                properties: { title: { type: "string" } },
                securityRules: [
                    { operation: "select", access: "public" }
                ]
            }];

            const result = await generateSchema(collections);
            expect(result).toContain("sql`true`");
            expect(result).toContain('for: "select"');
        });

        it("should generate roles-only policy", async () => {
            const collections: EntityCollection[] = [{
                slug: "admin_data",
                name: "Admin Data",
                properties: { data: { type: "string" } },
                securityRules: [
                    { operation: "select", roles: ["admin"] }
                ]
            }];

            const result = await generateSchema(collections);
            expect(result).toContain("auth.roles() ~ 'admin'");
        });

        it("should combine roles with access: public", async () => {
            const collections: EntityCollection[] = [{
                slug: "reports",
                name: "Reports",
                properties: { title: { type: "string" } },
                securityRules: [
                    { operation: "select", roles: ["admin", "manager"], access: "public" }
                ]
            }];

            const result = await generateSchema(collections);
            // Should be (true) AND (role check)
            expect(result).toContain("(true) AND (auth.roles() ~ 'admin|manager')");
        });

        it("should combine roles with ownerField", async () => {
            const collections: EntityCollection[] = [{
                slug: "docs",
                name: "Docs",
                properties: {
                    title: { type: "string" },
                    user_id: { type: "string" }
                },
                securityRules: [
                    { operation: "select", roles: ["editor"], ownerField: "user_id" }
                ]
            }];

            const result = await generateSchema(collections);
            // Should combine owner check AND role check
            expect(result).toContain("auth.uid()");
            expect(result).toContain("auth.roles() ~ 'editor'");
            expect(result).toContain("AND");
        });

        it("should generate restrictive policy", async () => {
            const collections: EntityCollection[] = [{
                slug: "orders",
                name: "Orders",
                properties: {
                    amount: { type: "number" },
                    is_locked: { type: "boolean" }
                },
                securityRules: [
                    { operation: "update", mode: "restrictive", using: "{is_locked} = false" }
                ]
            }];

            const result = await generateSchema(collections);
            expect(result).toContain('as: "restrictive"');
            expect(result).toContain("${table.is_locked} = false");
        });

        it("should generate raw SQL using clause with column references", async () => {
            const collections: EntityCollection[] = [{
                slug: "posts",
                name: "Posts",
                properties: {
                    title: { type: "string" },
                    published_at: { type: "date" }
                },
                securityRules: [
                    { operation: "select", using: "{published_at} > now() - interval '30 days'" }
                ]
            }];

            const result = await generateSchema(collections);
            expect(result).toContain("${table.published_at} > now() - interval '30 days'");
        });

        it("should generate raw SQL withCheck clause", async () => {
            const collections: EntityCollection[] = [{
                slug: "items",
                name: "Items",
                properties: {
                    name: { type: "string" },
                    user_id: { type: "string" },
                    status: { type: "string" }
                },
                securityRules: [
                    {
                        operation: "update",
                        using: "{user_id} = auth.uid()",
                        withCheck: "{status} != 'archived' OR auth.roles() ~ 'admin'"
                    }
                ]
            }];

            const result = await generateSchema(collections);
            expect(result).toContain("using:");
            expect(result).toContain("withCheck:");
            expect(result).toContain("${table.user_id} = auth.uid()");
            expect(result).toContain("${table.status} != 'archived'");
        });

        it("should use custom policy names when provided", async () => {
            const collections: EntityCollection[] = [{
                slug: "data",
                name: "Data",
                properties: { value: { type: "string" } },
                securityRules: [
                    { name: "my_custom_policy", operation: "select", access: "public" }
                ]
            }];

            const result = await generateSchema(collections);
            expect(result).toContain('pgPolicy("my_custom_policy"');
        });

        it("should generate multiple policies for the same table", async () => {
            const collections: EntityCollection[] = [{
                slug: "notes",
                name: "Notes",
                properties: {
                    title: { type: "string" },
                    user_id: { type: "string" },
                    is_locked: { type: "boolean" }
                },
                securityRules: [
                    { name: "admin_read", operation: "select", roles: ["admin"], access: "public" },
                    { name: "owner_read", operation: "select", ownerField: "user_id" },
                    { name: "owner_write", operation: "insert", ownerField: "user_id" },
                    { name: "no_locked_update", operation: "update", mode: "restrictive", using: "{is_locked} = false" }
                ]
            }];

            const result = await generateSchema(collections);
            expect(result).toContain('pgPolicy("admin_read"');
            expect(result).toContain('pgPolicy("owner_read"');
            expect(result).toContain('pgPolicy("owner_write"');
            expect(result).toContain('pgPolicy("no_locked_update"');
            expect(result).toContain('as: "restrictive"');
        });

        it("should import pgPolicy and sql only when RLS is used", async () => {
            const withRls: EntityCollection[] = [{
                slug: "secure",
                name: "Secure",
                properties: { data: { type: "string" } },
                securityRules: [{ operation: "select", access: "public" }]
            }];
            const withoutRls: EntityCollection[] = [{
                slug: "open",
                name: "Open",
                properties: { data: { type: "string" } }
            }];

            const resultWith = await generateSchema(withRls);
            const resultWithout = await generateSchema(withoutRls);

            expect(resultWith).toContain("pgPolicy");
            expect(resultWith).toContain("sql");
            expect(resultWithout).not.toContain("pgPolicy");
        });
    });

});
// V2 improvements tests
describe("generateDrizzleSchema V2 improvements", () => {
    it("should generate role-based security rule", async () => {
        const collections: EntityCollection[] = [{
            slug: "admin_data",
            name: "Admin Data",
            properties: { data: { type: "string" } },
            securityRules: [
                { operation: "select", roles: ["admin"] }
            ]
        }];
        const result = await generateSchema(collections);
        expect(result).toContain("auth.roles() ~ 'admin'");
    });
    it("should generate multiple policies from operations array", async () => {
        const collections: EntityCollection[] = [{
            slug: "notes",
            name: "Notes",
            properties: {
                title: { type: "string" },
                user_id: { type: "string" }
            },
            securityRules: [
                { name: "owner_rw", operations: ["select", "update"], ownerField: "user_id" }
            ]
        }];
        const result = await generateSchema(collections);
        // Should generate two separate policies
        expect(result).toContain('pgPolicy("owner_rw_select"');
        expect(result).toContain('pgPolicy("owner_rw_update"');
        expect(result).toContain('for: "select"');
        expect(result).toContain('for: "update"');
    });
    it("should auto-generate names with operation suffix for operations array", async () => {
        const collections: EntityCollection[] = [{
            slug: "items",
            name: "Items",
            properties: { data: { type: "string" } },
            securityRules: [
                { operations: ["select", "delete"], access: "public" }
            ]
        }];
        const result = await generateSchema(collections);
        expect(result).toContain('for: "select"');
        expect(result).toContain('for: "delete"');
    });
    it("should not append operation suffix when operations array has single element", async () => {
        const collections: EntityCollection[] = [{
            slug: "items",
            name: "Items",
            properties: { data: { type: "string" } },
            securityRules: [
                { name: "my_policy", operations: ["select"], access: "public" }
            ]
        }];
        const result = await generateSchema(collections);
        expect(result).toContain('pgPolicy("my_policy"');
        // Should NOT have _select suffix since only one operation
        expect(result).not.toContain('pgPolicy("my_policy_select"');
    });
    it("should generate correct clauses per operation in operations array", async () => {
        const collections: EntityCollection[] = [{
            slug: "notes",
            name: "Notes",
            properties: {
                title: { type: "string" },
                user_id: { type: "string" }
            },
            securityRules: [
                { name: "owner", operations: ["select", "insert"], ownerField: "user_id" }
            ]
        }];
        const result = await generateSchema(collections);
        // SELECT should have USING only
        const selectPolicy = result.split("\n").find(l => l.includes("owner_select"));
        expect(selectPolicy).toContain("using:");
        expect(selectPolicy).not.toContain("withCheck:");
        // INSERT should have WITH CHECK only
        const insertPolicy = result.split("\n").find(l => l.includes("owner_insert"));
        expect(insertPolicy).toContain("withCheck:");
        expect(insertPolicy).not.toContain("using:");
    });
    it("operations array takes precedence over singular operation", async () => {
        const collections: EntityCollection[] = [{
            slug: "items",
            name: "Items",
            properties: { data: { type: "string" } },
            securityRules: [
                { name: "test", operation: "delete", operations: ["select", "insert"], access: "public" }
            ]
        }];
        const result = await generateSchema(collections);
        // operations[] should win — no "delete" policy
        expect(result).toContain('for: "select"');
        expect(result).toContain('for: "insert"');
        expect(result).not.toContain('for: "delete"');
    });
    it("should handle roles combined with using true for unfiltered access", async () => {
        const collections: EntityCollection[] = [{
            slug: "reports",
            name: "Reports",
            properties: { title: { type: "string" } },
            securityRules: [
                { operation: "select", roles: ["admin"], using: "true" }
            ]
        }];
        const result = await generateSchema(collections);
        // Should be (true) AND (role check) — same effect as access: "public" + roles
        expect(result).toContain("(true) AND (auth.roles() ~ 'admin')");
    });
});
