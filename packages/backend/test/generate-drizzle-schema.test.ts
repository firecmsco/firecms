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

});
