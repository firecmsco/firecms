import fs from 'fs';
import path from 'path';

function fixFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Resolve git conflicts taking HEAD
    const conflictRegex = /<<<<<<< HEAD\n([\s\S]*?)=======\n[\s\S]*?>>>>>>>[^\n]*\n/g;
    content = content.replace(conflictRegex, '$1');

    if (filePath.endsWith('package.json')) {
        try {
            const json = JSON.parse(content);
            
            if (json.version) {
                 json.version = "4.0.0";
            }
            if (json.peerDependencies && json.peerDependencies["@firecms/core"]) {
                 json.peerDependencies["@firecms/core"] = "4.0.0";
            }
            
            const dirs = ['dependencies', 'devDependencies', 'peerDependencies'];
            for (const dir of dirs) {
                if (json[dir]) {
                    for (const dep of Object.keys(json[dir])) {
                        if (dep.startsWith('@firecms/') && dep !== '@firecms/firebase_setup') {
                            json[dir][dep] = "4.0.0";
                        }
                    }
                }
            }
            // Keep formatting of package.json: indent 2
            content = JSON.stringify(json, null, 2) + '\n';
            console.log("Successfully fixed JSON and versions in", filePath);
        } catch(e) {
             console.error("Failed to parse JSON in", filePath, e.message);
        }
    } else {
        console.log("Fixed source file", filePath);
    }
    
    fs.writeFileSync(filePath, content, 'utf-8');
}

const filesToFix = [
    "legacy_examples/example/package.json",
    "legacy_examples/example_cloud/package.json",
    "legacy_examples/example_next/package.json",
    "package.json",
    "packages/cli/templates/template/package.json",
    "packages/collection_editor/package.json",
    "packages/data_enhancement/package.json",
    "packages/data_export/package.json",
    "packages/data_import/package.json",
    "packages/data_import_export/package.json",
    "packages/datatalk/package.json",
    "packages/editor/package.json",
    "packages/entity_history/package.json",
    "packages/firebase_firecms/package.json",
    "packages/firecms/package.json",
    "packages/firecms_cloud/package.json",
    "packages/firecms_core/package.json",
    "packages/formex/package.json",
    "packages/media_manager/package.json",
    "packages/mongodb/package.json",
    "packages/schema_inference/package.json",
    "packages/ui/package.json",
    "packages/user_management/package.json"
];

for (const f of filesToFix) {
    if (fs.existsSync(f)) {
        fixFile(f);
    } else {
        console.log("File not found", f);
    }
}
