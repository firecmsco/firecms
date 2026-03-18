
import { describe, it, expect } from "vitest";
import { determineTableAndPK, extractTablesFromQuery, resolveQueryCollections } from "./sql_utils";
import { TableInfo } from "../components/SQLEditor/SQLEditor";
import { EntityCollection } from "@rebasepro/types";

const mockSchemas: Record<string, TableInfo[]> = {
    "public": [
        {
            schemaName: "public",
            tableName: "users",
            columns: [
                { name: "id", dataType: "integer", isPrimaryKey: true },
                { name: "email", dataType: "text", isPrimaryKey: false },
                { name: "created_at", dataType: "timestamp", isPrimaryKey: false }
            ]
        },
        {
            schemaName: "public",
            tableName: "roles",
            columns: [
                { name: "id", dataType: "integer", isPrimaryKey: true },
                { name: "role_name", dataType: "text", isPrimaryKey: false },
                { name: "created_at", dataType: "timestamp", isPrimaryKey: false }
            ]
        },
        {
            schemaName: "public",
            tableName: "settings", // No primary key
            columns: [
                { name: "key", dataType: "text", isPrimaryKey: false },
                { name: "value", dataType: "text", isPrimaryKey: false }
            ]
        },
        {
            schemaName: "public",
            tableName: "blog_posts",
            columns: [
                { name: "id", dataType: "integer", isPrimaryKey: true },
                { name: "title", dataType: "text", isPrimaryKey: false },
                { name: "author_id", dataType: "integer", isPrimaryKey: false }
            ]
        },
        {
            schemaName: "public",
            tableName: "order_items", // Composite PK
            columns: [
                { name: "order_id", dataType: "integer", isPrimaryKey: true },
                { name: "item_id", dataType: "integer", isPrimaryKey: true },
                { name: "quantity", dataType: "integer", isPrimaryKey: false }
            ]
        }
    ]
};

const mockCollections: EntityCollection[] = [
    {
        slug: "users",
        name: "Users",
        dbPath: "users",
        properties: {}
    } as EntityCollection,
    {
        slug: "roles",
        name: "Roles",
        dbPath: "roles",
        properties: {}
    } as EntityCollection,
    {
        slug: "blogPosts",
        name: "Blog Posts",
        dbPath: "blog_posts",
        properties: {}
    } as EntityCollection,
    {
        slug: "blog-entries",   // slug with hyphen, no dbPath → falls back to snake_case "blog_entries"
        name: "Blog Entries",
        dbPath: "",
        properties: {}
    } as EntityCollection,
];

describe("determineTableAndPK", () => {
    it("resolves basic SELECT with actual PK from schema", () => {
        const sql = "SELECT * FROM users";
        const result = determineTableAndPK(sql, "email", mockSchemas);
        expect(result.tableName).toBe("users");
        expect(result.primaryKeys).toEqual([{ dbColumn: "id", resultColumn: "id" }]);
    });

    it("resolves aliased FROM", () => {
        const sql = "SELECT u.email FROM users u";
        const result = determineTableAndPK(sql, "email", mockSchemas);
        expect(result.tableName).toBe("users");
        expect(result.primaryKeys).toEqual([{ dbColumn: "id", resultColumn: "id" }]);
    });

    it("resolves simple unambiguous JOIN", () => {
        const sql = "SELECT * FROM users u JOIN roles r ON u.role_id = r.id";
        const result = determineTableAndPK(sql, "email", mockSchemas);
        expect(result.tableName).toBe("users");
        expect(result.primaryKeys).toEqual([{ dbColumn: "id", resultColumn: "id" }]);

        const result2 = determineTableAndPK(sql, "role_name", mockSchemas);
        expect(result2.tableName).toBe("roles");
        expect(result2.primaryKeys).toEqual([{ dbColumn: "id", resultColumn: "id" }]);
    });

    it("resolves aliased PK columns in JOINs", () => {
        const sql = "SELECT u.id AS user_id, u.email, r.id AS role_id, r.role_name FROM users u JOIN roles r ON u.role_id = r.id";
        const result = determineTableAndPK(sql, "email", mockSchemas);
        expect(result.tableName).toBe("users");
        expect(result.primaryKeys).toEqual([{ dbColumn: "id", resultColumn: "user_id" }]);

        const result2 = determineTableAndPK(sql, "role_name", mockSchemas);
        expect(result2.tableName).toBe("roles");
        expect(result2.primaryKeys).toEqual([{ dbColumn: "id", resultColumn: "role_id" }]);
    });

    it("resolves aliased edit columns back to DB names", () => {
        const sql = "SELECT u.email AS user_email FROM users u";
        const result = determineTableAndPK(sql, "user_email", mockSchemas);
        expect(result.tableName).toBe("users");
    });

    it("returns error for ambiguous JOIN columns", () => {
        const sql = "SELECT * FROM users u JOIN roles r ON u.role_id = r.id";
        // Both tables have created_at
        const result = determineTableAndPK(sql, "created_at", mockSchemas);
        expect(result.error).toContain("Ambiguous column");
    });

    it("returns error for unsupported non-SELECT queries", () => {
        const sql = "DELETE FROM users WHERE id = 1";
        const result = determineTableAndPK(sql, "email", mockSchemas);
        expect(result.error).toContain("only supported for SELECT");
    });

    it("returns error for tables without primary keys", () => {
        const sql = "SELECT * FROM settings";
        const result = determineTableAndPK(sql, "key", mockSchemas);
        expect(result.error).toContain("has no primary key defined");
    });

    it("supports composite primary keys", () => {
        const sql = "SELECT * FROM order_items";
        const result = determineTableAndPK(sql, "quantity", mockSchemas);
        expect(result.tableName).toBe("order_items");
        expect(result.primaryKeys).toHaveLength(2);
        expect(result.primaryKeys).toEqual([
            { dbColumn: "order_id", resultColumn: "order_id" },
            { dbColumn: "item_id", resultColumn: "item_id" }
        ]);
    });
});

describe("extractTablesFromQuery", () => {
    it("extracts a single table", () => {
        const tables = extractTablesFromQuery("SELECT * FROM users");
        expect(tables).toEqual([{ name: "users", alias: undefined }]);
    });

    it("extracts aliased tables", () => {
        const tables = extractTablesFromQuery("SELECT u.email FROM users u");
        expect(tables).toEqual([{ name: "users", alias: "u" }]);
    });

    it("extracts multiple tables from JOINs", () => {
        const tables = extractTablesFromQuery("SELECT * FROM users u JOIN roles r ON u.role_id = r.id");
        expect(tables).toHaveLength(2);
        expect(tables[0].name).toBe("users");
        expect(tables[1].name).toBe("roles");
    });

    it("returns empty for non-SELECT queries", () => {
        expect(extractTablesFromQuery("DELETE FROM users")).toEqual([]);
        expect(extractTablesFromQuery("INSERT INTO users (id) VALUES (1)")).toEqual([]);
    });

    it("returns empty for invalid SQL", () => {
        expect(extractTablesFromQuery("NOT VALID SQL AT ALL ???")).toEqual([]);
    });
});

describe("resolveQueryCollections", () => {
    it("matches a single CMS collection", () => {
        const result = resolveQueryCollections("SELECT * FROM users", mockSchemas, mockCollections);
        expect(result).toHaveLength(1);
        expect(result[0].tableName).toBe("users");
        expect(result[0].collection.name).toBe("Users");
        expect(result[0].columns).toContain("id");
        expect(result[0].columns).toContain("email");
    });

    it("matches multiple CMS collections in a JOIN", () => {
        const result = resolveQueryCollections(
            "SELECT * FROM users u JOIN roles r ON u.role_id = r.id",
            mockSchemas,
            mockCollections
        );
        expect(result).toHaveLength(2);
        expect(result.map(r => r.collection.name).sort()).toEqual(["Roles", "Users"]);
    });

    it("returns empty when no tables match any collection", () => {
        const result = resolveQueryCollections("SELECT * FROM settings", mockSchemas, mockCollections);
        expect(result).toHaveLength(0);
    });

    it("matches collection by dbPath (not slug)", () => {
        const result = resolveQueryCollections("SELECT * FROM blog_posts", mockSchemas, mockCollections);
        expect(result).toHaveLength(1);
        expect(result[0].collection.slug).toBe("blogPosts");
    });

    it("returns empty for non-SELECT queries", () => {
        const result = resolveQueryCollections("DELETE FROM users WHERE id = 1", mockSchemas, mockCollections);
        expect(result).toHaveLength(0);
    });

    it("preserves table alias information", () => {
        const result = resolveQueryCollections("SELECT u.* FROM users u", mockSchemas, mockCollections);
        expect(result).toHaveLength(1);
        expect(result[0].tableAlias).toBe("u");
    });
});

