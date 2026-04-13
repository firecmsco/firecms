import fs from "fs";
import path from "path";

const dir = path.resolve(process.cwd(), "packages/postgresql-backend/src");

function replaceInFile(filePath, replacements) {
    const fullPath = path.join(dir, filePath);
    if (!fs.existsSync(fullPath)) return;
    let content = fs.readFileSync(fullPath, "utf8");
    for (const [regex, replacement] of replacements) {
        content = content.replace(regex, replacement);
    }
    fs.writeFileSync(fullPath, content);
}

replaceInFile("collections/PostgresCollectionRegistry.ts", [
    [/"\.\.\/db\/interfaces"/g, '"../interfaces"']
]);

replaceInFile("data-transformer.ts", [
    [/"\.\/interfaces"/g, '"./interfaces"'] // already correct but let's check
]);

replaceInFile("schema/generate-drizzle-schema-logic.ts", [
    [/"\.\.\/db\/interfaces"/g, '"../interfaces"'] // actually generate-drizzle-schema-logic.ts is in schema/ now. Should be "../interfaces"
]);

replaceInFile("services/entity-helpers.ts", [
    [/"\.\.\/\.\.\/collections\/PostgresCollectionRegistry"/g, '"../collections/PostgresCollectionRegistry"']
]);

const services = ["EntityFetchService.ts", "EntityPersistService.ts", "RelationService.ts", "realtimeService.ts", "entityService.ts"];
for (const service of services) {
    replaceInFile(`services/${service}`, [
        [/"\.\/interfaces"/g, '"../interfaces"'],
        [/"\.\/data-transformer"/g, '"../data-transformer"'],
        [/"\.\/collections/g, '"../collections'],
        [/"\.\/services\/entityService"/g, '"./entityService"'],
        [/resolveCollectionRelations\(([^)]+)\)/g, 'resolveCollectionRelations($1 as import("@rebasepro/common").PostgresCollection<any, any>)']
    ]);
}

replaceInFile("utils/drizzle-conditions.ts", [
    [/"\.\/collections/g, '"../collections'],
    [/"\.\/interfaces"/g, '"../interfaces"'],
    [/resolveCollectionRelations\(([^)]+)\)/g, 'resolveCollectionRelations($1 as import("@rebasepro/common").PostgresCollection<any, any>)']
]);

replaceInFile("websocket.ts", [
    [/"@rebasepro\/backend"/g, '"@rebasepro/types"'] // assuming AuthConfig and AccessTokenPayload are in types. Wait, AuthConfig might be in backend! We'll fix it if it complains.
]);

// Run tsc to check
import { execSync } from "child_process";
try {
    execSync("cd ../postgresql-backend && pnpm tsc --noEmit -p tsconfig.json", { stdio: "inherit" });
    console.log("ALL GOOD");
} catch(e) {
    console.error("STILL FAILING");
}
