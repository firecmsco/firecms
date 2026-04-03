import { AstSchemaEditor } from "./packages/backend/src/api/ast-schema-editor";

async function main() {
  const collectionsDir = "./packages/backend/test/e2e/__fixtures__/collections";
  const editor = new AstSchemaEditor(collectionsDir);
  const collectionId = "users";

  // check what the source looks like initially
  const fs = require('fs');
  console.log("Initial file:", fs.readFileSync(collectionsDir + "/users.ts", "utf8"));

  // attempt to save with an empty securityRules array
  await editor.saveCollection(collectionId, {
    name: "Users",
    slug: "users",
    properties: {},
    securityRules: [] // this is an empty array
  });

  // check what the source looks like AFTER
  console.log("After file:", fs.readFileSync(collectionsDir + "/users.ts", "utf8"));
}

main().catch(console.error);
