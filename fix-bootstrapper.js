import fs from "fs";
import path from "path";

const target = path.resolve(process.cwd(), "packages/postgresql-backend/src/PostgresBootstrapper.ts");

let content = fs.readFileSync(target, "utf8");

content = content.replace(/from "\.\.\/services/g, 'from "./services');
content = content.replace(/from "\.\.\/collections\/BackendCollectionRegistry"/g, 'from "./collections/PostgresCollectionRegistry"');
content = content.replace(/new BackendCollectionRegistry\(\)/g, "new PostgresCollectionRegistry()");
content = content.replace(/BackendCollectionRegistry/g, "PostgresCollectionRegistry");
content = content.replace(/from "\.\.\/auth"/g, 'from "@rebasepro/backend"');
content = content.replace(/from "\.\.\/email"/g, 'from "@rebasepro/backend"');
content = content.replace(/from "\.\.\/history"/g, 'from "@rebasepro/backend"');
content = content.replace(/from "\.\.\/init"/g, 'from "@rebasepro/backend"');
content = content.replace(/from "\.\.\/api\/types"/g, 'from "@rebasepro/backend"');

fs.writeFileSync(target, content);
