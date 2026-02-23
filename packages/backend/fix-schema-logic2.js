const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'packages/backend/src/generate-drizzle-schema-logic.ts');
let content = fs.readFileSync(file, 'utf8');

// Replace ($1.primaryKeys && $1.primaryKeys.length > 0 ? $1.primaryKeys[0] : "id") with ($1.primaryKeys && $1.primaryKeys.length > 0 ? $1.primaryKeys[0] : ($1.idField ?? "id"))
content = content.replace(/\(\$1\.primaryKeys && \$1\.primaryKeys\.length > 0 \? \$1\.primaryKeys\[0\] : "id"\)/g, '($1.primaryKeys && $1.primaryKeys.length > 0 ? $1.primaryKeys[0] : ($1.idField ?? "id"))');

// Also need to match the actual captured string, let's just use string replace.
content = content.replace(/\(collection\.primaryKeys && collection\.primaryKeys\.length > 0 \? collection\.primaryKeys\[0\] : "id"\)/g, '(collection.primaryKeys && collection.primaryKeys.length > 0 ? collection.primaryKeys[0] : (collection.idField ?? "id"))');
content = content.replace(/\(targetCollection\.primaryKeys && targetCollection\.primaryKeys\.length > 0 \? targetCollection\.primaryKeys\[0\] : "id"\)/g, '(targetCollection.primaryKeys && targetCollection.primaryKeys.length > 0 ? targetCollection.primaryKeys[0] : (targetCollection.idField ?? "id"))');

fs.writeFileSync(file, content);
