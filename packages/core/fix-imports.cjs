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

    // 1. Move imports
    const importRegex = /import\s+({[^}]+})\s+from\s+["']@rebasepro\/types["']/g;
    let match;
    let newContent = content;
    let cmsImportsToInject = [];

    while ((match = importRegex.exec(content)) !== null) {
        const fullImport = match[0];
        const innerText = match[1];
        
        let types = innerText.split(',').map(t => t.trim()).filter(Boolean);
        let coreTypes = [];
        let cmsTypes = [];
        
        for (let t of types) {
            let baseType = t.replace('type ', '').trim();
            let isCmsType = CMS_TYPES.some(c => baseType.startsWith(c));
            if (isCmsType) {
                cmsTypes.push(t);
            } else {
                coreTypes.push(t);
            }
        }

        if (cmsTypes.length > 0) {
            cmsImportsToInject.push(...cmsTypes);
            let replacement = '';
            if (coreTypes.length > 0) {
                 replacement = `import { ${coreTypes.join(', ')} } from "@rebasepro/types";`;
            }
            newContent = newContent.replace(fullImport, replacement);
        }
    }

    if (cmsImportsToInject.length > 0) {
        newContent = `import type { ${[...new Set(cmsImportsToInject)].join(', ')} } from "@rebasepro/types/cms";\n` + newContent;
    }

    // 2. Typecasts
    newContent = newContent.replace(/([a-zA-Z0-9_]+)\.Field/g, '($1 as any).Field');
    newContent = newContent.replace(/([a-zA-Z0-9_]+)\.Preview/g, '($1 as any).Preview');
    newContent = newContent.replace(/([a-zA-Z0-9_]+)\.entityViews/g, '($1 as any).entityViews');
    newContent = newContent.replace(/([a-zA-Z0-9_]+)\.Actions/g, '($1 as any).Actions');
    newContent = newContent.replace(/([a-zA-Z0-9_]+)\!\.Field/g, '($1 as any)!.Field');
    newContent = newContent.replace(/([a-zA-Z0-9_]+)\!\.Preview/g, '($1 as any)!.Preview');
    newContent = newContent.replace(/([a-zA-Z0-9_]+)\?\.Field/g, '($1 as any)?.Field');
    newContent = newContent.replace(/([a-zA-Z0-9_]+)\?\.Preview/g, '($1 as any)?.Preview');
    // For specific things like (property as Property).Field -> ((property as Property) as any).Field
    newContent = newContent.replace(/\(property as Property\)\.Field/g, '((property as Property) as any).Field');

    if (newContent !== original) {
        fs.writeFileSync(filePath, newContent, 'utf8');
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
console.log("Done");
