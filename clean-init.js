import fs from "fs";
import path from "path";

const target = path.resolve(process.cwd(), "packages/backend/src/init.ts");
let content = fs.readFileSync(target, "utf8");

// Remove drizzle & postgres imports
content = content.replace(/import \{ PgEnum, PgTable \} from "drizzle-orm\/pg-core";\n/, "");
content = content.replace(/import { getTableName, isTable, Relations, sql } from "drizzle-orm";\n/, "");
content = content.replace(/import { NodePgDatabase } from "drizzle-orm\/node-postgres";\n/, "");
content = content.replace(/import { PostgresDataDriver } from "\.\/services\/postgresDataDriver";\n/, "");
content = content.replace(/import { DatabasePoolManager } from "\.\/services\/databasePoolManager";\n/, "");

// Replace PostgresDriverConfig definition
content = content.replace(/export interface PostgresDriverConfig \{[\s\S]*?\}\n\n/, "");

// Change DriverConfig
content = content.replace(/export type DriverConfig = DataDriver \| PostgresDriverConfig;/, "export type DriverConfig = DataDriver | Record<string, any>;");

// We keep RealtimeService, BackendCollectionRegistry imports for now if used elsewhere.

// We need to rewrite _initializeRebaseBackend to use bootstrappers
// Instead of complex AST, let's just create a new init.ts entirely since we know what it needs to do.
