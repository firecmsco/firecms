const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    content = content.replace(/import type { ([^}]+) } } from/g, 'import type { $1 } from');
    content = content.replace(/import { {([^}]+)} } from "@rebasepro\/types";;/g, 'import { $1 } from "@rebasepro/types";');
    content = content.replace(/import { { ([^}]+) } } from "@rebasepro\/types";;/g, 'import { $1 } from "@rebasepro/types";');
    content = content.replace(/import { {([^}]+)} } from "@rebasepro\/types";/g, 'import { $1 } from "@rebasepro/types";');
    content = content.replace(/import { { ([^}]+) } } from "@rebasepro\/types";/g, 'import { $1 } from "@rebasepro/types";');
    content = content.replace(/import { {\n([^}]+)\n} } from "@rebasepro\/types";;/gm, 'import { \n$1\n} from "@rebasepro/types";');
    content = content.replace(/import { {([^}]+)} } from "@rebasepro\/types";/gm, 'import { $1 } from "@rebasepro/types";');

    // More general cleanup of double braces or trailing semicolons in Rebase
    content = content.replace(/import { {([^}]+) } from "@rebasepro\/types";;/gm, 'import { $1 } from "@rebasepro/types";');
    content = content.replace(/import { \n{([^}]+) } from "@rebasepro\/types";;/gm, 'import { \n$1 } from "@rebasepro/types";');
    
    // Also the case where it generated `import type { PropertyConfig } } ...`
    content = content.replace(/import type {([^}]+)} } from/g, 'import type { $1 } from');
    content = content.replace(/} } from "@rebasepro\/types\/cms";/g, '} from "@rebasepro/types/cms";');
    
    // Clean trailing semicolons
    content = content.replace(/";;/g, '";');
    content = content.replace(/'';;/g, "';");

    // Also "import { { AuthController, EntityCollection, Property } from "@rebasepro/types";"
    content = content.replace(/import { { ([^}]*) } from/g, 'import { $1 } from');
    content = content.replace(/import { {([^}]*) } from/g, 'import { $1 } from');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
    }
}

function walkDir(dir) {
    let list = fs.readdirSync(dir);
    for (let file of list) {
        file = path.join(dir, file);
        let stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            walkDir(file);
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            fixFile(file);
        }
    }
}

walkDir(path.join(__dirname, 'src'));
console.log("Cleanup done.");
