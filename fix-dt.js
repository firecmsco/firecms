import fs from "fs";
import path from "path";

const file = path.resolve(process.cwd(), "packages/postgresql-backend/src/data-transformer.ts");
let content = fs.readFileSync(file, "utf8");

content = content.replace(/"\.\.\/collections\/PostgresCollectionRegistry"/g, '"./collections/PostgresCollectionRegistry"');
content = content.replace(/"\.\.\/utils\/drizzle-conditions"/g, '"./utils/drizzle-conditions"');
content = content.replace(/resolveCollectionRelations\(collection\)/g, 'resolveCollectionRelations(collection as import("@rebasepro/types").PostgresCollection<any, any>)');
content = content.replace(/collection\.relations\?/g, '(collection as import("@rebasepro/types").PostgresCollection<any, any>).relations?');

fs.writeFileSync(file, content);
