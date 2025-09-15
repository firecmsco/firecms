import { EntityCollection } from "@firecms/types";
import { generateSchema } from "../src/generate-drizzle-schema-logic";

/**
 * Comprehensive test suite for complex relation scenarios
 * This tests all the production use cases developers might implement
 */
describe("Comprehensive Relations Test Suite", () => {

    const cleanSchema = (schema: string) => {
        return schema
            .replace(/\/\/.*$/gm, '')
            .replace(/\/\*[\s\S]*?\*\//g, '')
            .replace(/\n{2,}/g, '\n')
            .trim();
    };

    describe("Many-to-Many Relations", () => {
        it("should handle N-join many-to-many with 3 tables", async () => {
            const authorsCollection: EntityCollection = {
                slug: "authors",
                name: "Authors",
                dbPath: "authors",
                properties: {
                    id: { type: "number" },
                    name: { type: "string" },
                    books: { type: "relation", relationName: "books" }
                },
                relations: [
                    {
                        relationName: "books",
                        target: () => booksCollection,
                        cardinality: "many",
                        joins: [
                            { table: "authors", sourceColumn: "id", targetColumn: "author_id" },
                            { table: "author_books", sourceColumn: "author_id", targetColumn: "author_id" },
                            { table: "author_books", sourceColumn: "book_id", targetColumn: "book_id" },
                            { table: "books", sourceColumn: "book_id", targetColumn: "id" }
                        ]
                    }
                ]
            };

            const booksCollection: EntityCollection = {
                slug: "books",
                name: "Books",
                dbPath: "books",
                properties: {
                    id: { type: "number" },
                    title: { type: "string" }
                }
            };

            const result = await generateSchema([authorsCollection, booksCollection]);
            const cleanResult = cleanSchema(result);

            // Should create junction table
            expect(cleanResult).toContain(`export const authorBooks = pgTable("author_books",`);
            expect(cleanResult).toContain(`author_id: integer("author_id").references(() => authors.id`);
            expect(cleanResult).toContain(`book_id: integer("book_id").references(() => books.id`);
        });

        it("should handle 4-table many-to-many chain", async () => {
            const usersCollection: EntityCollection = {
                slug: "users",
                name: "Users",
                dbPath: "users",
                properties: {
                    id: { type: "number" },
                    name: { type: "string" },
                    permissions: { type: "relation", relationName: "permissions" }
                },
                relations: [
                    {
                        relationName: "permissions",
                        target: () => permissionsCollection,
                        cardinality: "many",
                        joins: [
                            { table: "users", sourceColumn: "id", targetColumn: "user_id" },
                            { table: "user_roles", sourceColumn: "user_id", targetColumn: "user_id" },
                            { table: "user_roles", sourceColumn: "role_id", targetColumn: "role_id" },
                            { table: "roles", sourceColumn: "role_id", targetColumn: "id" },
                            { table: "roles", sourceColumn: "id", targetColumn: "role_id" },
                            { table: "role_permissions", sourceColumn: "role_id", targetColumn: "role_id" },
                            { table: "role_permissions", sourceColumn: "permission_id", targetColumn: "permission_id" },
                            { table: "permissions", sourceColumn: "permission_id", targetColumn: "id" }
                        ]
                    }
                ]
            };

            const rolesCollection: EntityCollection = {
                slug: "roles",
                name: "Roles",
                dbPath: "roles",
                properties: {
                    id: { type: "number" },
                    name: { type: "string" }
                }
            };

            const permissionsCollection: EntityCollection = {
                slug: "permissions",
                name: "Permissions",
                dbPath: "permissions",
                properties: {
                    id: { type: "number" },
                    name: { type: "string" }
                }
            };

            const result = await generateSchema([usersCollection, rolesCollection, permissionsCollection]);

            // Should handle complex N-join scenario without hardcoded limitations
            expect(result).toContain("user_roles");
            expect(result).toContain("role_permissions");
        });
    });

    describe("Inverse Relations", () => {
        it("should generate inverse one-to-one relations", async () => {
            const authorsCollection: EntityCollection = {
                slug: "authors",
                name: "Authors",
                dbPath: "authors",
                properties: {
                    id: { type: "number" },
                    name: { type: "string" },
                    profile: { type: "relation", relationName: "profile" }
                },
                relations: [
                    {
                        relationName: "profile",
                        target: () => profilesCollection,
                        cardinality: "one",
                        direction: "inverse",
                        foreignKeyOnTarget: "author_id"
                    }
                ]
            };

            const profilesCollection: EntityCollection = {
                slug: "profiles",
                name: "Profiles",
                dbPath: "profiles",
                properties: {
                    id: { type: "number" },
                    bio: { type: "string" },
                    author_id: { type: "number" }
                }
            };

            const result = await generateSchema([authorsCollection, profilesCollection]);
            const cleanResult = cleanSchema(result);

            // Should create FK on profiles table
            expect(cleanResult).toContain(`author_id: integer("author_id")`);
            // Should create inverse relation on authors
            expect(cleanResult).toContain(`profile: one(profiles`);
        });

        it("should generate inverse one-to-many relations", async () => {
            const categoriesCollection: EntityCollection = {
                slug: "categories",
                name: "Categories",
                dbPath: "categories",
                properties: {
                    id: { type: "number" },
                    name: { type: "string" },
                    posts: { type: "relation", relationName: "posts" }
                },
                relations: [
                    {
                        relationName: "posts",
                        target: () => postsCollection,
                        cardinality: "many",
                        direction: "inverse",
                        foreignKeyOnTarget: "category_id"
                    }
                ]
            };

            const postsCollection: EntityCollection = {
                slug: "posts",
                name: "Posts",
                dbPath: "posts",
                properties: {
                    id: { type: "number" },
                    title: { type: "string" },
                    category_id: { type: "number" }
                }
            };

            const result = await generateSchema([categoriesCollection, postsCollection]);
            const cleanResult = cleanSchema(result);

            // Should create FK on posts table
            expect(cleanResult).toContain(`category_id: integer("category_id")`);
            // Should create inverse relation on categories
            expect(cleanResult).toContain(`posts: many(posts`);
        });
    });

    describe("Mixed Relation Types", () => {
        it("should handle collections with both owning and inverse relations", async () => {
            const authorsCollection: EntityCollection = {
                slug: "authors",
                name: "Authors",
                dbPath: "authors",
                properties: {
                    id: { type: "number" },
                    name: { type: "string" },
                    publisher_id: { type: "number" },
                    publisher: { type: "relation", relationName: "publisher" },
                    books: { type: "relation", relationName: "books" }
                },
                relations: [
                    {
                        relationName: "publisher",
                        target: () => publishersCollection,
                        cardinality: "one",
                        direction: "owning",
                        localKey: "publisher_id"
                    },
                    {
                        relationName: "books",
                        target: () => booksCollection,
                        cardinality: "many",
                        direction: "inverse",
                        foreignKeyOnTarget: "author_id"
                    }
                ]
            };

            const publishersCollection: EntityCollection = {
                slug: "publishers",
                name: "Publishers",
                dbPath: "publishers",
                properties: {
                    id: { type: "number" },
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
                    author_id: { type: "number" }
                }
            };

            const result = await generateSchema([authorsCollection, publishersCollection, booksCollection]);
            const cleanResult = cleanSchema(result);

            // Should handle both relation types correctly
            expect(cleanResult).toContain(`publisher_id: integer("publisher_id").references(() => publishers.id`);
            expect(cleanResult).toContain(`author_id: integer("author_id")`);
            expect(cleanResult).toContain(`publisher: one(publishers`);
            expect(cleanResult).toContain(`books: many(books`);
        });
    });

    describe("Complex Multi-Column Relations", () => {
        it("should handle multi-column foreign keys", async () => {
            const ordersCollection: EntityCollection = {
                slug: "orders",
                name: "Orders",
                dbPath: "orders",
                properties: {
                    id: { type: "number" },
                    customer_code: { type: "string" },
                    region_id: { type: "number" },
                    customer: { type: "relation", relationName: "customer" }
                },
                relations: [
                    {
                        relationName: "customer",
                        target: () => customersCollection,
                        cardinality: "one",
                        joins: [
                            {
                                table: "orders",
                                sourceColumn: ["customer_code", "region_id"],
                                targetColumn: ["customer_code", "region_id"]
                            },
                            {
                                table: "customers",
                                sourceColumn: ["customer_code", "region_id"],
                                targetColumn: ["code", "region_id"]
                            }
                        ]
                    }
                ]
            };

            const customersCollection: EntityCollection = {
                slug: "customers",
                name: "Customers",
                dbPath: "customers",
                properties: {
                    code: { type: "string" },
                    region_id: { type: "number" },
                    name: { type: "string" }
                }
            };

            const result = await generateSchema([ordersCollection, customersCollection]);

            // Should handle multi-column relationships
            expect(result).toContain("customer_code");
            expect(result).toContain("region_id");
        });
    });

    describe("Through Table Relations", () => {
        it("should handle through table format", async () => {
            const studentsCollection: EntityCollection = {
                slug: "students",
                name: "Students",
                dbPath: "students",
                properties: {
                    id: { type: "number" },
                    name: { type: "string" },
                    courses: { type: "relation", relationName: "courses" }
                },
                relations: [
                    {
                        relationName: "courses",
                        target: () => coursesCollection,
                        cardinality: "many",
                        through: {
                            table: "student_courses",
                            sourceColumn: "student_id",
                            targetColumn: "course_id"
                        }
                    }
                ]
            };

            const coursesCollection: EntityCollection = {
                slug: "courses",
                name: "Courses",
                dbPath: "courses",
                properties: {
                    id: { type: "number" },
                    name: { type: "string" }
                }
            };

            const result = await generateSchema([studentsCollection, coursesCollection]);
            const cleanResult = cleanSchema(result);

            // Should create through table correctly
            expect(cleanResult).toContain(`export const studentCourses = pgTable("student_courses",`);
            expect(cleanResult).toContain(`student_id: integer("student_id").references(() => students.id`);
            expect(cleanResult).toContain(`course_id: integer("course_id").references(() => courses.id`);
        });
    });

    describe("Edge Cases and Production Scenarios", () => {
        it("should handle self-referencing many-to-many", async () => {
            const usersCollection: EntityCollection = {
                slug: "users",
                name: "Users",
                dbPath: "users",
                properties: {
                    id: { type: "number" },
                    name: { type: "string" },
                    friends: { type: "relation", relationName: "friends" }
                },
                relations: [
                    {
                        relationName: "friends",
                        target: () => usersCollection,
                        cardinality: "many",
                        joins: [
                            { table: "users", sourceColumn: "id", targetColumn: "user_id" },
                            { table: "user_friends", sourceColumn: "user_id", targetColumn: "user_id" },
                            { table: "user_friends", sourceColumn: "friend_id", targetColumn: "friend_id" },
                            { table: "users", sourceColumn: "friend_id", targetColumn: "id" }
                        ]
                    }
                ]
            };

            const result = await generateSchema([usersCollection]);

            // Should handle self-referencing relations
            expect(result).toContain("user_friends");
            expect(result).toContain("user_id");
            expect(result).toContain("friend_id");
        });

        it("should handle mixed ID types in relations", async () => {
            const productsCollection: EntityCollection = {
                slug: "products",
                name: "Products",
                dbPath: "products",
                customId: true,
                properties: {
                    sku: { type: "string" },
                    name: { type: "string" },
                    categories: { type: "relation", relationName: "categories" }
                },
                idField: "sku",
                relations: [
                    {
                        relationName: "categories",
                        target: () => categoriesCollection,
                        cardinality: "many",
                        joins: [
                            { table: "products", sourceColumn: "sku", targetColumn: "product_sku" },
                            { table: "product_categories", sourceColumn: "product_sku", targetColumn: "product_sku" },
                            { table: "product_categories", sourceColumn: "category_id", targetColumn: "category_id" },
                            { table: "categories", sourceColumn: "category_id", targetColumn: "id" }
                        ]
                    }
                ]
            };

            const categoriesCollection: EntityCollection = {
                slug: "categories",
                name: "Categories",
                dbPath: "categories",
                properties: {
                    id: { type: "number" },
                    name: { type: "string" }
                }
            };

            const result = await generateSchema([productsCollection, categoriesCollection]);

            // Should handle mixed string/number ID types
            expect(result).toContain("sku: varchar(\"sku\").primaryKey()");
            expect(result).toContain("id: serial(\"id\").primaryKey()");
            expect(result).toContain("product_sku: varchar(\"product_sku\")");
            expect(result).toContain("category_id: integer(\"category_id\")");
        });

        it("should handle circular references", async () => {
            const aCollection: EntityCollection = {
                slug: "a_entities",
                name: "A Entities",
                dbPath: "a_entities",
                properties: {
                    id: { type: "number" },
                    name: { type: "string" },
                    b_entities: { type: "relation", relationName: "b_entities" }
                },
                relations: [
                    {
                        relationName: "b_entities",
                        target: () => bCollection,
                        cardinality: "many",
                        direction: "inverse",
                        foreignKeyOnTarget: "a_entity_id"
                    }
                ]
            };

            const bCollection: EntityCollection = {
                slug: "b_entities",
                name: "B Entities",
                dbPath: "b_entities",
                properties: {
                    id: { type: "number" },
                    name: { type: "string" },
                    a_entity_id: { type: "number" },
                    a_entity: { type: "relation", relationName: "a_entity" }
                },
                relations: [
                    {
                        relationName: "a_entity",
                        target: () => aCollection,
                        cardinality: "one",
                        direction: "owning",
                        localKey: "a_entity_id"
                    }
                ]
            };

            const result = await generateSchema([aCollection, bCollection]);

            // Should handle circular references without infinite loops
            expect(result).toContain("a_entities");
            expect(result).toContain("b_entities");
            expect(result).toContain("a_entity_id");
        });
    });
});
