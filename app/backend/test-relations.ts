import { extractTablesRelationalConfig } from "drizzle-orm/relations";
import { tables, relations as schemaRelations } from "./src/schema.generated.js";
const schema = { ...tables, ...schemaRelations };
const { tables: tablesConfig, tableNamesMap } = extractTablesRelationalConfig(schema, (helpers) => helpers);

console.log("posts relations:");
console.log(Object.keys(tablesConfig["posts"].relations));

console.log("postsTags relations:");
console.log(Object.keys(tablesConfig["postsTags"].relations));

console.log("postsTagsRelations:", schemaRelations.postsTagsRelations);
