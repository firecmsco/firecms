import request from "supertest";
import { RebaseApiServer } from "../../src/api/server";

// Wait, the createHandler is mocked out globally in some tests, but for GraphQL E2E we actually want to test the GraphQL engine.
// Actually, jest.mock is usually on a per-file basis unless it's in a setup file. We won't mock graphql-http here.

jest.mock("cors", () => jest.fn(() => (req: any, res: any, next: any) => next()));

describe("GraphQL E2E Tests", () => {
    let mockDataSource: any;
    let mockCollections: any[];
    let server: RebaseApiServer;
    let app: any;

    beforeEach(async () => {
        mockCollections = [
            {
                slug: "books",
                name: "Books",
                singularName: "Book",
                dbPath: "books",
                properties: {
                    id: { type: "string" },
                    title: { type: "string" },
                    pages: { type: "number" },
                },
                idField: "id"
            }
        ];

        mockDataSource = {
            key: "mock-data-source",
            fetchCollection: jest.fn().mockResolvedValue([{
                id: "b1",
                values: { title: "Dune", pages: 412 },
                path: "books"
            }]),
            fetchEntity: jest.fn().mockResolvedValue({
                id: "b1",
                values: { title: "Dune", pages: 412 },
                path: "books"
            }),
            saveEntity: jest.fn().mockImplementation(async (args: any) => {
                if (args.status === "existing" && args.entityId === "non-existent") {
                    throw new Error("Entity non-existent not found");
                }
                return {
                    id: args.entityId || "new-b1",
                    values: args.values,
                    path: args.path
                };
            }),
            deleteEntity: jest.fn().mockResolvedValue(true)
        };

        server = await RebaseApiServer.create({
            dataSource: mockDataSource as any,
            collections: mockCollections,
            enableGraphQL: true,
            enableREST: false,
            requireAuth: false
        });

        app = server.getApp();
    });

    it("should query a single entity", async () => {
        const query = `
            query {
                book(id: "b1") {
                    id
                    title
                    pages
                }
            }
        `;

        const res = await request(app)
            .post("/api/graphql")
            .send({ query });

        expect(res.status).toBe(200);
        expect(res.body.data.book).toEqual({
            id: "b1",
            title: "Dune",
            pages: 412
        });
        expect(mockDataSource.fetchEntity).toHaveBeenCalledWith(
            expect.objectContaining({ entityId: "b1" })
        );
    });

    it("should query a list of entities", async () => {
        const query = `
            query {
                books(limit: 5) {
                    id
                    title
                    pages
                }
            }
        `;

        const res = await request(app)
            .post("/api/graphql")
            .send({ query });

        expect(res.status).toBe(200);
        expect(res.body.data.books).toHaveLength(1);
        expect(res.body.data.books[0]).toEqual({
            id: "b1",
            title: "Dune",
            pages: 412
        });
        expect(mockDataSource.fetchCollection).toHaveBeenCalledWith(
            expect.objectContaining({ limit: 5 })
        );
    });

    it("should parse where filters in list query", async () => {
        const query = `
            query {
                books(where: "{\\"pages\\":[\\">\\", 400]}") {
                    id
                }
            }
        `;

        const res = await request(app)
            .post("/api/graphql")
            .send({ query });

        expect(mockDataSource.fetchCollection).toHaveBeenCalledWith(
            expect.objectContaining({
                filter: { pages: [">", 400] }
            })
        );
    });

    it("should execute create mutation", async () => {
        const mutation = `
            mutation {
                createBook(input: { title: "Foundation", pages: 255 }) {
                    id
                    title
                    pages
                }
            }
        `;

        const res = await request(app)
            .post("/api/graphql")
            .send({ query: mutation });

        expect(res.status).toBe(200);
        expect(res.body.errors).toBeUndefined();
        expect(res.body.data.createBook.id).toBe("new-b1");
        expect(res.body.data.createBook.title).toBe("Foundation");

        expect(mockDataSource.saveEntity).toHaveBeenCalledWith(
            expect.objectContaining({
                status: "new",
                values: { title: "Foundation", pages: 255 }
            })
        );
    });

    it("should execute update mutation", async () => {
        const mutation = `
            mutation {
                updateBook(id: "b1", input: { title: "Dune Messiah", pages: 256 }) {
                    id
                    title
                    pages
                }
            }
        `;

        const res = await request(app)
            .post("/api/graphql")
            .send({ query: mutation });

        expect(res.status).toBe(200);
        expect(res.body.data.updateBook.title).toBe("Dune Messiah");

        expect(mockDataSource.saveEntity).toHaveBeenCalledWith(
            expect.objectContaining({
                entityId: "b1",
                status: "existing",
                values: { title: "Dune Messiah", pages: 256 }
            })
        );
    });

    it("should execute delete mutation", async () => {
        const mutation = `
            mutation {
                deleteBook(id: "b1")
            }
        `;

        const res = await request(app)
            .post("/api/graphql")
            .send({ query: mutation });

        expect(res.status).toBe(200);
        expect(res.body.data.deleteBook).toBe(true);
        expect(mockDataSource.deleteEntity).toHaveBeenCalled();
    });

    describe("Error Handling", () => {
        it("should return null or error when querying a non-existent entity", async () => {
            mockDataSource.fetchEntity.mockResolvedValueOnce(null);

            const query = `
                query {
                    book(id: "non-existent") {
                        id
                        title
                    }
                }
            `;

            const res = await request(app)
                .post("/api/graphql")
                .send({ query });

            expect(res.status).toBe(200);
            // In GraphQL, querying a single entity that doesn't exist typically returns null for that field.
            expect(res.body.data.book).toBeNull();
        });

        it("should return error when updating a non-existent entity", async () => {
            // fetchEntity returns null when checking if it exists before update
            mockDataSource.fetchEntity.mockResolvedValueOnce(null);

            const mutation = `
                mutation {
                    updateBook(id: "non-existent", input: { title: "Doesn't Matter" }) {
                        id
                    }
                }
            `;

            const res = await request(app)
                .post("/api/graphql")
                .send({ query: mutation });

            expect(res.status).toBe(200); // the HTTP request succeeds
            expect(res.body.errors).toBeDefined(); // but GraphQL returns errors
            expect(res.body.errors[0].message).toContain("not found");
        });

        it("should return false when deleting a non-existent entity", async () => {
            mockDataSource.fetchEntity.mockResolvedValueOnce(null);

            const mutation = `
                mutation {
                    deleteBook(id: "non-existent")
                }
            `;

            const res = await request(app)
                .post("/api/graphql")
                .send({ query: mutation });

            expect(res.status).toBe(200);
            expect(res.body.errors).toBeUndefined();
            expect(res.body.data.deleteBook).toBe(false);
        });
    });
});
