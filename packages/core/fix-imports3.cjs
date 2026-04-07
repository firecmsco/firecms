const fs = require('fs');
const path = require('path');

const CMS_TYPES = [
    'PropertyConfig',
    'EntityCustomView',
    'PreviewComponentProps',
    'FieldProps',
    'SideEntityController',
    'CMSUrlController',
    'RebasePlugin',
    'RebasePluginContext',
    'CustomizationController',
    'EntityAction',
    'AdditionalFieldDelegate',
    'DefaultFieldConfig',
    'PropertyBuilder',
    'PropertyConfigBuilder',
    'PluginSlots',
    'SlotComponentProps'
];

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    for (const t of CMS_TYPES) {
        // standalone import
        const rStandalone = new RegExp(`import\\s*\\{[\\s]*${t}[\\s]*\\}\\s*from\\s*["']@rebasepro/types["'](?:;?)`, 'g');
        content = content.replace(rStandalone, `import type { ${t} } from "@rebasepro/types/cms";`);

        // compound import
        const rCompound = new RegExp(`(import\\s+\\{[^}]*)\\b${t}\\b([^}]*\\}\\s+from\\s+["']@rebasepro/types["'](?:;?))`, 'g');
        let match;
        while ((match = rCompound.exec(content)) !== null) {
            let left = match[1];
            let right = match[2];
            // clean up trailing/leading commas
            let inner = `${left.replace(/,\s*$/, '').trim()}${right.replace(/^\s*,/, '').trim()}`;
            // If empty, remove the whole import
            if (inner.match(/import\s*\{\s*\}\s*from/)) {
                content = content.replace(match[0], `import type { ${t} } from "@rebasepro/types/cms";\n`);
            } else {
                content = content.replace(match[0], `${inner}\nimport type { ${t} } from "@rebasepro/types/cms";\n`);
            }
        }
    }

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
            processFile(file);
        }
    }
}

walkDir(path.join(__dirname, 'src'));
console.log("Fix3 done.");
