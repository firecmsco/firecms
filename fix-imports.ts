import { Project, SourceFile } from "ts-morph";
import * as path from "path";

const project = new Project({ tsConfigFilePath: "packages/cms/tsconfig.json" });

project.addSourceFilesAtPaths("packages/cms/src/**/*.tsx");
project.addSourceFilesAtPaths("packages/cms/src/**/*.ts");

const movedHooks = [
    "useSideEntityController",
    "useEntitySelectionDialog",
    "useBuildSideEntityController",
    "useResolvedNavigationFrom",
    "useEntityHistory",
    "useBuildCollectionRegistryController",
    "useBuildNavigationStateController",
    "useBuildUrlController",
    "useUrlController",
    "useNavigationStateController",
    "useCollectionRegistryController",
    "useResolvedCollections",
    "useResolvedViews",
    "useTopLevelNavigation",
    "useSideDialogsController",
    "useBreadcrumbsController"
];

const movedComponents = [
    "SideEntityProvider",
    "AdminModeSyncer",
    "RolesView",
    "UsersView",
    "AppBar",
    "Drawer",
    "Scaffold",
    "DefaultAppBar",
    "DefaultDrawer",
    "DrawerNavigationItem",
    "DrawerNavigationGroup",
    "EntitySidePanel",
    "ConfirmationDialog" // wait, ConfirmationDialog is in core!
];
const movedContexts = [
    "SideDialogsControllerContext",
    "CollectionRegistryContext",
    "NavigationStateContext",
    "UrlContext",
    "BreadcrumbsContext"
];

const allMoved = [...movedHooks, ...movedComponents, ...movedContexts].filter(c => c !== "ConfirmationDialog");

for (const file of project.getSourceFiles()) {
    let changed = false;
    for (const imp of file.getImportDeclarations()) {
        const mod = imp.getModuleSpecifierValue();
        if (mod === "@rebasepro/core") {
            const namedImports = imp.getNamedImports().map(i => i.getName());
            const hooksToMove = namedImports.filter(n => allMoved.includes(n));
            
            if (hooksToMove.length > 0) {
                // remove the moved ones from the core import
                const remaining = namedImports.filter(n => !allMoved.includes(n));
                if (remaining.length === 0) {
                    imp.remove();
                } else {
                    imp.getNamedImports().forEach(n => {
                        if (allMoved.includes(n.getName())) {
                            n.remove();
                        }
                    });
                }

                // add them from the local index
                const srcPath = path.resolve("packages/cms/src");
                const dirPath = path.dirname(file.getFilePath());
                let relPath = path.relative(dirPath, srcPath);
                if (relPath === "") relPath = ".";
                if (!relPath.startsWith(".")) relPath = "./" + relPath;

                file.addImportDeclaration({
                    namedImports: hooksToMove,
                    moduleSpecifier: relPath.replace(/\/$/, "") + "/index"
                });
                changed = true;
            }
        }
    }
    if (changed) file.saveSync();
}
