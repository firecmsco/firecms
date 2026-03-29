import { EntityCollection } from "@rebasepro/types";
import * as fs from "fs";
import * as path from "path";
import { pathToFileURL } from "url";

/**
 * Asynchronously load collection files from a directory for backend initialization
 */
export async function loadCollectionsFromDirectory(directory: string): Promise<EntityCollection[]> {
    const collections: EntityCollection[] = [];
    try {
        if (!fs.existsSync(directory)) {
            console.warn(`[loadCollectionsFromDirectory] Collections directory not found: ${directory}`);
            return collections;
        }

        const files = fs.readdirSync(directory);
        for (const file of files) {
            // Only load .ts and .js files, ignore test files and declaration files
            if ((file.endsWith('.ts') || file.endsWith('.js')) &&
                !file.includes('.test.') &&
                !file.endsWith('.d.ts') &&
                file !== 'index.ts' && file !== 'index.js') {

                const filePath = path.join(directory, file);
                try {
                    const fileUrl = pathToFileURL(filePath).href;

                    // Use new Function to compile dynamic import natively and bypass tsc converting import() to require()
                    const dynamicImport = new Function('url', 'return import(url)');
                    const module = await dynamicImport(fileUrl);
                    
                    // Expect the collection to be the default export
                    if (module && module.default) {
                        collections.push(module.default);
                    } else {
                        console.warn(`[loadCollectionsFromDirectory] File ${file} does not have a default export. Skipping.`);
                    }
                } catch (err: any) {
                    console.error(`[loadCollectionsFromDirectory] Failed to load collection from ${file}: ${err.message}`);
                }
            }
        }
    } catch (err) {
        console.error(`[loadCollectionsFromDirectory] Error reading collections directory: ${err}`);
    }
    return collections;
}
