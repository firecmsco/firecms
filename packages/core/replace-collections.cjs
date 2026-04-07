const fs = require('fs');
const path = require('path');

function processPath(dir) {
    const list = fs.readdirSync(dir);
    for (let file of list) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat.isDirectory()) {
            processPath(file);
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            let content = fs.readFileSync(file, 'utf8');
            let original = content;

            // Simple search and replace for EntityCollection -> CMSEntityCollection
            if (content.includes('EntityCollection')) {
                // If it imports from @rebasepro/types, move it to @rebasepro/types/cms
                content = content.replace(/EntityCollection,/g, '');
                content = content.replace(/, EntityCollection/g, '');
                content = content.replace(/import { EntityCollection } from "@rebasepro\/types";/g, '');
                
                content = content.replace(/\bEntityCollection\b/g, 'CMSEntityCollection');
                
                // Add import
                if (content.includes('CMSEntityCollection') && !content.includes('import type { CMSEntityCollection } from "@rebasepro/types/cms"')) {
                    content = 'import type { CMSEntityCollection } from "@rebasepro/types/cms";\n' + content;
                }
            }

            if (content !== original) {
                fs.writeFileSync(file, content, 'utf8');
            }
        }
    }
}

processPath(path.join(__dirname, 'src'));
console.log("Replaced EntityCollection");
