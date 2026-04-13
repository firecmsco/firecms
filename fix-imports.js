import fs from "fs";
import path from "path";


function crawlDir(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const stat = fs.statSync(path.join(dir, file));
    if (stat.isDirectory()) {
      crawlDir(path.join(dir, file), fileList);
    } else if (file.endsWith(".ts")) {
      fileList.push(path.join(dir, file));
    }
  }
  return fileList;
}

const packageDir = path.resolve(process.cwd(), "packages/postgresql-backend/src");
const tsFiles = crawlDir(packageDir);

const replacements = [
    // BackendCollectionRegistry -> PostgresCollectionRegistry
    { regex: /BackendCollectionRegistry/g, replacement: "PostgresCollectionRegistry" },
    { regex: /"\.\.\/\.\.\/collections\/PostgresCollectionRegistry"/g, replacement: '"../collections/PostgresCollectionRegistry"' },
    { regex: /"\.\.\/collections\/PostgresCollectionRegistry"/g, replacement: '"./collections/PostgresCollectionRegistry"' }, // in PostgresBackendDriver.ts
    // Interfaces
    { regex: /"\.\.\/\.\.\/db\/interfaces"/g, replacement: '"../interfaces"' },
    { regex: /"\.\.\/db\/interfaces"/g, replacement: '"./interfaces"' },
    { regex: /"\.\.\/interfaces"/g, replacement: '"../interfaces"' }, // in services
    // Data transformer
    { regex: /"\.\.\/\.\.\/db\/data-transformer"/g, replacement: '"../data-transformer"' },
    { regex: /"\.\.\/data-transformer"/g, replacement: '"../data-transformer"' },
    // Drizzle conditions
    { regex: /"\.\.\/\.\.\/utils\/drizzle-conditions"/g, replacement: '"../utils/drizzle-conditions"' },
    // PostgresDataDriver to PostgresBackendDriver
    { regex: /PostgresDataDriver/g, replacement: "PostgresBackendDriver" },
    { regex: /"\.\/services\/postgresDataDriver"/g, replacement: '"./PostgresBackendDriver"' }, // in websocket.ts
    // entityService
    { regex: /"\.\.\/db\/entityService"/g, replacement: '"./services/entityService"' },
    { regex: /"\.\.\/db\/connection"/g, replacement: '"./connection"' },
    { regex: /"\.\/postgresDataDriver"/g, replacement: '"./PostgresBackendDriver"' },
    { regex: /"\.\.\/history\/HistoryService"/g, replacement: '"@rebasepro/backend"' }
];

// Special auth/init overrides for websocket.ts
const specialWebsocketReplacements = [
    { regex: /from "\.\/auth"/g, replacement: 'from "@rebasepro/backend"' },
    { regex: /from "\.\/init"/g, replacement: 'from "@rebasepro/backend"' }
]

for (const file of tsFiles) {
  let content = fs.readFileSync(file, 'utf8');
  let hasChanges = false;
  
  for (const { regex, replacement } of replacements) {
    if (regex.test(content)) {
      content = content.replace(regex, replacement);
      hasChanges = true;
    }
  }

  if (file.endsWith("websocket.ts")) {
    for (const { regex, replacement } of specialWebsocketReplacements) {
        if (regex.test(content)) {
            content = content.replace(regex, replacement);
            hasChanges = true;
        }
    }
  }

  if (file.endsWith("generate-drizzle-schema-logic.ts")) {
     content = content.replace(/"\.\/db\/interfaces"/g, '"./interfaces"');
     hasChanges = true;
  }

  // Quick fix for data-transformer.ts registry import
  if (file.endsWith("data-transformer.ts")) {
     content = content.replace(/"\.\/collections\/PostgresCollectionRegistry"/g, '"./collections/PostgresCollectionRegistry"');
  }

  if (hasChanges) {
    fs.writeFileSync(file, content);
  }
}
console.log("Imports updated successfully!");
