const fs = require('fs');
const path = './packages/backend/src/api/ast-schema-editor.ts';
let content = fs.readFileSync(path, 'utf8');

const target = `            for (const key of Object.keys(collectionData)) {`;
const insert = `            // Force delete securityRules if empty or undefined
            if (!("securityRules" in collectionData) || collectionData.securityRules === undefined || (Array.isArray(collectionData.securityRules) && collectionData.securityRules.length === 0)) {
                const srProp = collectionObj.getProperty("securityRules");
                if (srProp) {
                    srProp.remove();
                }
            }

`;

if (content.includes(target)) {
    content = content.replace(target, insert + target);
    fs.writeFileSync(path, content);
    console.log("Patched successfully!");
} else {
    console.log("Target not found!");
}
