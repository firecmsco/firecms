import { AstSchemaEditor } from "./packages/backend/src/api/ast-schema-editor";
import * as fs from "fs";

async function main() {
    fs.mkdirSync("/tmp/ast-test/collections", { recursive: true });
    fs.writeFileSync("/tmp/ast-test/collections/users.ts", `
export default {
    name: "Users",
    slug: "users",
    properties: {},
    securityRules: [
        { name: "test", operation: "read" }
    ]
};
`);
    const editor = new AstSchemaEditor("/tmp/ast-test/collections");
    await editor.saveCollection("users", {
        name: "Users",
        slug: "users",
        properties: {},
        securityRules: []
    });
    
    console.log("AFTER:\n" + fs.readFileSync("/tmp/ast-test/collections/users.ts", "utf8"));
}
main().catch(console.error);
