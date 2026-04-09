const fs = require('fs');
const path = require('path');

const DIR = 'app/frontend/src';

const itemsToMove = [
  'useBuildUrlController',
  'useBuildCollectionRegistryController',
  'FieldCaption',
  'useBuildUnsavedChangesDialog',
  'UnsavedChangesDialog',
  'SideDialogs',
  'SideEntityControllerContext',
  'useBuildSideEntityController',
  'AIIcon',
  'IconForView'
];

function processDir(dir) {
  const dirFiles = fs.readdirSync(dir);
  for (const file of dirFiles) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      const moved = [];
      const coreImportRegex = /import\s+\{([^}]+)\}\s+from\s+["']@rebasepro\/core["']/g;
      
      let newContent = content.replace(coreImportRegex, (match, importsStr) => {
        const words = importsStr.split(',').map(w => w.trim()).filter(w => w);
        const keepingInCore = [];
        
        words.forEach(w => {
           const baseWord = w.split(/\s+as\s+/)[0];
           if (itemsToMove.includes(baseWord)) {
              moved.push(w);
           } else {
              keepingInCore.push(w);
           }
        });
        
        if (keepingInCore.length === 0) {
           return '';
        }
        return `import { ${keepingInCore.join(', ')} } from "@rebasepro/core"`;
      });
      
      if (moved.length > 0) {
         newContent = `import { ${moved.join(', ')} } from "@rebasepro/cms";\n` + newContent;
         fs.writeFileSync(fullPath, newContent);
         console.log(`Updated multiline imports in ${fullPath}`);
      }
    }
  }
}

processDir(DIR);
