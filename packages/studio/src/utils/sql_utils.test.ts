
import { determineTableAndPK } from "./sql_utils";
import { TableInfo } from "../components/SQLEditor/SQLEditor";

const mockSchemas: Record<string, TableInfo[]> = {
    "public": [
        {
            schemaName: "public",
            tableName: "users",
            columns: [
                { name: "id", dataType: "integer" },
                { name: "email", dataType: "text" },
                { name: "created_at", dataType: "timestamp" }
            ]
        },
        {
            schemaName: "public",
            tableName: "roles",
            columns: [
                { name: "id", dataType: "integer" },
                { name: "role_name", dataType: "text" },
                { name: "created_at", dataType: "timestamp" }
            ]
        },
        {
            schemaName: "public",
            tableName: "settings", // No 'id' column
            columns: [
                { name: "key", dataType: "text" },
                { name: "value", dataType: "text" }
            ]
        }
    ]
};

describe("determineTableAndPK", () => {
    it("resolves basic SELECT", () => {
        const sql = "SELECT * FROM users";
        const result = determineTableAndPK(sql, "email", mockSchemas);
        expect(result).toEqual({ tableName: "users", primaryKey: "id" });
    });

    it("resolves aliased FROM", () => {
        const sql = "SELECT u.email FROM users u";
        const result = determineTableAndPK(sql, "email", mockSchemas);
        expect(result).toEqual({ tableName: "users", primaryKey: "id" });
    });

    it("resolves simple unambiguous JOIN", () => {
        const sql = "SELECT * FROM users u JOIN roles r ON u.role_id = r.id";
        const result = determineTableAndPK(sql, "email", mockSchemas);
        expect(result).toEqual({ tableName: "users", primaryKey: "id" });

        const result2 = determineTableAndPK(sql, "role_name", mockSchemas);
        expect(result2).toEqual({ tableName: "roles", primaryKey: "id" });
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
        expect(result.error).toContain('does not have an "id" column');
    });
});
