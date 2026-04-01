import { describe, it, expect } from "@jest/globals";
import { toPascalCase, toCamelCase, toSafeIdentifier, indent } from "../src/utils";
import { generateTypedefs } from "../src/generate-types";
import { generateSDK } from "../src/index";
import { EntityCollection } from "@rebasepro/types";

// ─── Test Fixtures ─────────────────────────────────────────────────

const authorsCollection = {
    name: "Authors",
    singularName: "Author",
    slug: "authors",
    dbPath: "authors",
    properties: {
        id: { name: "ID", type: "number", isId: "increment", validation: { required: true } },
        name: { name: "Name", type: "string", validation: { required: true } },
        email: { name: "Email", type: "string" },
    },
} as unknown as EntityCollection;

describe("Utils", () => {
    describe("toPascalCase", () => {
        it("converts snake_case to PascalCase", () => {
            expect(toPascalCase("private_notes")).toBe("PrivateNotes");
        });
        it("handles already PascalCase input", () => {
            expect(toPascalCase("TestEntities")).toBe("Testentities");
        });
    });

    describe("toCamelCase", () => {
        it("converts snake_case to camelCase", () => {
            expect(toCamelCase("private_notes")).toBe("privateNotes");
        });
    });

    describe("toSafeIdentifier", () => {
        it("converts slugs to camelCase", () => {
            expect(toSafeIdentifier("private-notes")).toBe("privateNotes");
        });
    });
});

describe("generateTypedefs", () => {
    it("generates a typescript interface for a collection", () => {
        const ts = generateTypedefs([authorsCollection]);
        
        expect(ts).toContain("export interface Database {");
        expect(ts).toContain("authors: {");
        
        // Row Type
        expect(ts).toContain("Row: {");
        expect(ts).toContain("id: number;");
        expect(ts).toContain("name: string;");
        expect(ts).toContain("email?: string;");
        
        // Insert Type
        expect(ts).toContain("Insert: {");
        expect(ts).toContain("id?: number;");
        expect(ts).toContain("name: string;");
        expect(ts).toContain("email?: string;");

        // Update Type
        expect(ts).toContain("Update: {");
        expect(ts).toContain("id?: number;");
        expect(ts).toContain("name?: string;");
        expect(ts).toContain("email?: string;");
    });
});

describe("generateSDK", () => {
    it("returns an array of generated files including database.types.ts and README.md", () => {
        const files = generateSDK([authorsCollection]);
        expect(files.length).toBe(2);
        expect(files[0].path).toBe("database.types.ts");
        expect(files[1].path).toBe("README.md");
    });
});
