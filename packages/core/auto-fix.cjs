const { execSync } = require('child_process');
const fs = require('fs');

try {
    execSync('npx tsc --noEmit', { encoding: 'utf8' });
} catch (e) {
    const output = e.stdout || e.message;
    const lines = output.split('\n');
    let fixedAny = false;

    for (let line of lines) {
        // e.g. src/util/previews.ts:1:32 - error TS2305: Module '"@rebasepro/types"' has no exported member 'PropertyConfig'.
        let match = line.match(/^([^:]+):(\d+):\d+ - error TS2305: Module '"@rebasepro\/types"' has no exported member '([^']+)'/);
        if (match) {
            let file = match[1];
            let missingType = match[3];

            if (fs.existsSync(file)) {
                let content = fs.readFileSync(file, 'utf8');
                // Regex to find the import containing the missing type
                const r1 = new RegExp(`(import\\s+\\{[^}]*)\\b${missingType}\\b([^}]*\\}\\s+from\\s+["']@rebasepro/types["'])`);
                const matched = content.match(r1);

                if (matched) {
                    // Remove missingType from original import
                    let newImport = matched[0].replace(new RegExp(`,\\s*${missingType}\\b|\\b${missingType}\\s*,?`), '');
                    // Clean up empty imports
                    if (newImport.match(/import\s*\{\s*\}\s*from/)) {
                        newImport = '';
                    } else if (newImport.match(/import\s*\{\s*,\s*}/)) {
                        newImport = newImport.replace(/,\s*\}/, '}');
                    }
                    
                    content = content.replace(matched[0], newImport + `\nimport type { ${missingType} } from "@rebasepro/types/cms";`);
                    fs.writeFileSync(file, content, 'utf8');
                    fixedAny = true;
                    console.log(`Fixed ${missingType} in ${file}`);
                } else {
                    // Try to find if it was standalone e.g. import { PropertyConfig } from "@rebasepro/types"
                    const r2 = new RegExp(`import\\s*\\{[\\s]*${missingType}[\\s]*\\}\\s*from\\s*["']@rebasepro/types["']`);
                    if (content.match(r2)) {
                        content = content.replace(r2, `import type { ${missingType} } from "@rebasepro/types/cms"`);
                        fs.writeFileSync(file, content, 'utf8');
                        fixedAny = true;
                        console.log(`Fixed exact ${missingType} in ${file}`);
                    }
                }
            }
        }
    }
    
    if (fixedAny) {
        console.log("Fixed some imports. Run again.");
    } else {
        console.log("Nothing to fix automatically based on TS2305.");
    }
}
