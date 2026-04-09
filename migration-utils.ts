import { Project, SyntaxKind, StringLiteral } from "ts-morph";
import * as fs from "fs";
import * as path from "path";

const project = new Project({
    tsConfigFilePath: "tsconfig.json",
});

const utilsToExtract = [
    "strings", "objects", "arrays", "dates", "hash", "regexp", "flatten_object", "plurals", "os", "names", "fields"
];

// 1. Move files
console.log("Moving files...");
for (const util of utilsToExtract) {
    const srcPath = `packages/common/src/util/${util}.ts`;
    const destPath = `packages/utils/src/${util}.ts`;
    if (fs.existsSync(srcPath)) {
        fs.renameSync(srcPath, destPath);
        console.log(`Moved ${srcPath} to ${destPath}`);
    }
}

// Write the utils index.ts
let utilsIndexContent = "";
for (const util of utilsToExtract) {
    utilsIndexContent += `export * from "./${util}";\n`;
}
fs.writeFileSync("packages/utils/src/index.ts", utilsIndexContent);
console.log("Created packages/utils/src/index.ts");

// 2. Discover exported symbols from @rebasepro/utils
const utilsProject = new Project();
const utilsIndexFile = utilsProject.addSourceFileAtPath("packages/utils/src/index.ts");
// Wait, we need to add the actual files to get their exports
for (const util of utilsToExtract) {
    utilsProject.addSourceFileAtPath(`packages/utils/src/${util}.ts`);
}

const utilsExportedSymbols = new Set<string>();
for (const util of utilsToExtract) {
    const file = utilsProject.getSourceFileOrThrow(`packages/utils/src/${util}.ts`);
    const exportedDeclarations = file.getExportedDeclarations();
    for (const [name] of exportedDeclarations) {
        utilsExportedSymbols.add(name);
    }
}
console.log(`Discovered ${utilsExportedSymbols.size} exported symbols from @rebasepro/utils.`);

// 3. Update packages that import from "@rebasepro/common"
console.log("Updating imports across the project...");
const sourceFiles = project.getSourceFiles();

let updatedCount = 0;

for (const sourceFile of sourceFiles) {
    const importDeclarations = sourceFile.getImportDeclarations();
    let fileChanged = false;

    for (const importDecl of importDeclarations) {
        const moduleSpecifier = importDecl.getModuleSpecifierValue();
        
        // Handle common package imports
        if (moduleSpecifier === "@rebasepro/common" || moduleSpecifier === "../../index" /* assuming from common but usually these are absolute or within same package */) {
            if (moduleSpecifier !== "@rebasepro/common") continue; // Keep it simple for now
            
            const namedImports = importDecl.getNamedImports();
            const commonImports: string[] = [];
            const utilImports: string[] = [];

            for (const namedImport of namedImports) {
                const name = namedImport.getName();
                if (utilsExportedSymbols.has(name)) {
                    utilImports.push(namedImport.getText());
                } else {
                    commonImports.push(namedImport.getText());
                }
            }

            if (utilImports.length > 0) {
                fileChanged = true;
                // Add new import for utils
                sourceFile.addImportDeclaration({
                    moduleSpecifier: "@rebasepro/utils",
                    namedImports: utilImports,
                });

                // Update or remove common import
                if (commonImports.length === 0) {
                    importDecl.remove();
                } else {
                    // Update existing
                    importDecl.removeNamedImports();
                    importDecl.addNamedImports(commonImports);
                }
            }
        }
    }

    if (fileChanged) {
        sourceFile.saveSync();
        updatedCount++;
    }
}

// 4. Update packages/common/src/util/index.ts
const commonUtilIndex = project.getSourceFileOrThrow("packages/common/src/util/index.ts");
const exports = commonUtilIndex.getExportDeclarations();
for (const exp of exports) {
    const moduleSpecifier = exp.getModuleSpecifierValue();
    if (moduleSpecifier && utilsToExtract.includes(moduleSpecifier.replace("./", ""))) {
        exp.remove();
    }
}
commonUtilIndex.saveSync();
console.log("Updated packages/common/src/util/index.ts");

console.log(`Finished updating ${updatedCount} files.`);
