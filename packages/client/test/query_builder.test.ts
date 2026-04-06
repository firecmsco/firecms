import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { QueryBuilder, FilterOperator } from "../src/query_builder";
import { CollectionClient } from "../src/collection";

function createMockCollection(): CollectionClient<any> {
    return {
        find: jest.fn(),
        findById: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        listen: jest.fn(),
        where: jest.fn(),
        orderBy: jest.fn(),
        limit: jest.fn(),
        offset: jest.fn(),
        search: jest.fn(),
        include: jest.fn(),
    } as unknown as CollectionClient<any>;
}

describe("QueryBuilder", () => {
    let mockCollection: CollectionClient<any>;

    beforeEach(() => {
        mockCollection = createMockCollection();
    });

    // -----------------------------------------------------------------------
    // Operator mapping
    // -----------------------------------------------------------------------
    describe("Operator mapping", () => {
        it("maps == to eq (renders as plain value)", () => {
            const qb = new QueryBuilder(mockCollection);
            qb.where("age", "==", 18);
            expect((qb as any).params.where).toEqual({ age: "18" });
        });

        it("maps != to neq", () => {
            const qb = new QueryBuilder(mockCollection);
            qb.where("age", "!=", 18);
            expect((qb as any).params.where).toEqual({ age: "neq.18" });
        });

        it("maps > to gt", () => {
            const qb = new QueryBuilder(mockCollection);
            qb.where("score", ">", 100);
            expect((qb as any).params.where).toEqual({ score: "gt.100" });
        });

        it("maps >= to gte", () => {
            const qb = new QueryBuilder(mockCollection);
            qb.where("score", ">=", 50);
            expect((qb as any).params.where).toEqual({ score: "gte.50" });
        });

        it("maps < to lt", () => {
            const qb = new QueryBuilder(mockCollection);
            qb.where("score", "<", 10);
            expect((qb as any).params.where).toEqual({ score: "lt.10" });
        });

        it("maps <= to lte", () => {
            const qb = new QueryBuilder(mockCollection);
            qb.where("score", "<=", 0);
            expect((qb as any).params.where).toEqual({ score: "lte.0" });
        });

        it("maps array-contains to cs", () => {
            const qb = new QueryBuilder(mockCollection);
            qb.where("tags", "array-contains", "featured");
            expect((qb as any).params.where).toEqual({ tags: "cs.featured" });
        });

        it("maps array-contains-any to csa with array", () => {
            const qb = new QueryBuilder(mockCollection);
            qb.where("tags", "array-contains-any", ["a", "b"]);
            expect((qb as any).params.where).toEqual({ tags: "csa.(a,b)" });
        });

        it("maps not-in to nin with array", () => {
            const qb = new QueryBuilder(mockCollection);
            qb.where("status", "not-in", ["deleted", "archived"]);
            expect((qb as any).params.where).toEqual({ status: "nin.(deleted,archived)" });
        });

        it("passes through short operators (eq, neq, gt, gte, lt, lte) directly", () => {
            const qb = new QueryBuilder(mockCollection);
            qb.where("x", "gt", 5);
            expect((qb as any).params.where).toEqual({ x: "gt.5" });
        });

        it("passes through in operator for arrays", () => {
            const qb = new QueryBuilder(mockCollection);
            qb.where("status", "in", ["active", "pending"]);
            expect((qb as any).params.where).toEqual({ status: "in.(active,pending)" });
        });

        it("passes through cs and csa operators", () => {
            const qb = new QueryBuilder(mockCollection);
            qb.where("tags", "cs", "test");
            expect((qb as any).params.where).toEqual({ tags: "cs.test" });
        });
    });

    // -----------------------------------------------------------------------
    // Null / edge case values
    // -----------------------------------------------------------------------
    describe("Special values", () => {
        it("handles null values", () => {
            const qb = new QueryBuilder(mockCollection);
            qb.where("deletedAt", "==", null);
            expect((qb as any).params.where).toEqual({ deletedAt: "null" });
        });

        it("handles string values", () => {
            const qb = new QueryBuilder(mockCollection);
            qb.where("name", "==", "John");
            expect((qb as any).params.where).toEqual({ name: "John" });
        });

        it("handles boolean values", () => {
            const qb = new QueryBuilder(mockCollection);
            qb.where("active", "==", true);
            expect((qb as any).params.where).toEqual({ active: "true" });
        });

        it("handles empty string", () => {
            const qb = new QueryBuilder(mockCollection);
            qb.where("name", "==", "");
            expect((qb as any).params.where).toEqual({ name: "" });
        });

        it("handles zero", () => {
            const qb = new QueryBuilder(mockCollection);
            qb.where("count", "==", 0);
            expect((qb as any).params.where).toEqual({ count: "0" });
        });
    });

    // -----------------------------------------------------------------------
    // orderBy
    // -----------------------------------------------------------------------
    describe("orderBy", () => {
        it("sets default ascending order", () => {
            const qb = new QueryBuilder(mockCollection);
            qb.orderBy("createdAt");
            expect((qb as any).params.orderBy).toEqual("createdAt:asc");
        });

        it("sets descending order", () => {
            const qb = new QueryBuilder(mockCollection);
            qb.orderBy("createdAt", "desc");
            expect((qb as any).params.orderBy).toEqual("createdAt:desc");
        });

        it("allows overriding orderBy with a second call", () => {
            const qb = new QueryBuilder(mockCollection);
            qb.orderBy("name", "asc").orderBy("date", "desc");
            expect((qb as any).params.orderBy).toEqual("date:desc");
        });
    });

    // -----------------------------------------------------------------------
    // limit / offset
    // -----------------------------------------------------------------------
    describe("limit / offset", () => {
        it("sets limit correctly", () => {
            const qb = new QueryBuilder(mockCollection);
            qb.limit(10);
            expect((qb as any).params.limit).toEqual(10);
        });

        it("sets offset correctly", () => {
            const qb = new QueryBuilder(mockCollection);
            qb.offset(20);
            expect((qb as any).params.offset).toEqual(20);
        });

        it("allows overriding limit", () => {
            const qb = new QueryBuilder(mockCollection);
            qb.limit(10).limit(50);
            expect((qb as any).params.limit).toEqual(50);
        });
    });

    // -----------------------------------------------------------------------
    // search
    // -----------------------------------------------------------------------
    describe("search", () => {
        it("sets searchString correctly", () => {
            const qb = new QueryBuilder(mockCollection);
            qb.search("hello world");
            expect((qb as any).params.searchString).toEqual("hello world");
        });

        it("handles empty search string", () => {
            const qb = new QueryBuilder(mockCollection);
            qb.search("");
            expect((qb as any).params.searchString).toEqual("");
        });
    });

    // -----------------------------------------------------------------------
    // include
    // -----------------------------------------------------------------------
    describe("include", () => {
        it("sets relations correctly", () => {
            const qb = new QueryBuilder(mockCollection);
            qb.include("tags", "author");
            expect((qb as any).params.include).toEqual(["tags", "author"]);
        });

        it("sets wildcard include", () => {
            const qb = new QueryBuilder(mockCollection);
            qb.include("*");
            expect((qb as any).params.include).toEqual(["*"]);
        });

        it("overrides previous include", () => {
            const qb = new QueryBuilder(mockCollection);
            qb.include("tags").include("author");
            expect((qb as any).params.include).toEqual(["author"]);
        });
    });

    // -----------------------------------------------------------------------
    // Chaining
    // -----------------------------------------------------------------------
    describe("Method chaining", () => {
        it("supports full chain: where → orderBy → limit → offset → search → include", () => {
            const qb = new QueryBuilder(mockCollection);
            const result = qb
                .where("age", ">=", 18)
                .where("status", "==", "active")
                .orderBy("name", "asc")
                .limit(25)
                .offset(50)
                .search("keyword")
                .include("profile");

            const params = (result as any).params;
            expect(params.where).toEqual({
                age: "gte.18",
                status: "active"
            });
            expect(params.orderBy).toBe("name:asc");
            expect(params.limit).toBe(25);
            expect(params.offset).toBe(50);
            expect(params.searchString).toBe("keyword");
            expect(params.include).toEqual(["profile"]);
        });

        it("all methods return 'this' for chaining", () => {
            const qb = new QueryBuilder(mockCollection);
            expect(qb.where("a", "==", 1)).toBe(qb);
            expect(qb.orderBy("a")).toBe(qb);
            expect(qb.limit(1)).toBe(qb);
            expect(qb.offset(1)).toBe(qb);
            expect(qb.search("x")).toBe(qb);
            expect(qb.include("r")).toBe(qb);
        });

        it("supports multiple where conditions", () => {
            const qb = new QueryBuilder(mockCollection);
            qb.where("a", "==", 1).where("b", ">", 2).where("c", "in", ["x", "y"]);
            expect((qb as any).params.where).toEqual({
                a: "1",
                b: "gt.2",
                c: "in.(x,y)"
            });
        });
    });

    // -----------------------------------------------------------------------
    // find execution
    // -----------------------------------------------------------------------
    describe("find execution", () => {
        it("calls find on collection with built params", async () => {
            const qb = new QueryBuilder(mockCollection);
            qb.where("age", "==", 18).limit(10).offset(5);

            (mockCollection.find as jest.Mock).mockResolvedValueOnce({ data: [], meta: {} });
            await qb.find();

            expect(mockCollection.find).toHaveBeenCalledWith({
                where: { age: "18" },
                limit: 10,
                offset: 5
            });
        });

        it("passes include to find", async () => {
            const qb = new QueryBuilder(mockCollection);
            qb.include("tags", "author").limit(5);

            (mockCollection.find as jest.Mock).mockResolvedValueOnce({ data: [], meta: {} });
            await qb.find();

            expect(mockCollection.find).toHaveBeenCalledWith(
                expect.objectContaining({
                    include: ["tags", "author"],
                    limit: 5,
                })
            );
        });

        it("passes search to find", async () => {
            const qb = new QueryBuilder(mockCollection);
            qb.search("test query");

            (mockCollection.find as jest.Mock).mockResolvedValueOnce({ data: [], meta: {} });
            await qb.find();

            expect(mockCollection.find).toHaveBeenCalledWith(
                expect.objectContaining({
                    searchString: "test query",
                })
            );
        });
    });

    // -----------------------------------------------------------------------
    // listen execution
    // -----------------------------------------------------------------------
    describe("listen execution", () => {
        it("throws error if listen is not available on collection", () => {
            const col = createMockCollection();
            (col as any).listen = undefined;
            const qb = new QueryBuilder(col);
            expect(() => qb.listen(jest.fn())).toThrow("Listen is only available when RebaseClient is configured with a websocketUrl.");
        });

        it("calls listen on collection with built params", () => {
            const qb = new QueryBuilder(mockCollection);
            qb.where("age", "==", 18);

            const removeListener = jest.fn();
            (mockCollection.listen as jest.Mock).mockReturnValue(removeListener);

            const cb = jest.fn();
            const res = qb.listen(cb);

            expect(mockCollection.listen).toHaveBeenCalledWith(
                { where: { age: "18" } },
                cb,
                undefined
            );
            expect(res).toBe(removeListener);
        });

        it("passes error callback to listen", () => {
            const qb = new QueryBuilder(mockCollection);
            const cb = jest.fn();
            const errCb = jest.fn();

            (mockCollection.listen as jest.Mock).mockReturnValue(jest.fn());
            qb.listen(cb, errCb);

            expect(mockCollection.listen).toHaveBeenCalledWith(
                expect.any(Object),
                cb,
                errCb
            );
        });

        it("returns unsubscribe function from listen", () => {
            const unsubFn = jest.fn();
            (mockCollection.listen as jest.Mock).mockReturnValue(unsubFn);

            const qb = new QueryBuilder(mockCollection);
            const result = qb.listen(jest.fn());
            expect(result).toBe(unsubFn);
        });
    });
});
