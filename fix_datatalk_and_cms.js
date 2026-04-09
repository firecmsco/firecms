const fs = require('fs');

// 1. Export in components index
let compIndex = fs.readFileSync('packages/cms/src/components/index.ts', 'utf8');
if (!compIndex.includes('useApp')) {
    compIndex += '\nexport * from "./app/useApp";\n';
    fs.writeFileSync('packages/cms/src/components/index.ts', compIndex);
}

// 2. Export in cms index
let cmsIndex = fs.readFileSync('packages/cms/src/index.ts', 'utf8');
if (!cmsIndex.includes('useApp,')) {
    cmsIndex = cmsIndex.replace('SideDialogs,', 'SideDialogs,\n    useApp,');
    fs.writeFileSync('packages/cms/src/index.ts', cmsIndex);
}

// 3. Fix DataTalkDrawer
let drawer = fs.readFileSync('packages/datatalk/src/components/DataTalkDrawer.tsx', 'utf8');
drawer = drawer.replace(
    'import { useApp, useUrlController } from "@rebasepro/core";',
    'import { useApp, useUrlController } from "@rebasepro/cms";'
);
fs.writeFileSync('packages/datatalk/src/components/DataTalkDrawer.tsx', drawer);

// 4. Fix QueryTableResults
let queryResults = fs.readFileSync('packages/datatalk/src/components/QueryTableResults.tsx', 'utf8');
queryResults = queryResults.replace(
    /import \{\s*OnCellValueChange,\s*useAuthController,\s*useCustomizationController,\s*useCollectionRegistryController\s*\} from "@rebasepro\/core";/m,
    `import {
    OnCellValueChange,
    useAuthController,
    useCustomizationController
} from "@rebasepro/core";
import { useCollectionRegistryController } from "@rebasepro/cms";`
);
fs.writeFileSync('packages/datatalk/src/components/QueryTableResults.tsx', queryResults);

// 5. Fix DataTalkRoutes
let routes = fs.readFileSync('packages/datatalk/src/DataTalkRoutes.tsx', 'utf8');
routes = routes.replace(
    'import { useCollectionRegistryController } from "@rebasepro/core";',
    'import { useCollectionRegistryController } from "@rebasepro/cms";'
);
fs.writeFileSync('packages/datatalk/src/DataTalkRoutes.tsx', routes);

