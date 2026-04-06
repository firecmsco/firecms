import { mapOperator, parseQueryOptions } from "../src/api/rest/query-parser";

// ─────────────────────────────────────────────────────────────
// mapOperator
// ─────────────────────────────────────────────────────────────
describe("mapOperator", () => {
    it("maps PostgREST operators to Rebase operators", () => {
        expect(mapOperator("eq")).toBe("==");
        expect(mapOperator("neq")).toBe("!=");
        expect(mapOperator("gt")).toBe(">");
        expect(mapOperator("gte")).toBe(">=");
        expect(mapOperator("lt")).toBe("<");
        expect(mapOperator("lte")).toBe("<=");
        expect(mapOperator("in")).toBe("in");
        expect(mapOperator("nin")).toBe("not-in");
        expect(mapOperator("cs")).toBe("array-contains");
        expect(mapOperator("csa")).toBe("array-contains-any");
    });

    it("returns null for unknown operators", () => {
        expect(mapOperator("like")).toBeNull();
        expect(mapOperator("between")).toBeNull();
        expect(mapOperator("")).toBeNull();
    });
});

// ─────────────────────────────────────────────────────────────
// parseQueryOptions — Pagination
// ─────────────────────────────────────────────────────────────
describe("parseQueryOptions — pagination", () => {
    it("parses limit", () => {
        const result = parseQueryOptions({ limit: "25" });
        expect(result.limit).toBe(25);
    });

    it("parses offset", () => {
        const result = parseQueryOptions({ offset: "50" });
        expect(result.offset).toBe(50);
    });

    it("calculates offset from page number", () => {
        const result = parseQueryOptions({ page: "3", limit: "10" });
        expect(result.offset).toBe(20); // (3-1) * 10
    });

    it("uses default limit of 20 for page calculation when limit not set", () => {
        const result = parseQueryOptions({ page: "2" });
        expect(result.offset).toBe(20); // (2-1) * 20
    });

    it("handles no pagination params", () => {
        const result = parseQueryOptions({});
        expect(result.limit).toBeUndefined();
        expect(result.offset).toBeUndefined();
    });
});

// ─────────────────────────────────────────────────────────────
// parseQueryOptions — PostgREST Filters
// ─────────────────────────────────────────────────────────────
describe("parseQueryOptions — PostgREST filters", () => {
    it("parses equality filter (implicit eq)", () => {
        const result = parseQueryOptions({ status: "published" });
        expect(result.where?.status).toEqual(["==", "published"]);
    });

    it("parses eq operator explicitly", () => {
        const result = parseQueryOptions({ status: "eq.published" });
        expect(result.where?.status).toEqual(["==", "published"]);
    });

    it("parses gt with number coercion", () => {
        const result = parseQueryOptions({ age: "gt.18" });
        expect(result.where?.age).toEqual([">", 18]);
    });

    it("parses gte operator", () => {
        const result = parseQueryOptions({ price: "gte.9.99" });
        expect(result.where?.price).toEqual([">=", 9.99]);
    });

    it("parses lt operator", () => {
        const result = parseQueryOptions({ count: "lt.100" });
        expect(result.where?.count).toEqual(["<", 100]);
    });

    it("parses lte operator", () => {
        const result = parseQueryOptions({ rating: "lte.5" });
        expect(result.where?.rating).toEqual(["<=", 5]);
    });

    it("parses neq operator", () => {
        const result = parseQueryOptions({ status: "neq.draft" });
        expect(result.where?.status).toEqual(["!=", "draft"]);
    });

    it("parses boolean true", () => {
        const result = parseQueryOptions({ active: "true" });
        expect(result.where?.active).toEqual(["==", true]);
    });

    it("parses boolean false", () => {
        const result = parseQueryOptions({ active: "false" });
        expect(result.where?.active).toEqual(["==", false]);
    });

    it("parses null", () => {
        const result = parseQueryOptions({ deleted_at: "null" });
        expect(result.where?.deleted_at).toEqual(["==", null]);
    });

    it("parses numeric strings as numbers", () => {
        const result = parseQueryOptions({ quantity: "42" });
        expect(result.where?.quantity).toEqual(["==", 42]);
    });

    it("parses in operator with array", () => {
        const result = parseQueryOptions({ role: "in.(admin,editor,viewer)" });
        expect(result.where?.role).toEqual(["in", ["admin", "editor", "viewer"]]);
    });

    it("parses in operator with numeric array", () => {
        const result = parseQueryOptions({ priority: "in.(1,2,3)" });
        expect(result.where?.priority).toEqual(["in", [1, 2, 3]]);
    });

    it("parses array-contains operator", () => {
        const result = parseQueryOptions({ tags: "cs.javascript" });
        expect(result.where?.tags).toEqual(["array-contains", "javascript"]);
    });

    it("skips reserved query keys", () => {
        const result = parseQueryOptions({
            limit: "10",
            offset: "0",
            orderBy: "name:asc",
            status: "eq.active",
        });
        // Only status should be in where
        expect(result.where?.status).toEqual(["==", "active"]);
        expect(result.where?.limit).toBeUndefined();
        expect(result.where?.offset).toBeUndefined();
        expect(result.where?.orderBy).toBeUndefined();
    });

    it("handles string values with dots that are not operators (fallback to eq)", () => {
        const result = parseQueryOptions({ email: "user@example.com" });
        // "user@example" is not a valid operator, so fallback to eq
        expect(result.where?.email).toBeDefined();
    });

    it("removes empty where object", () => {
        const result = parseQueryOptions({ limit: "10" });
        expect(result.where).toBeUndefined();
    });
});

// ─────────────────────────────────────────────────────────────
// parseQueryOptions — Legacy JSON where
// ─────────────────────────────────────────────────────────────
describe("parseQueryOptions — legacy JSON where", () => {
    it("parses JSON where string", () => {
        const result = parseQueryOptions({
            where: JSON.stringify({ status: ["==", "published"] }),
        });
        expect(result.where?.status).toEqual(["==", "published"]);
    });

    it("accepts object where directly", () => {
        const result = parseQueryOptions({
            where: { status: ["==", "draft"] },
        });
        expect(result.where?.status).toEqual(["==", "draft"]);
    });

    it("throws for malformed JSON where", () => {
        expect(() => parseQueryOptions({ where: "not valid json{" })).toThrow("Invalid 'where' filter");
    });

    it("throws for array where", () => {
        expect(() => parseQueryOptions({ where: JSON.stringify([1, 2]) })).toThrow("Filter must be a JSON object");
    });

    it("throws for null where", () => {
        expect(() => parseQueryOptions({ where: JSON.stringify(null) })).toThrow("Filter must be a JSON object");
    });
});

// ─────────────────────────────────────────────────────────────
// parseQueryOptions — Sorting
// ─────────────────────────────────────────────────────────────
describe("parseQueryOptions — sorting", () => {
    it("parses JSON orderBy", () => {
        const orderBy = JSON.stringify([{ field: "name", direction: "asc" }]);
        const result = parseQueryOptions({ orderBy });
        expect(result.orderBy).toEqual([{ field: "name", direction: "asc" }]);
    });

    it("parses simple field:direction format", () => {
        const result = parseQueryOptions({ orderBy: "created_at:desc" });
        expect(result.orderBy).toEqual([{ field: "created_at", direction: "desc" }]);
    });

    it("defaults direction to asc", () => {
        const result = parseQueryOptions({ orderBy: "name" });
        expect(result.orderBy).toEqual([{ field: "name", direction: "asc" }]);
    });

    it("handles no orderBy", () => {
        const result = parseQueryOptions({});
        expect(result.orderBy).toBeUndefined();
    });
});

// ─────────────────────────────────────────────────────────────
// parseQueryOptions — Relation includes
// ─────────────────────────────────────────────────────────────
describe("parseQueryOptions — includes", () => {
    it("parses wildcard include", () => {
        const result = parseQueryOptions({ include: "*" });
        expect(result.include).toEqual(["*"]);
    });

    it("parses comma-separated includes", () => {
        const result = parseQueryOptions({ include: "author,tags,category" });
        expect(result.include).toEqual(["author", "tags", "category"]);
    });

    it("trims whitespace in includes", () => {
        const result = parseQueryOptions({ include: " author , tags " });
        expect(result.include).toEqual(["author", "tags"]);
    });

    it("handles no include", () => {
        const result = parseQueryOptions({});
        expect(result.include).toBeUndefined();
    });
});

// ─────────────────────────────────────────────────────────────
// parseQueryOptions — Field selection
// ─────────────────────────────────────────────────────────────
describe("parseQueryOptions — fields", () => {
    it("parses comma-separated fields", () => {
        const result = parseQueryOptions({ fields: "id,name,email" });
        expect(result.fields).toEqual(["id", "name", "email"]);
    });

    it("trims whitespace", () => {
        const result = parseQueryOptions({ fields: " id , name " });
        expect(result.fields).toEqual(["id", "name"]);
    });

    it("handles no fields", () => {
        const result = parseQueryOptions({});
        expect(result.fields).toBeUndefined();
    });
});
