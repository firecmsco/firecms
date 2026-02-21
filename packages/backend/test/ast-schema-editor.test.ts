import { AstSchemaEditor } from "../src/api/ast-schema-editor";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

describe("AstSchemaEditor", () => {
    let testDir: string;
    let editor: AstSchemaEditor;

    beforeEach(() => {
        testDir = fs.mkdtempSync(path.join(os.tmpdir(), "ast-schema-editor-test-"));
        editor = new AstSchemaEditor(testDir);
    });

    afterEach(() => {
        fs.rmSync(testDir, { recursive: true, force: true });
    });

    it("should merge properties while preserving existing functions when saving a collection", async () => {
        // Setup initial file
        const fileContent = `import { EntityCollection } from "@firecms/types";

const productsCollection: EntityCollection = {
    name: "Products",
    slug: "products",
    properties: {
        id: { type: "string" },
        name: { type: "string" },
        category: {
            type: "reference",
            target: () => categoriesCollection
        }
    }
};

export default productsCollection;
`;
        fs.writeFileSync(path.join(testDir, "products.ts"), fileContent);

        // We want to update the collection data, simulating what the frontend sends
        const updatedData = {
            name: "Updated Products",
            slug: "products",
            properties: {
                id: { type: "string" },
                name: { type: "string", description: "Product name" },
                category: {
                    type: "reference"
                    // Notice target is dropped since the frontend REST payload wouldn't have it serialized
                }
            }
        };

        await editor.saveCollection("products", updatedData);

        const newContent = fs.readFileSync(path.join(testDir, "products.ts"), "utf-8");
        expect(newContent).toContain('name: "Updated Products"');
        expect(newContent).toContain('target: () => categoriesCollection');
        expect(newContent).toContain('description: "Product name"');
    });
});
