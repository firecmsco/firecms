import { Project } from "ts-morph";
import * as path from "path";

const project = new Project({ tsConfigFilePath: "tsconfig.json" });

const movedFiles = [
    ...project.addSourceFilesAtPaths("packages/cms/src/hooks/navigation/**/*.ts"),
    ...project.addSourceFilesAtPaths("packages/cms/src/hooks/navigation/**/*.tsx"),
    ...project.addSourceFilesAtPaths("packages/cms/src/components/HomePage/**/*.tsx"),
    ...project.addSourceFilesAtPaths("packages/cms/src/components/HomePage/**/*.ts"),
    project.addSourceFileAtPathIfExists("packages/cms/src/components/FieldCaption.tsx"),
    project.addSourceFileAtPathIfExists("packages/cms/src/components/SideDialogs.tsx"),
    project.addSourceFileAtPathIfExists("packages/cms/src/contexts/SideDialogsControllerContext.tsx"),
].filter(Boolean);

console.log(`Loaded ${movedFiles.length} moved files.`);

// Replace internal relative imports pointing back to core logic to be absolute "@rebasepro/core"
for (const file of movedFiles) {
    let changed = false;
    for (const imp of file.getImportDeclarations()) {
        const mod = imp.getModuleSpecifierValue();
        if (mod.startsWith(".")) {
            // Very simple heuristic: if it goes up more than one level, it likely left the moved folder and is pointing to core
            if (mod.includes("../..") || mod.includes("../../../")) {
                const namedImports = imp.getNamedImports().map(i => i.getName());
                // We assume it's now pointing to core exports
                imp.remove();
                file.addImportDeclaration({
                    moduleSpecifier: "@rebasepro/core",
                    namedImports: namedImports
                });
                changed = true;
            }
        }
    }
    if (changed) file.saveSync();
}

console.log("Fixed relative imports inside moved files.");

