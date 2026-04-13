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

const services = ["EntityFetchService.ts", "EntityPersistService.ts", "RelationService.ts", "realtimeService.ts", "entityService.ts"];
for (const service of services) {
    replaceInFile(`services/${service}`, [
        [/import\("@rebasepro\/common"\)\.PostgresCollection/g, 'import("@rebasepro/types").PostgresCollection']
    ]);
}

replaceInFile("utils/drizzle-conditions.ts", [
    [/import\("@rebasepro\/common"\)\.PostgresCollection/g, 'import("@rebasepro/types").PostgresCollection']
]);
