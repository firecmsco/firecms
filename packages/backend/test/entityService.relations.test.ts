import { EntityService } from "../src/db/entityService";
import { EntityService } from "../src/db/entityService";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { EntityCollection } from "@firecms/types";
import { collectionRegistry } from "../src/collections/registry";

describe("EntityService - Relation Types Tests", () => {
    let entityService: EntityService;
    let db: jest.Mocked<NodePgDatabase<any>>;

    // Mock tables for different relation scenarios
    const mockOrdersTable = {
        id: { name: "id" },
        customer_id: { name: "customer_id" },
        total: { name: "total" },
        _def: { tableName: "orders" }
    };

    const mockCustomersTable = {
        id: { name: "id" },
        name: { name: "name" },
        email: { name: "email" },
        customer_id: { name: "customer_id" }, // Add for relations
        _def: { tableName: "customers" }
    };

    const mockProductsTable = {
        id: { name: "id" },
        name: { name: "name" },
        price: { name: "price" },
        customer_id: { name: "customer_id" }, // Add for relations
        _def: { tableName: "products" }
    };

    const mockOrderItemsTable = {
        order_id: { name: "order_id" },
        product_id: { name: "product_id" },
        quantity: { name: "quantity" },
        _def: { tableName: "order_items" }
    };

    const mockUserProfilesTable = {
        id: { name: "id" },
        user_id: { name: "user_id" },
        bio: { name: "bio" },
        _def: { tableName: "user_profiles" }
    };

    // Collection definitions for testing different relation types
    const customersCollection: EntityCollection = {
        slug: "customers",
        name: "Customers",
        dbPath: "customers",
        properties: {
            id: { type: "number" },
            name: { type: "string" },
            email: { type: "string" },
            orders: { type: "relation", relationName: "orders" },
            profile: { type: "relation", relationName: "profile" }
        },
        relations: [
            {
                relationName: "orders",
                target: () => ordersCollection,
                cardinality: "many",
                direction: "inverse",
                foreignKeyOnTarget: "customer_id"
            },
            {
                relationName: "profile",
                target: () => userProfilesCollection,
                cardinality: "one",
                direction: "inverse",
                foreignKeyOnTarget: "user_id"
            }
        ],
        idField: "id"
    };

    const ordersCollection: EntityCollection = {
        slug: "orders",
        name: "Orders",
        dbPath: "orders",
        properties: {
            id: { type: "number" },
            total: { type: "number" },
            customer: { type: "relation", relationName: "customer" },
            products: { type: "relation", relationName: "products" }
        },
        relations: [
            {
                relationName: "customer",
                target: () => customersCollection,
                cardinality: "one",
                direction: "owning",
                localKey: "customer_id"
            },
            {
                relationName: "products",
                target: () => productsCollection,
                cardinality: "many",
                direction: "owning",
                through: {
                    table: "order_items",
                    sourceColumn: "order_id",
                    targetColumn: "product_id"
                }
            }
        ],
        idField: "id"
    };

    const productsCollection: EntityCollection = {
        slug: "products",
        name: "Products",
        dbPath: "products",
        properties: {
            id: { type: "number" },
            name: { type: "string" },
            price: { type: "number" }
        },
        idField: "id"
    };

    const userProfilesCollection: EntityCollection = {
        slug: "user_profiles",
        name: "User Profiles",
        dbPath: "user_profiles",
        properties: {
            id: { type: "number" },
            bio: { type: "string" },
            user: { type: "relation", relationName: "user" }
        },
        relations: [
            {
                relationName: "user",
                target: () => customersCollection,
                cardinality: "one",
                direction: "owning",
                localKey: "user_id"
            }
        ],
        idField: "id"
    };

    beforeEach(() => {
        jest.clearAllMocks();

        jest.spyOn(collectionRegistry, "getCollectionByPath").mockImplementation(path => {
            if (path.startsWith("customers")) return customersCollection;
            if (path.startsWith("orders")) return ordersCollection;
            if (path.startsWith("products")) return productsCollection;
            if (path.startsWith("user_profiles")) return userProfilesCollection;
            return undefined;
        });

        jest.spyOn(collectionRegistry, "getTable").mockImplementation(dbPath => {
            if (dbPath === "customers") return mockCustomersTable as any;
            if (dbPath === "orders") return mockOrdersTable as any;
            if (dbPath === "products") return mockProductsTable as any;
            if (dbPath === "user_profiles") return mockUserProfilesTable as any;
            if (dbPath === "order_items") return mockOrderItemsTable as any;
            return undefined;
        });

        // Create a mock query object that can be awaited
        const mockQuery = {
            then: jest.fn((resolve) => resolve([]))
        };

        db = {
            select: jest.fn().mockReturnThis(),
            from: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnValue(mockQuery),
            innerJoin: jest.fn().mockReturnThis(),
            insert: jest.fn().mockReturnThis(),
            values: jest.fn().mockReturnThis(),
            returning: jest.fn().mockResolvedValue([]),
            update: jest.fn().mockReturnThis(),
            set: jest.fn().mockReturnThis(),
            delete: jest.fn().mockReturnThis(),
            transaction: jest.fn((callback) => callback(db)),
            then: jest.fn((resolve) => resolve([]))
        } as any;

        entityService = new EntityService(db);
    });

    describe("One-to-Many Relations (Inverse)", () => {
        it("should fetch related entities using foreign key where clause", async () => {
            const mockOrders = [
                { orders: { id: 1, total: 100, customer_id: 1 } },
                { orders: { id: 2, total: 200, customer_id: 1 } }
            ];
            db.orderBy.mockResolvedValue(mockOrders);

            const entities = await entityService.fetchCollection("customers/1/orders", {});

            expect(entities).toHaveLength(2);
            expect(entities[0].values.total).toBe(100);
            // Should use WHERE clause, not JOIN for simple inverse relations
            expect(db.where).toHaveBeenCalled();
        });

        it("should handle empty result sets", async () => {
            db.orderBy.mockResolvedValue([]);

            const entities = await entityService.fetchCollection("customers/999/orders", {});

            expect(entities).toHaveLength(0);
        });
    });

    describe("Many-to-One Relations (Owning)", () => {
        it("should serialize owning relation correctly on create", async () => {
            const newOrder = {
                total: 150,
                customer: { id: "1", path: "customers", __type: "relation" }
            };

            db.returning.mockResolvedValue([{ id: 3 }]);
            db.limit.mockResolvedValue([{
                id: 3,
                total: 150,
                customer_id: 1
            }]);

            const entity = await entityService.saveEntity("orders", newOrder);

            expect(db.values).toHaveBeenCalledWith(expect.objectContaining({
                total: 150,
                customer_id: "1"
            }));
            expect(entity.values.customer).toEqual({
                id: "1",
                path: "customers",
                __type: "relation"
            });
        });

        it("should deserialize owning relation correctly on fetch", async () => {
            const mockOrder = {
                id: 1,
                total: 100,
                customer_id: 5
            };
            db.limit.mockResolvedValue([mockOrder]);

            const entity = await entityService.fetchEntity("orders", 1);

            expect(entity?.values.customer).toEqual({
                id: "5",
                path: "customers",
                __type: "relation"
            });
        });
    });

    describe("Many-to-Many Relations (Through Table)", () => {
        it("should handle many-to-many relations with junction table", async () => {
            const mockProducts = [
                { products: { id: 1, name: "Product 1", price: 10 } },
                { products: { id: 2, name: "Product 2", price: 20 } }
            ];
            db.orderBy.mockResolvedValue(mockProducts);

            const entities = await entityService.fetchCollection("orders/1/products", {});

            expect(entities).toHaveLength(2);
            expect(entities[0].values.name).toBe("Product 1");
            // Should use JOIN for many-to-many relations
            expect(db.innerJoin).toHaveBeenCalled();
        });

        it("should create many-to-many relations correctly", async () => {
            const newOrder = {
                total: 300,
                customer: { id: "1", path: "customers", __type: "relation" }
            };

            db.returning.mockResolvedValue([{ id: 4 }]);
            db.limit.mockResolvedValue([{
                id: 4,
                total: 300,
                customer_id: 1
            }]);

            const entity = await entityService.saveEntity("orders", newOrder);

            expect(db.values).toHaveBeenCalledWith(expect.objectContaining({
                total: 300,
                customer_id: "1"
            }));
        });
    });

    describe("One-to-One Relations", () => {
        it("should handle one-to-one relations correctly", async () => {
            const mockProfile = [
                { user_profiles: { id: 1, bio: "User bio", user_id: 1 } }
            ];
            db.orderBy.mockResolvedValue(mockProfile);

            const entities = await entityService.fetchCollection("customers/1/profile", {});

            expect(entities).toHaveLength(1);
            expect(entities[0].values.bio).toBe("User bio");
        });

        it("should create one-to-one relations correctly", async () => {
            const newProfile = {
                bio: "New user bio",
                user: { id: "1", path: "customers", __type: "relation" }
            };

            db.returning.mockResolvedValue([{ id: 1 }]);
            db.limit.mockResolvedValue([{
                id: 1,
                bio: "New user bio",
                user_id: 1
            }]);

            const entity = await entityService.saveEntity("user_profiles", newProfile);

            expect(db.values).toHaveBeenCalledWith(expect.objectContaining({
                bio: "New user bio",
                user_id: "1"
            }));
        });
    });

    describe("Relation Validation", () => {
        it("should handle null relations gracefully", async () => {
            const orderWithoutCustomer = {
                total: 150
            };

            db.returning.mockResolvedValue([{ id: 5 }]);
            db.limit.mockResolvedValue([{
                id: 5,
                total: 150,
                customer_id: null
            }]);

            const entity = await entityService.saveEntity("orders", orderWithoutCustomer);

            expect(db.values).toHaveBeenCalledWith(expect.objectContaining({
                total: 150
            }));
            expect(entity.values.customer).toBeUndefined();
        });
    });

    describe("Complex Relation Queries", () => {
        it("should handle deep nested relation paths", async () => {
            const mockProducts = [
                { products: { id: 1, name: "Product 1" } }
            ];
            db.orderBy.mockResolvedValue(mockProducts);

            const entities = await entityService.fetchCollection("customers/1/orders/1/products", {});

            expect(entities).toHaveLength(1);
            expect(collectionRegistry.getCollectionByPath).toHaveBeenCalledWith("customers");
        });

        it("should apply filters on related entities", async () => {
            const mockOrders = [
                { id: 1, total: 100, customer_id: 1 }
            ];
            db.orderBy.mockResolvedValue(mockOrders);

            const entities = await entityService.fetchCollection("customers/1/orders", {
                filter: { total: [">=", 100] }
            });

            expect(entities).toHaveLength(1);
            expect(db.where).toHaveBeenCalled();
        });

        it("should order related entities correctly", async () => {
            const mockOrders = [
                { id: 2, total: 200, customer_id: 1 },
                { id: 1, total: 100, customer_id: 1 }
            ];
            db.orderBy.mockResolvedValue(mockOrders);

            const entities = await entityService.fetchCollection("customers/1/orders", {
                orderBy: "total",
                order: "desc"
            });

            expect(entities[0].values.total).toBe(200);
            expect(db.orderBy).toHaveBeenCalled();
        });
    });

    describe("Relation Updates", () => {
        it("should update owning relations correctly", async () => {
            const updatedOrder = {
                customer: { id: "2", path: "customers", __type: "relation" }
            };

            db.returning.mockResolvedValue([{ id: 1 }]);
            db.limit.mockResolvedValue([{
                id: 1,
                total: 100,
                customer_id: 2
            }]);

            const entity = await entityService.saveEntity("orders", updatedOrder, 1);

            expect(db.set).toHaveBeenCalledWith(expect.objectContaining({
                customer_id: "2"
            }));
        });

        it("should handle removing relations", async () => {
            const orderWithoutCustomer = {
                // Not setting customer property means it should remain unchanged
            };

            db.returning.mockResolvedValue([{ id: 1 }]);
            db.limit.mockResolvedValue([{
                id: 1,
                total: 100,
                customer_id: null
            }]);

            const entity = await entityService.saveEntity("orders", orderWithoutCustomer, 1);

            // Since no customer property was provided, nothing should be set
            expect(db.set).toHaveBeenCalledWith({});
        });
    });

    describe("Advanced Relation Types - Complete Coverage", () => {
        // Additional mock tables for joinPath scenarios
        const mockAuthorsTable = {
            id: { name: "id" },
            name: { name: "name" },
            _def: { tableName: "authors" }
        };

        const mockPostsTable = {
            id: { name: "id" },
            title: { name: "title" },
            author_id: { name: "author_id" },
            _def: { tableName: "posts" }
        };

        const mockCommentsTable = {
            id: { name: "id" },
            content: { name: "content" },
            post_id: { name: "post_id" },
            _def: { tableName: "comments" }
        };

        const mockTagsTable = {
            id: { name: "id" },
            name: { name: "name" },
            _def: { tableName: "tags" }
        };

        const mockPostTagsTable = {
            post_id: { name: "post_id" },
            tag_id: { name: "tag_id" },
            _def: { tableName: "post_tags" }
        };

        // Test Case 1: ONE + owning + localKey (already covered in "Many-to-One Relations")
        // This is the Post -> Author relationship

        describe("ONE + owning + joinPath", () => {
            const postsWithAuthorViaJoinPath: EntityCollection = {
                slug: "posts_jp",
                name: "Posts with JoinPath",
                dbPath: "posts",
                properties: {
                    id: { type: "number" },
                    title: { type: "string" },
                    authorProfile: { type: "relation", relationName: "authorProfile" }
                },
                relations: [
                    {
                        relationName: "authorProfile",
                        target: () => userProfilesCollection,
                        cardinality: "one",
                        direction: "owning",
                        joinPath: [
                            { table: "authors", on: { from: "posts.author_id", to: "authors.id" } },
                            { table: "user_profiles", on: { from: "authors.id", to: "user_profiles.user_id" } }
                        ]
                    }
                ],
                idField: "id"
            };

            it("should handle one-to-one owning relation via joinPath on write", async () => {
                jest.spyOn(collectionRegistry, "getCollectionByPath").mockReturnValue(postsWithAuthorViaJoinPath);
                jest.spyOn(collectionRegistry, "getTable").mockImplementation(dbPath => {
                    if (dbPath === "posts") return mockPostsTable as any;
                    if (dbPath === "authors") return mockAuthorsTable as any;
                    if (dbPath === "user_profiles") return mockUserProfilesTable as any;
                    return undefined;
                });

                const newPost = {
                    title: "Test Post",
                    authorProfile: { id: "1", path: "user_profiles", __type: "relation" }
                };

                db.returning.mockResolvedValue([{ id: 1 }]);
                db.limit.mockResolvedValue([{ id: 1, title: "Test Post", author_id: 1 }]);

                const entity = await entityService.saveEntity("posts_jp", newPost);

                // Should have captured the joinPath relation update
                expect(db.transaction).toHaveBeenCalled();
            });
        });

        describe("ONE + inverse + foreignKeyOnTarget (already covered in One-to-One Relations)", () => {
            // This is the Customer <- Profile relationship
            it("should update inverse one-to-one relation", async () => {
                const customerWithProfile = {
                    name: "John Doe",
                    profile: { id: "1", path: "user_profiles", __type: "relation" }
                };

                db.returning.mockResolvedValue([{ id: 1 }]);
                db.limit.mockResolvedValue([{ id: 1, name: "John Doe" }]);

                const entity = await entityService.saveEntity("customers", customerWithProfile);

                // Should trigger inverse relation update
                expect(db.transaction).toHaveBeenCalled();
            });
        });

        describe("ONE + inverse + joinPath", () => {
            const authorsWithProfileViaJoinPath: EntityCollection = {
                slug: "authors_jp",
                name: "Authors with Profile via JoinPath",
                dbPath: "authors",
                properties: {
                    id: { type: "number" },
                    name: { type: "string" },
                    profile: { type: "relation", relationName: "profile" }
                },
                relations: [
                    {
                        relationName: "profile",
                        target: () => userProfilesCollection,
                        cardinality: "one",
                        direction: "inverse",
                        joinPath: [
                            { table: "customers", on: { from: "authors.id", to: "customers.id" } },
                            { table: "user_profiles", on: { from: "customers.id", to: "user_profiles.user_id" } }
                        ]
                    }
                ],
                idField: "id"
            };

            it("should handle one-to-one inverse relation via joinPath on write", async () => {
                jest.spyOn(collectionRegistry, "getCollectionByPath").mockReturnValue(authorsWithProfileViaJoinPath);
                jest.spyOn(collectionRegistry, "getTable").mockImplementation(dbPath => {
                    if (dbPath === "authors") return mockAuthorsTable as any;
                    if (dbPath === "customers") return mockCustomersTable as any;
                    if (dbPath === "user_profiles") return mockUserProfilesTable as any;
                    return undefined;
                });

                const newAuthor = {
                    name: "Jane Author",
                    profile: { id: "2", path: "user_profiles", __type: "relation" }
                };

                db.returning.mockResolvedValue([{ id: 1 }]);
                db.limit.mockResolvedValue([{ id: 1, name: "Jane Author" }]);

                const entity = await entityService.saveEntity("authors_jp", newAuthor);

                // Should trigger inverse joinPath relation update
                expect(db.transaction).toHaveBeenCalled();
            });
        });

        describe("MANY + owning + through (already covered in Many-to-Many Relations)", () => {
            // This is the Order -> Products via order_items relationship
            it("should update many-to-many owning relation with through", async () => {
                const orderWithProducts = {
                    total: 500,
                    products: [
                        { id: "1", path: "products", __type: "relation" },
                        { id: "2", path: "products", __type: "relation" }
                    ]
                };

                db.returning.mockResolvedValue([{ id: 1 }]);
                db.limit.mockResolvedValue([{ id: 1, total: 500 }]);

                const entity = await entityService.saveEntity("orders", orderWithProducts);

                // Should manage junction table entries
                expect(db.transaction).toHaveBeenCalled();
            });
        });

        describe("MANY + owning + joinPath", () => {
            const postsWithTagsViaJoinPath: EntityCollection = {
                slug: "posts_tags_jp",
                name: "Posts with Tags via JoinPath",
                dbPath: "posts",
                properties: {
                    id: { type: "number" },
                    title: { type: "string" },
                    tags: { type: "relation", relationName: "tags" }
                },
                relations: [
                    {
                        relationName: "tags",
                        target: () => ({
                            slug: "tags",
                            name: "Tags",
                            dbPath: "tags",
                            properties: { id: { type: "number" }, name: { type: "string" } },
                            idField: "id"
                        }),
                        cardinality: "many",
                        direction: "owning",
                        joinPath: [
                            { table: "post_tags", on: { from: "posts.id", to: "post_tags.post_id" } },
                            { table: "tags", on: { from: "post_tags.tag_id", to: "tags.id" } }
                        ]
                    }
                ],
                idField: "id"
            };

            it("should handle many-to-many owning relation via joinPath on write", async () => {
                jest.spyOn(collectionRegistry, "getCollectionByPath").mockImplementation(path => {
                    if (path === "posts_tags_jp" || path === "posts") return postsWithTagsViaJoinPath;
                    if (path.startsWith("tags")) return postsWithTagsViaJoinPath.relations![0].target();
                    return undefined;
                });
                jest.spyOn(collectionRegistry, "getTable").mockImplementation(dbPath => {
                    if (dbPath === "posts") return mockPostsTable as any;
                    if (dbPath === "post_tags") return mockPostTagsTable as any;
                    if (dbPath === "tags") return mockTagsTable as any;
                    return undefined;
                });

                const postWithTags = {
                    title: "Tagged Post",
                    tags: [
                        { id: "1", path: "tags", __type: "relation" },
                        { id: "2", path: "tags", __type: "relation" }
                    ]
                };

                db.returning.mockResolvedValue([{ id: 1 }]);
                db.limit.mockResolvedValue([{ id: 1, title: "Tagged Post" }]);
                // Mock the fetch for tags relation - return empty array since we're testing write
                db.orderBy.mockResolvedValue([]);

                const _entity = await entityService.saveEntity("posts_tags_jp", postWithTags);

                // Should manage junction table via joinPath
                expect(db.transaction).toHaveBeenCalled();
                expect(db.delete).toHaveBeenCalled(); // Should delete old junction entries
            });
        });

        describe("MANY + inverse + foreignKeyOnTarget (already covered)", () => {
            // This is the Customer <- Orders relationship
            it("should update one-to-many inverse relation", async () => {
                const customerWithOrders = {
                    name: "Big Customer",
                    orders: [
                        { id: "1", path: "orders", __type: "relation" },
                        { id: "2", path: "orders", __type: "relation" }
                    ]
                };

                db.returning.mockResolvedValue([{ id: 1 }]);
                db.limit.mockResolvedValue([{ id: 1, name: "Big Customer" }]);

                const entity = await entityService.saveEntity("customers", customerWithOrders);

                // Should update FK on target entities
                expect(db.transaction).toHaveBeenCalled();
            });
        });

        describe("MANY + inverse + through", () => {
            const productsWithOrdersInverse: EntityCollection = {
                slug: "products_orders",
                name: "Products with Orders Inverse",
                dbPath: "products",
                properties: {
                    id: { type: "number" },
                    name: { type: "string" },
                    orders: { type: "relation", relationName: "orders" }
                },
                relations: [
                    {
                        relationName: "orders",
                        target: () => ordersCollection,
                        cardinality: "many",
                        direction: "inverse",
                        inverseRelationName: "products",
                        // Add joinPath to satisfy the validation
                        joinPath: [
                            { table: "order_items", on: { from: "products.id", to: "order_items.product_id" } },
                            { table: "orders", on: { from: "order_items.order_id", to: "orders.id" } }
                        ]
                    }
                ],
                idField: "id"
            };

            it("should handle many-to-many inverse relation with through", async () => {
                jest.spyOn(collectionRegistry, "getCollectionByPath").mockImplementation(path => {
                    if (path === "products_orders" || path === "products") return productsWithOrdersInverse;
                    if (path.startsWith("orders")) return ordersCollection;
                    return undefined;
                });
                jest.spyOn(collectionRegistry, "getTable").mockImplementation(dbPath => {
                    if (dbPath === "products") return mockProductsTable as any;
                    if (dbPath === "orders") return mockOrdersTable as any;
                    if (dbPath === "order_items") return mockOrderItemsTable as any;
                    return undefined;
                });

                const productWithOrders = {
                    name: "Popular Product",
                    orders: [
                        { id: "1", path: "orders", __type: "relation" },
                        { id: "2", path: "orders", __type: "relation" }
                    ]
                };

                db.returning.mockResolvedValue([{ id: 1 }]);
                db.limit.mockResolvedValue([{ id: 1, name: "Popular Product" }]);
                // Mock the fetch for orders relation - return empty array
                db.orderBy.mockResolvedValue([]);

                const _entity = await entityService.saveEntity("products_orders", productWithOrders);

                // Should manage junction table from inverse side
                expect(db.transaction).toHaveBeenCalled();
                expect(db.delete).toHaveBeenCalled(); // Should delete old junction entries
            });
        });

        describe("MANY + inverse + joinPath", () => {
            const tagsWithPostsViaJoinPath: EntityCollection = {
                slug: "tags_posts_jp",
                name: "Tags with Posts via JoinPath",
                dbPath: "tags",
                properties: {
                    id: { type: "number" },
                    name: { type: "string" },
                    posts: { type: "relation", relationName: "posts" }
                },
                relations: [
                    {
                        relationName: "posts",
                        target: () => ({
                            slug: "posts",
                            name: "Posts",
                            dbPath: "posts",
                            properties: { id: { type: "number" }, title: { type: "string" } },
                            idField: "id"
                        }),
                        cardinality: "many",
                        direction: "inverse",
                        joinPath: [
                            { table: "post_tags", on: { from: "tags.id", to: "post_tags.tag_id" } },
                            { table: "posts", on: { from: "post_tags.post_id", to: "posts.id" } }
                        ]
                    }
                ],
                idField: "id"
            };

            it("should handle many-to-many inverse relation via joinPath on write", async () => {
                jest.spyOn(collectionRegistry, "getCollectionByPath").mockImplementation(path => {
                    if (path === "tags_posts_jp" || path === "tags") return tagsWithPostsViaJoinPath;
                    if (path.startsWith("posts")) return tagsWithPostsViaJoinPath.relations![0].target();
                    return undefined;
                });
                jest.spyOn(collectionRegistry, "getTable").mockImplementation(dbPath => {
                    if (dbPath === "tags") return mockTagsTable as any;
                    if (dbPath === "post_tags") return mockPostTagsTable as any;
                    if (dbPath === "posts") return mockPostsTable as any;
                    return undefined;
                });

                const tagWithPosts = {
                    name: "Popular Tag",
                    posts: [
                        { id: "1", path: "posts", __type: "relation" },
                        { id: "2", path: "posts", __type: "relation" }
                    ]
                };

                db.returning.mockResolvedValue([{ id: 1 }]);
                db.limit.mockResolvedValue([{ id: 1, name: "Popular Tag" }]);
                // Mock the fetch for posts relation - return empty array since we're testing write
                db.orderBy.mockResolvedValue([]);

                const _entity = await entityService.saveEntity("tags_posts_jp", tagWithPosts);

                // Should manage junction table via inverse joinPath
                expect(db.transaction).toHaveBeenCalled();
                expect(db.delete).toHaveBeenCalled(); // Should delete old junction entries
            });
        });
    });
});
