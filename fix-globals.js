const fs = require('fs');
const glob = require('glob');
const path = require('path');

const packagesDir = path.resolve('/Users/francesco/rebase/packages');
const viteConfigs = fs.readdirSync(packagesDir)
    .filter(dir => fs.statSync(path.join(packagesDir, dir)).isDirectory())
    .map(dir => path.join(packagesDir, dir, 'vite.config.ts'))
    .filter(file => fs.existsSync(file));

for (const file of viteConfigs) {
    let content = fs.readFileSync(file, 'utf8');

    // Skip if it doesn't have rollupOptions.external
    if (!content.includes('external: isExternal')) continue;

    // Skip if it already has output or globals inside rollupOptions
    // We only care about simple cases where it's just 'external: isExternal'
    if (content.match(/rollupOptions:\s*{\s*external:\s*isExternal\s*}/)) {
        content = content.replace(
            /rollupOptions:\s*{\s*external:\s*isExternal\s*}/,
            `rollupOptions: {
            external: isExternal,
            output: {
                globals: {
                    "json-logic-js": "jsonLogic",
                    "fast-equals": "fastEquals",
                    "lodash/cloneDeep.js": "cloneDeep"
                }
            }
        }`
        );
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${file}`);
    } else {
        console.log(`Skipped ${file} (complex rollupOptions)`);
    }
}
