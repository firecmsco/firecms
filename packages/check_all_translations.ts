import * as fs from 'fs';
import * as path from 'path';

const packages = [
    'data_enhancement',
    'datatalk',
    'entity_history',
    'firecms_cloud',
    'firecms_core',
    'media_manager'
];

async function checkTranslations() {
    let anyMissing = false;
    for (const pkg of packages) {
        console.log(`\nChecking package: ${pkg}`);
        const basePath = path.join(__dirname, pkg, 'src', 'locales');
        const enPath = path.join(basePath, 'en.ts');
        const esPath = path.join(basePath, 'es.ts');

        if (!fs.existsSync(enPath)) {
            console.log(`  en.ts not found in ${pkg}`);
            continue;
        }

        try {
            const enModule = await import(enPath);
            const enKeys = Object.keys(enModule.en || {});
            
            if (!fs.existsSync(esPath)) {
                console.log(`  es.ts entirely missing in ${pkg}`);
                console.log(`  Missing [ES] keys length: ${enKeys.length}`);
                anyMissing = true;
                continue;
            }

            const esModule = await import(esPath);
            const es = esModule.es || {};
            const esKeys = Object.keys(es);

            const missingInEs = enKeys.filter(key => !(key in es));
            const missingInEn = esKeys.filter(key => !(key in enModule.en));

            if (missingInEs.length > 0) {
                console.log(`  Missing [ES] keys:`);
                missingInEs.forEach(k => console.log(`    - ${k}`));
                anyMissing = true;
            } else {
                console.log(`  All EN keys are present in ES.`);
            }

            if (missingInEn.length > 0) {
                console.log(`  Missing [EN] keys (present in ES):`);
                missingInEn.forEach(k => console.log(`    - ${k}`));
                anyMissing = true;
            }
        } catch (e) {
            console.error(`  Error importing files for ${pkg}:`, e);
        }
    }
    if (!anyMissing) {
        console.log("\nAll translations in all packages are perfectly matched!");
    }
}

checkTranslations();
