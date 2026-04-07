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
    'SlotComponentProps',
    'CMSView',
    'CMSViewsBuilder',
    'DialogControllerEntryProps',
    'DialogsController',
    'EffectiveRoleController',
    'EntitySidePanelProps',
    'FormContext',
    'HomePageSection',
    'NavigateOptions',
    'NavigationEntry',
    'NavigationGroupMapping',
    'NavigationResult',
    'NavigationStateController',
    'PluginFieldBuilderParams',
    'PluginFormActionProps',
    'PluginGenericProps',
    'PropertyFieldBindingProps',
    'RebaseProps',
    'SideDialogPanelProps',
    'SideDialogsController',
    'SlotContribution',
    'SlotName',
    'SlotRegistry',
    'SnackbarMessageType',
    'CMSEntityCollection'
];

function processPath(dir) {
    const list = fs.readdirSync(dir);
    for (let file of list) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat.isDirectory()) {
            processPath(file);
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            let content = fs.readFileSync(file, 'utf8');
            let original = content;

            // Step 1: parse all "@rebasepro/types" imports.
            let importsFound = [];
            const importRegex = /import\s+type\s+\{([^}]+)\}\s+from\s+['"]@rebasepro\/types['"]/g;
            let m;
            while ((m = importRegex.exec(content)) !== null) {
                importsFound.push({ type: 'type', match: m[0], inner: m[1] });
            }
            const importRegex2 = /import\s+\{([^}]+)\}\s+from\s+['"]@rebasepro\/types['"]/g;
            while ((m = importRegex2.exec(content)) !== null) {
                importsFound.push({ type: 'normal', match: m[0], inner: m[1] });
            }

            let extraTypesToImport = new Set();
            for (let stmt of importsFound) {
                let types = stmt.inner.split(',').map(s => s.trim()).filter(Boolean);
                let newCoreTypes = [];
                for (let t of types) {
                    let baseType = t.replace('type ', '').trim();
                    if (CMS_TYPES.some(c => baseType === c || baseType.startsWith(c))) {
                        extraTypesToImport.add(t);
                    } else {
                        newCoreTypes.push(t);
                    }
                }
                
                if (newCoreTypes.length < types.length) {
                    let replacement = '';
                    if (newCoreTypes.length > 0) {
                        if (stmt.type === 'type') {
                            replacement = `import type { ${newCoreTypes.join(', ')} } from "@rebasepro/types"`;
                        } else {
                            replacement = `import { ${newCoreTypes.join(', ')} } from "@rebasepro/types"`;
                        }
                    }
                    content = content.replace(stmt.match, replacement);
                }
            }

            // Replace casting and property access with correct typing
            if (content.match(/([a-zA-Z0-9_]+)\.Field/g) || content.match(/([a-zA-Z0-9_]+)\.Preview/g)) {
                extraTypesToImport.add("PropertyConfig");
                content = content.replace(/([a-zA-Z0-9_]+)\.Field/g, '($1 as PropertyConfig).Field');
                content = content.replace(/([a-zA-Z0-9_]+)\!\.Field/g, '($1 as PropertyConfig)!.Field');
                content = content.replace(/([a-zA-Z0-9_]+)\?\.Field/g, '($1 as PropertyConfig)?.Field');

                content = content.replace(/([a-zA-Z0-9_]+)\.Preview/g, '($1 as PropertyConfig).Preview');
                content = content.replace(/([a-zA-Z0-9_]+)\!\.Preview/g, '($1 as PropertyConfig)!.Preview');
                content = content.replace(/([a-zA-Z0-9_]+)\?\.Preview/g, '($1 as PropertyConfig)?.Preview');
                // The above might break if "property" was used, e.g. "property as PropertyConfig.Field". We must wrap: "((property) as PropertyConfig).Field", but "$1" is safe string.
                // Re-replace it properly:
                content = content.replace(/\(\(([a-zA-Z0-9_]+)\) as PropertyConfig\)\.Field/g, '($1 as PropertyConfig).Field'); // prevent double
            }

            // For mapping functions
            if (content.match(/\(property as Property\)\.Field/g)) {
                extraTypesToImport.add("PropertyConfig");
                content = content.replace(/\(property as Property\)\.Field/g, '((property as Property) as PropertyConfig).Field');
                content = content.replace(/\(property as Property\)\.Preview/g, '((property as Property) as PropertyConfig).Preview');
            }

            // Actions mapping
            if (content.match(/([a-zA-Z0-9_]+)\.Actions/g)) {
                extraTypesToImport.add("CMSEntityCollection");
                content = content.replace(/([a-zA-Z0-9_]+)\.Actions/g, '($1 as CMSEntityCollection).Actions');
            }

            // collection.entityViews
            if (content.match(/([a-zA-Z0-9_]+)\.entityViews/g)) {
                extraTypesToImport.add("CMSEntityCollection");
                content = content.replace(/([a-zA-Z0-9_]+)\.entityViews/g, '($1 as CMSEntityCollection<any>).entityViews');
            }

            if (extraTypesToImport.size > 0) {
                const arr = Array.from(extraTypesToImport);
                content = `import type { ${arr.join(', ')} } from "@rebasepro/types/cms";\n` + content;
            }

            // Fix double wraps
            content = content.replace(/\(\(([a-zA-Z0-9_]+) as PropertyConfig\) as PropertyConfig\)/g, '($1 as PropertyConfig)');

            if (content !== original) {
                // Ensure no double newlines around replaced imports
                content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
                fs.writeFileSync(file, content, 'utf8');
            }
        }
    }
}

processPath(path.join(__dirname, 'src'));
console.log("Fix5 done");
