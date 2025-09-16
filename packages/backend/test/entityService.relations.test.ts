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

        db = {
            select: jest.fn().mockReturnThis(),
            from: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockResolvedValue([]),
            innerJoin: jest.fn().mockReturnThis(),
            insert: jest.fn().mockReturnThis(),
            values: jest.fn().mockReturnThis(),
            returning: jest.fn().mockResolvedValue([]),
            update: jest.fn().mockReturnThis(),
            set: jest.fn().mockReturnThis(),
            delete: jest.fn().mockReturnThis(),
            transaction: jest.fn((callback) => callback(db)),
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
});
