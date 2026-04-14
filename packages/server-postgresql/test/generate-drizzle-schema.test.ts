import { EntityCollection } from "@rebasepro/types";
import { generateSchema } from "../src/schema/generate-drizzle-schema-logic";

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
                table: "products",
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
        expect(cleanResult).toContain("id: varchar(\"id\").primaryKey()");
        expect(cleanResult).toContain("name: varchar(\"name\").notNull(),");
        expect(cleanResult).toContain("price: numeric(\"price\"),");
        expect(cleanResult).toContain("available: boolean(\"available\")");
    });

    it("should generate a one-to-many relation correctly", async () => {
        const usersCollection: EntityCollection = {
            slug: "users",
            table: "users",
            name: "Users",
            properties: {
                name: { type: "string" }
            }
        };
        const postsCollection: EntityCollection = {
            slug: "posts",
            table: "posts",
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

        expect(cleanResult).toContain("author_id: varchar(\"author_id\").references(() => users.id, { onDelete: \"set null\" })");
        const expectedRelation = `export const postsRelations = drizzleRelations(posts, ({ one, many }) => ({ author: one(users, { fields: [posts.author_id], references: [users.id], relationName: \"author\" }) }));`;
        expect(cleanResult).toContain(cleanSchema(expectedRelation));
    });

    it("should generate a many-to-many relation with a junction table", async () => {
        const postsCollection: EntityCollection = {
            slug: "posts",
            table: "posts",
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
            table: "tags",
            name: "Tags",
            properties: {
                name: { type: "string" }
            }
        };

        const result = await generateSchema([postsCollection, tagsCollection]);
        const cleanResult = cleanSchema(result);

        expect(cleanResult).toContain("export const postsToTags = pgTable(\"posts_to_tags\",");
        expect(cleanResult).toContain("post_id: varchar(\"post_id\").notNull().references(() => posts.id, { onDelete: \"cascade\" })");
        expect(cleanResult).toContain("tag_id: varchar(\"tag_id\").notNull().references(() => tags.id, { onDelete: \"cascade\" })");
        expect(cleanResult).toContain("(table) => ({ pk: primaryKey({ columns: [table.post_id, table.tag_id] }) })");
        expect(cleanResult).toContain("export const postsRelations = drizzleRelations(posts, ({ one, many }) => ({ tags: many(postsToTags, { relationName: \"tags\" }) }));");
    });

    describe("generateDrizzleSchema Column Types", () => {
        
        describe("String Property", () => {
            it("should default to varchar if no columnType or isId is specified", async () => {
                const collections: EntityCollection[] = [{
                    slug: "texts", table: "texts", name: "Texts", properties: { t_default: { type: "string" } }
                }];
                const result = await generateSchema(collections);
                expect(cleanSchema(result)).toContain("t_default: varchar(\"t_default\")");
            });

            it("should respect explicit columnType overrides", async () => {
                const collections: EntityCollection[] = [{
                    slug: "texts",
                    table: "texts",
                    name: "Texts",
                    properties: {
                        t_text: { type: "string", columnType: "text" },
                        t_char: { type: "string", columnType: "char" },
                        t_varchar: { type: "string", columnType: "varchar" },
                    }
                }];
                const result = await generateSchema(collections);
                const cleanResult = cleanSchema(result);

                expect(cleanResult).toContain("t_text: text(\"t_text\"),");
                expect(cleanResult).toContain("t_char: char(\"t_char\"),");
                expect(cleanResult).toContain("t_varchar: varchar(\"t_varchar\")");
            });

            it("should prioritize isId='uuid' over default varchar", async () => {
                const collections: EntityCollection[] = [{
                    slug: "texts", table: "texts", name: "Texts", properties: { t_uuid: { type: "string", isId: "uuid" } }
                }];
                const result = await generateSchema(collections);
                expect(cleanSchema(result)).toContain("t_uuid: uuid(\"t_uuid\").primaryKey().defaultRandom()");
            });
            
            it("should combine isId=true with columnType overrides", async () => {
                const collections: EntityCollection[] = [{
                    slug: "texts", table: "texts", name: "Texts", properties: { t_id: { type: "string", isId: true, columnType: "text" } }
                }];
                const result = await generateSchema(collections);
                expect(cleanSchema(result)).toContain("t_id: text(\"t_id\").primaryKey()");
            });
            
            it("should respect validation.unique along with columnType", async () => {
                const collections: EntityCollection[] = [{
                    slug: "texts", table: "texts", name: "Texts", properties: { t_unique: { type: "string", columnType: "char", validation: { unique: true } } }
                }];
                const result = await generateSchema(collections);
                expect(cleanSchema(result)).toContain("t_unique: char(\"t_unique\").unique()");
            });
        });

        describe("Number Property", () => {
            it("should default to numeric for normal numbers", async () => {
                const collections: EntityCollection[] = [{
                    slug: "nums", table: "nums", name: "Nums", properties: { n_def: { type: "number" } }
                }];
                const result = await generateSchema(collections);
                expect(cleanSchema(result)).toContain("n_def: numeric(\"n_def\")");
            });

            it("should default to integer if validation.integer is true", async () => {
                const collections: EntityCollection[] = [{
                    slug: "nums", table: "nums", name: "Nums", properties: { n_int: { type: "number", validation: { integer: true } } }
                }];
                const result = await generateSchema(collections);
                expect(cleanSchema(result)).toContain("n_int: integer(\"n_int\")");
            });

            it("should default to integer if isId is true", async () => {
                const collections: EntityCollection[] = [{
                    slug: "nums", table: "nums", name: "Nums", properties: { n_id: { type: "number", isId: true } }
                }];
                const result = await generateSchema(collections);
                expect(cleanSchema(result)).toContain("n_id: integer(\"n_id\").primaryKey()");
            });

            it("should respect exact columnType overrides and replace baseType", async () => {
                const collections: EntityCollection[] = [{
                    slug: "numbers",
                    table: "numbers",
                    name: "Numbers",
                    properties: {
                        n_int: { type: "number", columnType: "integer" },
                        n_real: { type: "number", columnType: "real" },
                        n_dp: { type: "number", columnType: "double precision" },
                        n_num: { type: "number", columnType: "numeric" },
                        n_bigint: { type: "number", columnType: "bigint" },
                        n_serial: { type: "number", columnType: "serial" },
                        n_bigserial: { type: "number", columnType: "bigserial" },
                    }
                }];
                const result = await generateSchema(collections);
                const cleanResult = cleanSchema(result);

                expect(cleanResult).toContain("n_int: integer(\"n_int\"),");
                expect(cleanResult).toContain("n_real: real(\"n_real\"),");
                expect(cleanResult).toContain("n_dp: doublePrecision(\"n_dp\"),");
                expect(cleanResult).toContain("n_num: numeric(\"n_num\"),");
                expect(cleanResult).toContain("n_bigint: bigint(\"n_bigint\"),");
                expect(cleanResult).toContain("n_serial: serial(\"n_serial\"),");
                expect(cleanResult).toContain("n_bigserial: bigserial(\"n_bigserial\"),");
            });

            it("should combine isId='increment' with columnType overrides safely", async () => {
                const collections: EntityCollection[] = [{
                    slug: "nums", table: "nums", name: "Nums", properties: { n_inc: { type: "number", isId: "increment", columnType: "bigint" } }
                }];
                const result = await generateSchema(collections);
                expect(cleanSchema(result)).toContain("n_inc: bigint(\"n_inc\").generatedByDefaultAsIdentity().primaryKey()");
            });
            
            it("should combine validation.unique with columnType override", async () => {
                const collections: EntityCollection[] = [{
                    slug: "nums", table: "nums", name: "Nums", properties: { n_uniq: { type: "number", columnType: "real", validation: { unique: true } } }
                }];
                const result = await generateSchema(collections);
                expect(cleanSchema(result)).toContain("n_uniq: real(\"n_uniq\").unique()");
            });
        });

        describe("Date Property", () => {
            it("should default to timestamp with timezone", async () => {
                const collections: EntityCollection[] = [{
                    slug: "dates", table: "dates", name: "Dates", properties: { d_def: { type: "date" } }
                }];
                const result = await generateSchema(collections);
                expect(cleanSchema(result)).toContain("d_def: timestamp(\"d_def\", { withTimezone: true, mode: 'string' })");
            });

            it("should respect date and time columnType overrides", async () => {
                const collections: EntityCollection[] = [{
                    slug: "dates",
                    table: "dates",
                    name: "Dates",
                    properties: {
                        d_date: { type: "date", columnType: "date" },
                        d_time: { type: "date", columnType: "time" },
                        d_ts: { type: "date", columnType: "timestamp" },
                    }
                }];
                const result = await generateSchema(collections);
                const cleanResult = cleanSchema(result);

                expect(cleanResult).toContain("d_date: date(\"d_date\", { mode: 'string' }),");
                expect(cleanResult).toContain("d_time: time(\"d_time\"),");
                expect(cleanResult).toContain("d_ts: timestamp(\"d_ts\", { withTimezone: true, mode: 'string' }),");
            });
        });
        
        describe("Map & Array Properties", () => {
            it("should default to jsonb", async () => {
                const collections: EntityCollection[] = [{
                    slug: "json_data", table: "json_data", name: "JSON Data", properties: {
                        arr_def: { type: "array" },
                        map_def: { type: "map" }
                    }
                }];
                const result = await generateSchema(collections);
                expect(cleanSchema(result)).toContain("arr_def: jsonb(\"arr_def\"),");
                expect(cleanSchema(result)).toContain("map_def: jsonb(\"map_def\")");
            });

            it("should respect json columnType overrides", async () => {
                const collections: EntityCollection[] = [{
                    slug: "json_data",
                    table: "json_data",
                    name: "JSON Data",
                    properties: {
                        a_json: { type: "array", columnType: "json" },
                        a_jsonb: { type: "array", columnType: "jsonb" },
                        m_json: { type: "map", columnType: "json" },
                        m_jsonb: { type: "map", columnType: "jsonb" },
                    }
                }];
                const result = await generateSchema(collections);
                const cleanResult = cleanSchema(result);

                expect(cleanResult).toContain("a_json: json(\"a_json\"),");
                expect(cleanResult).toContain("a_jsonb: jsonb(\"a_jsonb\"),");
                expect(cleanResult).toContain("m_json: json(\"m_json\"),");
                expect(cleanResult).toContain("m_jsonb: jsonb(\"m_jsonb\")");
            });
        });
    });

    // ── RLS Policy Tests ────────────────────────────────────────────────

    describe("RLS policy generation", () => {
        it("should generate ownerField policy with USING and WITH CHECK for 'all'", async () => {
            const collections: EntityCollection[] = [{
                slug: "notes",
                table: "notes",
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
                table: "notes",
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
                table: "notes",
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
                table: "articles",
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
                table: "admin_data",
                name: "Admin Data",
                properties: { data: { type: "string" } },
                securityRules: [
                    { operation: "select", roles: ["admin"] }
                ]
            }];

            const result = await generateSchema(collections);
            expect(result).toContain("string_to_array(auth.roles(), ',') @> ARRAY['admin']");
        });

        it("should safely handle complex sub-string roles overlapping like 'view' and 'viewer'", async () => {
            const collections: EntityCollection[] = [{
                slug: "finance_data",
                table: "finance_data",
                name: "Finance Data",
                properties: { amount: { type: "number" } },
                securityRules: [
                    { operation: "select", roles: ["view"] } // Should not match 'viewer'
                ]
            }];

            const result = await generateSchema(collections);
            // Before array change: auth.roles() ~ 'view' would match 'viewer'
            // Now: array intersection prevents this
            expect(result).toContain("string_to_array(auth.roles(), ',') @> ARRAY['view']");
        });

        it("should securely handle multiple allowed roles", async () => {
            const collections: EntityCollection[] = [{
                slug: "multi_role",
                table: "multi_role",
                name: "Multi Role",
                properties: { data: { type: "string" } },
                securityRules: [
                    { operation: "select", roles: ["admin", "editor", "super-admin"] }
                ]
            }];

            const result = await generateSchema(collections);
            expect(result).toContain("string_to_array(auth.roles(), ',') @> ARRAY['admin','editor','super-admin']");
        });

        it("should combine roles with access: public", async () => {
            const collections: EntityCollection[] = [{
                slug: "reports",
                table: "reports",
                name: "Reports",
                properties: { title: { type: "string" } },
                securityRules: [
                    { operation: "select", roles: ["admin", "manager"], access: "public" }
                ]
            }];

            const result = await generateSchema(collections);
            // Should be (true) AND (role check)
            expect(result).toContain("(true) AND (string_to_array(auth.roles(), ',') @> ARRAY['admin','manager'])");
        });

        it("should combine roles with ownerField", async () => {
            const collections: EntityCollection[] = [{
                slug: "docs",
                table: "docs",
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
            expect(result).toContain("string_to_array(auth.roles(), ',') @> ARRAY['editor']");
            expect(result).toContain("AND");
        });

        it("should generate restrictive policy", async () => {
            const collections: EntityCollection[] = [{
                slug: "orders",
                table: "orders",
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
                table: "posts",
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
                table: "items",
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
                table: "data",
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
                table: "notes",
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
                table: "secure",
                name: "Secure",
                properties: { data: { type: "string" } },
                securityRules: [{ operation: "select", access: "public" }]
            }];
            const withoutRls: EntityCollection[] = [{
                slug: "open",
                table: "open",
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
            table: "admin_data",
            name: "Admin Data",
            properties: { data: { type: "string" } },
            securityRules: [
                { operation: "select", roles: ["admin"] }
            ]
        }];
        const result = await generateSchema(collections);
        expect(result).toContain("string_to_array(auth.roles(), ',') @> ARRAY['admin']");
    });
    it("should generate multiple policies from operations array", async () => {
        const collections: EntityCollection[] = [{
            slug: "notes",
            table: "notes",
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
            table: "items",
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
            table: "items",
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
            table: "notes",
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
            table: "items",
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
            table: "reports",
            name: "Reports",
            properties: { title: { type: "string" } },
            securityRules: [
                { operation: "select", roles: ["admin"], using: "true" }
            ]
        }];
        const result = await generateSchema(collections);
        // Should be (true) AND (role check) — same effect as access: "public" + roles
        expect(result).toContain("(true) AND (string_to_array(auth.roles(), ',') @> ARRAY['admin'])");
    });
    it("should use pgRoles instead of default 'public' when specified", async () => {
        const collections: EntityCollection[] = [{
            slug: "tenant_data",
            table: "tenant_data",
            name: "Tenant Data",
            properties: { data: { type: "string" } },
            securityRules: [
                { operation: "select", access: "public", pgRoles: ["app_role", "service_role"] }
            ]
        }];
        const result = await generateSchema(collections);
        expect(result).toContain('to: ["app_role", "service_role"]');
        expect(result).not.toContain('to: ["public"]');
    });
    it("should default to 'public' pgRole when pgRoles is not specified", async () => {
        const collections: EntityCollection[] = [{
            slug: "default_data",
            table: "default_data",
            name: "Default Data",
            properties: { data: { type: "string" } },
            securityRules: [
                { operation: "select", access: "public" }
            ]
        }];
        const result = await generateSchema(collections);
        expect(result).toContain('to: ["public"]');
    });
});

describe("generateDrizzleSchema ID Generation", () => {
    const cleanSchema = (schema: string) => {
        return schema
            .replace(/\/\/.*$/gm, "")
            .replace(/\/\*[\s\S]*?\*\//g, "")
            .replace(/\n{2,}/g, "\n")
            .replace(/\s+/g, " ")
            .trim();
    };

    it("should generate a UUID primary key when isId is 'uuid'", async () => {
        const collections: EntityCollection[] = [{
            slug: "items",
            table: "items",
            name: "Items",
            properties: {
                custom_id: { type: "string", isId: "uuid" }
            }
        }];
        const result = await generateSchema(collections);
        const cleanResult = cleanSchema(result);

        expect(cleanResult).toContain("custom_id: uuid(\"custom_id\").primaryKey().defaultRandom()");
    });

    it("should generate a serial primary key when isId is 'increment'", async () => {
        const collections: EntityCollection[] = [{
            slug: "tickets",
            table: "tickets",
            name: "Tickets",
            properties: {
                ticket_id: { type: "number", isId: "increment" }
            }
        }];
        const result = await generateSchema(collections);
        const cleanResult = cleanSchema(result);

        expect(cleanResult).toContain("ticket_id: integer(\"ticket_id\").generatedByDefaultAsIdentity().primaryKey()");
    });

    it("should generate a custom SQL primary key when isId is a sql string", async () => {
        const collections: EntityCollection[] = [{
            slug: "events",
            table: "events",
            name: "Events",
            properties: {
                event_id: { type: "string", isId: "sql`gen_random_uuid()`" }
            }
        }];
        const result = await generateSchema(collections);
        const cleanResult = cleanSchema(result);

        expect(cleanResult).toContain("event_id: varchar(\"event_id\").primaryKey().default(sql`gen_random_uuid()`)");
    });

    it("should generate a normal text primary key when isId is simply true", async () => {
        const collections: EntityCollection[] = [{
            slug: "users",
            table: "users",
            name: "Users",
            properties: {
                user_name: { type: "string", isId: true }
            }
        }];
        const result = await generateSchema(collections);
        const cleanResult = cleanSchema(result);

        expect(cleanResult).toContain("user_name: varchar(\"user_name\").primaryKey()");
    });
});
