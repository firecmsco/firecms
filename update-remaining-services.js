const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    if (!fs.existsSync(filePath)) {
        console.error("File not found:", filePath);
        return;
    }
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace imports
    content = content.replace(
        /getIdFieldInfo,\n\s*parseIdValue/g,
        'getPrimaryKeys,\n    parseIdValues,\n    buildCompositeId'
    );

    // Replace const idInfo = getIdFieldInfo(...) -> const idInfoArray = getPrimaryKeys(...); const idInfo = idInfoArray[0];
    content = content.replace(/const (\w+)IdInfo = getIdFieldInfo\(([^)]+)\);/g, 'const $1IdInfoArray = getPrimaryKeys($2);\n        const $1IdInfo = $1IdInfoArray[0];');
    // For idInfo without a prefix:
    content = content.replace(/const idInfo = getIdFieldInfo\(([^)]+)\);/g, 'const idInfoArray = getPrimaryKeys($1);\n        const idInfo = idInfoArray[0];');

    // Replace parseIdValue(...) -> parseIdValues(...)[idInfo.fieldName]
    content = content.replace(/const (\w+) = parseIdValue\(([^,]+), (\w+)IdInfo\.type\);/g, 'const $1Obj = parseIdValues($2, $3IdInfoArray);\n        const $1 = $1Obj[$3IdInfo.fieldName];');
    content = content.replace(/const (\w+) = parseIdValue\(([^,]+), idInfo\.type\);/g, 'const $1Obj = parseIdValues($2, idInfoArray);\n        const $1 = $1Obj[idInfo.fieldName];');
    
    // Inline parseIdValue replacements
    content = content.replace(/parseIdValue\(([^,]+), (\w+)IdInfo\.type\)/g, 'parseIdValues($1, $2IdInfoArray)[$2IdInfo.fieldName]');
    content = content.replace(/parseIdValue\(([^,]+), idInfo\.type\)/g, 'parseIdValues($1, idInfoArray)[idInfo.fieldName]');

    // For EntityFetchService parameter definition
    content = content.replace(/idInfo: \{ fieldName: string; type: string \}/g, 'idInfo: { fieldName: string; type: "string" | "number" }');

    fs.writeFileSync(filePath, content);
}

processFile(path.join(__dirname, 'packages/backend/src/db/services/EntityFetchService.ts'));
processFile(path.join(__dirname, 'packages/backend/src/db/services/EntityPersistService.ts'));

// Now process generate-drizzle-schema-logic.ts
const schemaFilePath = path.join(__dirname, 'packages/backend/src/generate-drizzle-schema-logic.ts');
if (fs.existsSync(schemaFilePath)) {
    let schemaContent = fs.readFileSync(schemaFilePath, 'utf8');
    
    // Replace collection.idField ?? "id" with getPrimaryKeys
    // Need to import getPrimaryKeys if not there
    if (!schemaContent.includes("getPrimaryKeys")) {
        schemaContent = schemaContent.replace(/import \{.*?\} from "@firecms\/types";/, '$&\nimport { getPrimaryKeys } from "./db/services/entity-helpers";');
    }
    
    schemaContent = schemaContent.replace(/collection\.idField \?\? "id"/g, "getPrimaryKeys(collection)[0].fieldName");
    schemaContent = schemaContent.replace(/targetCollection\.idField \?\? "id"/g, "getPrimaryKeys(targetCollection)[0].fieldName");
    schemaContent = schemaContent.replace(/sourceCollection\.idField \?\? "id"/g, "getPrimaryKeys(sourceCollection)[0].fieldName");
    schemaContent = schemaContent.replace(/target.idField \?\? "id"/g, "getPrimaryKeys(target)[0].fieldName");

    fs.writeFileSync(schemaFilePath, schemaContent);
}

console.log("Done");
