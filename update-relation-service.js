const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'packages/backend/src/db/services/RelationService.ts');
if (!fs.existsSync(filePath)) {
    console.error("File not found");
    process.exit(1);
}

// Reset the file first
const { execSync } = require('child_process');
execSync(`git checkout -- "${filePath}"`);

let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
    /getIdFieldInfo,\n\s*parseIdValue,/g,
    'getPrimaryKeys,\n    parseIdValues,\n    buildCompositeId,'
);

content = content.replace(
    /getIdFieldInfo/g,
    'getPrimaryKeys'
);

content = content.replace(
    /\(parentCollection\.idField \|\| "id"\)/g,
    'getPrimaryKeys(parentCollection)[0].fieldName'
);

// We need a helper function to replace getPrimaryKeys
// const targetIdInfo = getPrimaryKeys(targetCollection); -> const targetPks = getPrimaryKeys(targetCollection); const targetIdInfo = targetPks[0];
content = content.replace(/const (\w+)IdInfo = getPrimaryKeys\(([^)]+)\);/g, 'const $1Pks = getPrimaryKeys($2);\n        const $1IdInfo = $1Pks[0];');

// const parsedParentId = parseIdValue(parentEntityId, parentIdInfo.type); 
// -> const parsedParentIdObj = parseIdValues(parentEntityId, parentPks); const parsedParentId = parsedParentIdObj[parentIdInfo.fieldName];
content = content.replace(/const (\w+) = parseIdValue\(([^,]+), (\w+)IdInfo\.type\);/g, (match, p1, p2, p3) => {
    return `const ${p1}Obj = parseIdValues(${p2}, ${p3}Pks);\n        const ${p1} = ${p1}Obj[${p3}IdInfo.fieldName];`;
});

// Another form of parseIdValue:
// const parsedParentIds = parentEntityIds.map(id => parseIdValue(id, parentIdInfo.type));
content = content.replace(/parseIdValue\(([^,]+), (\w+)IdInfo\.type\)/g, (match, p1, p2) => {
    return `parseIdValues(${p1}, ${p2}Pks)[${p2}IdInfo.fieldName]`;
});

fs.writeFileSync(filePath, content);
console.log("Done");
