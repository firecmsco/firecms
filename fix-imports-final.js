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

replaceInFile("schema/generate-drizzle-schema-logic.ts", [
    [/resolveCollectionRelations\(([^)]+)\)/g, 'resolveCollectionRelations($1 as import("@rebasepro/types").PostgresCollection<any, any>)'],
    [/(collections(?:\.some|\.forEach)\(c\s*=>\s*c\.securityRules)/g, '(collections as import("@rebasepro/types").PostgresCollection<any, any>[]).some(c => c.securityRules'],
    [/const securityRules = collection\.securityRules;/g, 'const securityRules = (collection as import("@rebasepro/types").PostgresCollection<any, any>).securityRules;'],
    [/"\.\/db\/services\/entity-helpers"/g, '"../services/entity-helpers"']
]);

replaceInFile("schema/generate-drizzle-schema-logic.ts", [
    [/\(collections as import\("@rebasepro\/types"\)\.PostgresCollection<any, any>\[\]\)\.some\(c => c\.securityRules/g, '(collections as import("@rebasepro/types").PostgresCollection<any, any>[]).some(c => c.securityRules'],
    [/securityRules\.forEach\(\(rule, idx\)/g, 'securityRules.forEach((rule: any, idx: number)']
]);


replaceInFile("services/entity-helpers.ts", [
    [/"\.\/collections\/PostgresCollectionRegistry"/g, '"../collections/PostgresCollectionRegistry"']
]);


replaceInFile("services/entityService.ts", [
    [/"\.\/services"/g, '"./EntityFetchService"'] // actually wait, entityService imports * from "./services" ?
]);

// Wait, entityService.ts had: `import { EntityFetchService, EntityPersistService, RelationService } from "./services";`. Let's fix that structure.
let entityServiceContent = fs.readFileSync(path.join(dir, "services/entityService.ts"), "utf8");
entityServiceContent = entityServiceContent.replace(/import { EntityFetchService, EntityPersistService, RelationService } from "\.\/services";/g, 'import { EntityFetchService } from "./EntityFetchService";\nimport { EntityPersistService } from "./EntityPersistService";\nimport { RelationService } from "./RelationService";');
entityServiceContent = entityServiceContent.replace(/export { EntityFetchService, EntityPersistService, RelationService } from "\.\/services";/g, 'export { EntityFetchService } from "./EntityFetchService";\nexport { EntityPersistService } from "./EntityPersistService";\nexport { RelationService } from "./RelationService";');
fs.writeFileSync(path.join(dir, "services/entityService.ts"), entityServiceContent);


// Fixing 'lastEntry' any type
let drvContent = fs.readFileSync(path.join(dir, "PostgresBackendDriver.ts"), "utf8");
drvContent = drvContent.replace(/if \(lastEntry && lastEntry\[1\]\.clientId === "driver"\) \{/g, 'if (lastEntry && (lastEntry[1] as any).clientId === "driver") {');
drvContent = drvContent.replace(/lastEntry\[1\]\.authContext = authContext;/g, '(lastEntry[1] as any).authContext = authContext;');
drvContent = drvContent.replace(/\[1\]\.collectionRequest/g, '[1] as any).collectionRequest');
drvContent = drvContent.replace(/\[1\]\.clientId/g, '[1] as any).clientId');
fs.writeFileSync(path.join(dir, "PostgresBackendDriver.ts"), drvContent);

replaceInFile("collections/PostgresCollectionRegistry.ts", [
    [/collection\.relations/g, '(collection as import("@rebasepro/types").PostgresCollection<any, any>).relations']
]);

replaceInFile("data-transformer.ts", [
    [/"\.\/interfaces"/g, '"../interfaces"'],
    [/"\.\/collections\/PostgresCollectionRegistry"/g, '"../collections/PostgresCollectionRegistry"']
]);

