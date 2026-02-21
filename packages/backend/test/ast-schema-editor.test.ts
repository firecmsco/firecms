import { AstSchemaEditor } from "../src/api/ast-schema-editor";
import * as fs from "fs";
import * as path from "path";

const TMP_DIR = path.join(__dirname, "tmp_collections");

describe("AstSchemaEditor", () => {
    let editor: AstSchemaEditor;

    beforeEach(() => {
        if (!fs.existsSync(TMP_DIR)) {
            fs.mkdirSync(TMP_DIR, { recursive: true });
        }

        fs.writeFileSync(path.join(TMP_DIR, "basic.ts"), `import { EntityCollection } from "@firecms/types";

export const basicCollection: EntityCollection = {
    name: "Basic",
    id: "basic",
    properties: {
        name: {
            type: "string",
            name: "Name"
        }
    }
};

export default basicCollection;
`);

        editor = new AstSchemaEditor(TMP_DIR);
    });

    afterEach(() => {
        if (fs.existsSync(TMP_DIR)) {
            fs.rmSync(TMP_DIR, { recursive: true, force: true });
        }
    });

    test("saveProperty adds a new property", async () => {
        await editor.saveProperty("basic", "age", {
            type: "number",
            name: "Age"
        });

        const content = fs.readFileSync(path.join(TMP_DIR, "basic.ts"), "utf-8");
        expect(content).toContain("age:");
        expect(content).toContain('type: "number"');
        expect(content).toContain('name: "Age"');
    });

    test("saveProperty updates an existing property", async () => {
        await editor.saveProperty("basic", "name", {
            type: "string",
            name: "Full Name"
        });

        const content = fs.readFileSync(path.join(TMP_DIR, "basic.ts"), "utf-8");
        expect(content).toContain('name: "Full Name"');
        expect(content).not.toContain('name: "Name"');
    });

    test("deleteProperty removes an existing property", async () => {
        await editor.deleteProperty("basic", "name");

        const content = fs.readFileSync(path.join(TMP_DIR, "basic.ts"), "utf-8");
        expect(content).not.toContain("name: {");
        expect(content).toContain("properties: {");
    });

    test("saveCollection creates a new file if not exists", async () => {
        await editor.saveCollection("new_col", {
            name: "New Collection",
            id: "new_col",
            properties: {}
        });

        expect(fs.existsSync(path.join(TMP_DIR, "new_col.ts"))).toBe(true);
        const content = fs.readFileSync(path.join(TMP_DIR, "new_col.ts"), "utf-8");
        expect(content).toContain('name: "New Collection"');
        expect(content).toContain("export default new_colCollection;");
    });

    test("saveCollection updates root attributes gracefully", async () => {
        await editor.saveCollection("basic", {
            name: "Super Basic",
            icon: "star"
        });

        const content = fs.readFileSync(path.join(TMP_DIR, "basic.ts"), "utf-8");
        expect(content).toContain('name: "Super Basic"');
        expect(content).toContain('icon: "star"');
        // Properties should remain untouched
        expect(content).toContain("name:");
    });
});
