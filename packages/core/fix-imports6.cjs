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
    'CMSEntityCollection',
    'CMSProperty',
    'CMSProperties',
    'CMSArrayProperty',
    'CMSMapProperty',
    'CMSStringProperty',
    'CMSNumberProperty',
    'CMSBooleanProperty',
    'CMSDateProperty',
    'CMSGeopointProperty',
    'CMSReferenceProperty',
    'CMSRelationProperty',
    'CMSBaseProperty'
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

            // Simple search and replace CMSCMSSomething that could happen from running regex twice
            content = content.replace(/CMSCMSEntityCollection/g, 'CMSEntityCollection');
            content = content.replace(/CMSCMSProperty/g, 'CMSProperty');

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

            if (extraTypesToImport.size > 0) {
                const arr = Array.from(extraTypesToImport);
                content = `import type { ${arr.join(', ')} } from "@rebasepro/types/cms";\n` + content;
            }

            if (content !== original) {
                // Ensure no double newlines around replaced imports
                content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
                fs.writeFileSync(file, content, 'utf8');
            }
        }
    }
}

processPath(path.join(__dirname, 'src'));
console.log("Fix6 done");
