import * as fs from 'fs';
import * as path from 'path';

function getKeys(obj: any, prefix = ''): string[] {
    let keys: string[] = [];
    for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
            keys = keys.concat(getKeys(obj[key], prefix + key + '.'));
        } else {
            keys.push(prefix + key);
        }
    }
    return keys;
}

const packagesDirs = [
    'packages/firecms_core',
    'packages/firecms_cloud',
    'packages/user_management',
    'packages/collection_editor',
    'packages/data_export',
    'packages/data_import',
    'packages/firebase_project_api',
    'saas'
];

async function scan() {
    console.log("Scanning for missing translation keys in locales...");
    for (const pkg of packagesDirs) {
        const fullPkgPath = path.join(process.cwd(), pkg);
        if (!fs.existsSync(fullPkgPath)) continue;
        
        const localesDir = path.join(fullPkgPath, 'src', 'locales');
        if (!fs.existsSync(localesDir)) continue;
        
        const enPath = path.join(localesDir, 'en.ts');
        if (!fs.existsSync(enPath)) continue;
        
        console.log(`\n\x1b[36m--- ${pkg} ---\x1b[0m`);
        
        let enDict = {} as any;
        try {
            // tsx allows dynamic import of ts files
            const mod = await import(enPath);
            enDict = mod.default || mod.en;
            if (!enDict && Object.keys(mod).length > 0) {
                 enDict = mod[Object.keys(mod)[0]]; 
            }
        } catch(e) {
            console.error(`Failed to load ${enPath}`, e);
            continue;
        }
        
        const enKeys = getKeys(enDict);
        // console.log(`  Found ${enKeys.length} keys in en.ts`);

        const files = fs.readdirSync(localesDir);
        for (const file of files) {
            if (file === 'en.ts' || !file.endsWith('.ts')) continue;
            const langPath = path.join(localesDir, file);
            let langDict = {} as any;
            try {
                const mod = await import(langPath);
                langDict = mod.default || mod[file.replace('.ts', '')];
                if (!langDict && Object.keys(mod).length > 0) {
                     langDict = mod[Object.keys(mod)[0]]; 
                }
            } catch(e) {
                 console.error(`Failed to load ${langPath}`, e);
                 continue;
            }
            
            const langKeys = getKeys(langDict);
            const missing = enKeys.filter(k => !langKeys.includes(k));
            const extra = langKeys.filter(k => !enKeys.includes(k));
            
            if (missing.length > 0) {
                 console.log(`  \x1b[31m${file} is missing ${missing.length} keys:\x1b[0m`);
                 missing.slice(0, 10).forEach(m => console.log(`    - ${m}`));
                 if (missing.length > 10) console.log(`    ... and ${missing.length - 10} more`);
            }
            if (extra.length > 0) {
                 console.log(`  \x1b[33m${file} has ${extra.length} extra keys (not in en.ts):\x1b[0m`);
                 extra.slice(0, 10).forEach(m => console.log(`    - ${m}`));
                 if (extra.length > 10) console.log(`    ... and ${extra.length - 10} more`);
            }
            if (missing.length === 0 && extra.length === 0) {
                 console.log(`  \x1b[32m${file} is perfectly perfectly in sync with en.ts\x1b[0m`);
            }
        }
    }
}

scan().catch(console.error);
