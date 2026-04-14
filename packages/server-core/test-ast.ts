import { AstSchemaEditor } from "./src/api/ast-schema-editor";
import * as fs from "fs";

const collectionsDir = __dirname + "/collections-test";
fs.mkdirSync(collectionsDir, { recursive: true });
fs.writeFileSync(collectionsDir + "/users.ts", `
export default {
    name: "Users",
    slug: "users",
    properties: {},
    securityRules: [
        { name: "test", operation: "read", mode: "permissive", roles: ["public"] }
    ]
};
`);

async function main() {
  const editor = new AstSchemaEditor(collectionsDir);
  await editor.saveCollection("users", {
    name: "Users",
    slug: "users",
    properties: {},
    securityRules: []
  });
  console.log("AFTER SAVE:", fs.readFileSync(collectionsDir + "/users.ts", "utf8"));
}

main().catch(console.error);
