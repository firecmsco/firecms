const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'packages/backend/src/generate-drizzle-schema-logic.ts');
let content = fs.readFileSync(file, 'utf8');

// Replace getPrimaryKeys(xxx)[0].fieldName with (xxx.primaryKeys && xxx.primaryKeys.length > 0 ? xxx.primaryKeys[0] : "id")
content = content.replace(/getPrimaryKeys\(([^)]+)\)\[0\]\.fieldName/g, '($1.primaryKeys && $1.primaryKeys.length > 0 ? $1.primaryKeys[0] : "id")');

fs.writeFileSync(file, content);
