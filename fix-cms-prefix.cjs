const fs = require('fs');
const path = require('path');

const replacements = [
    ["CMSProperty", "Property"],
    ["CMSProperties", "Properties"],
    ["CMSEntityCollection", "EntityCollection"],
    ["CMSStringProperty", "StringProperty"],
    ["CMSNumberProperty", "NumberProperty"],
    ["CMSBooleanProperty", "BooleanProperty"],
    ["CMSDateProperty", "DateProperty"],
    ["CMSGeopointProperty", "GeopointProperty"],
    ["CMSReferenceProperty", "ReferenceProperty"],
    ["CMSRelationProperty", "RelationProperty"],
    ["CMSArrayProperty", "ArrayProperty"],
    ["CMSMapProperty", "MapProperty"],
    ["CMSBaseProperty", "BaseProperty"],
    ["CMSAdditionalFieldDelegate", "AdditionalFieldDelegate"],
    ["CMSEntityCollectionsBuilder", "EntityCollectionsBuilder"],
    ["CMSPropertyOrBuilder", "PropertyOrBuilder"],
];

function processDirectory(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'node_modules' && file !== 'dist' && file !== '.git' && file !== '.astro') {
                processDirectory(fullPath);
            }
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.astro')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;
            for (const [find, replace] of replacements) {
                const regex = new RegExp(`\\b${find}\\b`, 'g');
                if (regex.test(content)) {
                    content = content.replace(regex, replace);
                    modified = true;
                }
            }
            if (modified) {
                fs.writeFileSync(fullPath, content);
                console.log(`Modified ${fullPath}`);
            }
        }
    }
}

processDirectory(path.join(__dirname, 'packages', 'studio', 'src'));
processDirectory(path.join(__dirname, 'packages', 'builder', 'src'));
processDirectory(path.join(__dirname, 'packages', 'data_import_export', 'src'));
processDirectory(path.join(__dirname, 'app'));
processDirectory(path.join(__dirname, 'website-astro', 'src'));

console.log("Done reverting CMS prefixes on remaining packages.");
