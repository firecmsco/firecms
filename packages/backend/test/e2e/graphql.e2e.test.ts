import request from "supertest";
import { FireCMSApiServer } from "../../src/api/server";

// Wait, the createHandler is mocked out globally in some tests, but for GraphQL E2E we actually want to test the GraphQL engine.
// Actually, jest.mock is usually on a per-file basis unless it's in a setup file. We won't mock graphql-http here.

jest.mock("cors", () => jest.fn(() => (req: any, res: any, next: any) => next()));

describe("GraphQL E2E Tests", () => {
    let mockDataSource: any;
    let mockCollections: any[];
    let server: FireCMSApiServer;
    let app: any;

    beforeEach(() => {
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
            saveEntity: jest.fn().mockImplementation((args: any) => ({
                id: args.entityId || "new-b1",
                values: args.values,
                path: args.path
            })),
            deleteEntity: jest.fn().mockResolvedValue(true),
            generateEntityId: jest.fn().mockReturnValue("generated-id")
        };

        server = new FireCMSApiServer({
            dataSource: mockDataSource as any,
            collections: mockCollections,
            enableGraphQL: true,
            enableREST: false
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
        expect(res.body.data.createBook.id).toBe("generated-id");
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
});
