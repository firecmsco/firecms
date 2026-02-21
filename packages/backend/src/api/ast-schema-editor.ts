import { Project, SyntaxKind, ObjectLiteralExpression, PropertyAssignment, VariableDeclaration, IndentationText } from "ts-morph";
import * as path from "path";
import * as fs from "fs";

export class AstSchemaEditor {
    private project: Project;
    private collectionsDir: string;

    constructor(collectionsDir: string) {
        this.project = new Project({
            manipulationSettings: {
                indentationText: IndentationText.FourSpaces,
            }
        });
        if (fs.existsSync(collectionsDir)) {
            this.project.addSourceFilesAtPaths(`${collectionsDir}/**/*.ts`);
        }
        this.collectionsDir = collectionsDir;
    }

    private getCollectionFile(collectionId: string) {
        let file = this.project.getSourceFile(path.join(this.collectionsDir, `${collectionId}.ts`));
        if (!file && fs.existsSync(path.join(this.collectionsDir, `${collectionId}.ts`))) {
            this.project.addSourceFilesAtPaths(`${this.collectionsDir}/**/*.ts`);
            file = this.project.getSourceFile(path.join(this.collectionsDir, `${collectionId}.ts`));
        }
        return file;
    }

    private getCollectionObject(collectionId: string): ObjectLiteralExpression | null {
        const file = this.getCollectionFile(collectionId);
        if (!file) return null;

        const defaultExport = file.getDefaultExportSymbol();
        if (defaultExport) {
            const declaration = defaultExport.getDeclarations()[0];
            if (declaration && declaration.getKind() === SyntaxKind.ExportAssignment) {
                const expr = declaration.asKind(SyntaxKind.ExportAssignment)?.getExpression();
                if (expr && expr.getKind() === SyntaxKind.Identifier) {
                    const varName = expr.getText();
                    const varDecl = file.getVariableDeclaration(varName);
                    return varDecl?.getInitializerIfKind(SyntaxKind.ObjectLiteralExpression) || null;
                }
            }
        }
        // Fallback: Just get the first exported VariableDeclaration with an ObjectLiteral
        const varDecls = file.getVariableDeclarations();
        for (const varDecl of varDecls) {
            const init = varDecl.getInitializerIfKind(SyntaxKind.ObjectLiteralExpression);
            if (init) return init;
        }
        return null;
    }

    private convertJsonToAstString(obj: any, indentLevel: number = 0, oldAstNode?: ObjectLiteralExpression): string {
        const indent = "    ".repeat(indentLevel);
        const innerIndent = "    ".repeat(indentLevel + 1);

        if (obj === null || obj === undefined) {
            return "undefined";
        }
        if (typeof obj === "string") {
            return `"${obj.replace(/"/g, '\\"')}"`;
        }
        if (typeof obj === "number" || typeof obj === "boolean") {
            return String(obj);
        }
        if (Array.isArray(obj)) {
            if (obj.length === 0) return "[]";
            const items = obj.map(item => this.convertJsonToAstString(item, indentLevel + 1));
            return `[\n${innerIndent}${items.join(`,\n${innerIndent}`)}\n${indent}]`;
        }
        if (typeof obj === "object") {
            const keys = Object.keys(obj);

            // Collect preserved AST properties
            const preservedProps: string[] = [];
            if (oldAstNode) {
                const oldProps = oldAstNode.getProperties();
                for (const oldProp of oldProps) {
                    if (oldProp.isKind(SyntaxKind.PropertyAssignment)) {
                        const nameNode = oldProp.getNameNode();
                        let name = nameNode.getText();
                        if (name.startsWith('"') && name.endsWith('"')) name = name.slice(1, -1);
                        if (name.startsWith("'") && name.endsWith("'")) name = name.slice(1, -1);

                        // If the JSON object doesn't have this key, check if we should preserve it
                        if (!(name in obj)) {
                            const init = oldProp.getInitializer();
                            if (init) {
                                const kind = init.getKind();
                                const isCode = kind === SyntaxKind.ArrowFunction ||
                                    kind === SyntaxKind.FunctionExpression ||
                                    kind === SyntaxKind.Identifier ||
                                    kind === SyntaxKind.CallExpression ||
                                    kind === SyntaxKind.JsxElement;

                                if (isCode || name === "target" || name === "callbacks" || name === "permissions") {
                                    // Preserve this property exactly as it was
                                    const keyStr = /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name) ? name : `"${name}"`;
                                    preservedProps.push(`${keyStr}: ${init.getText()}`);
                                }
                            }
                        }
                    }
                }
            }

            if (keys.length === 0 && preservedProps.length === 0) return "{}";

            const props = keys.map(key => {
                const keyStr = /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key) ? key : `"${key}"`;

                // If the value is an object, pass the old AST node to recurse
                let childAstNode: ObjectLiteralExpression | undefined;
                if (oldAstNode && typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {
                    const oldProp = oldAstNode.getProperty(
                        (p: any) => p.getName && (p.getName() === key || p.getName() === `"${key}"` || p.getName() === `'${key}'`)
                    );
                    if (oldProp && oldProp.isKind(SyntaxKind.PropertyAssignment)) {
                        childAstNode = oldProp.getInitializerIfKind(SyntaxKind.ObjectLiteralExpression);
                    }
                }

                return `${keyStr}: ${this.convertJsonToAstString(obj[key], indentLevel + 1, childAstNode)}`;
            });

            const allProps = [...props, ...preservedProps];
            return `{\n${innerIndent}${allProps.join(`,\n${innerIndent}`)}\n${indent}}`;
        }
        return "undefined";
    }

    public async saveProperty(collectionId: string, propertyKey: string, propertyConfig: any) {
        const collectionObj = this.getCollectionObject(collectionId);
        if (!collectionObj) throw new Error(`Collection ${collectionId} not found in ATS workspace.`);

        let propertiesProp = collectionObj.getProperty("properties") as PropertyAssignment;
        if (!propertiesProp) {
            propertiesProp = collectionObj.addPropertyAssignment({
                name: "properties",
                initializer: "{}"
            });
        }

        const propsObj = propertiesProp.getInitializerIfKind(SyntaxKind.ObjectLiteralExpression);
        if (propsObj) {
            let existingProp = propsObj.getProperty(
                (p: any) => p.getName && (p.getName() === propertyKey || p.getName() === `"${propertyKey}"`)
            );

            let oldPropAstNode: ObjectLiteralExpression | undefined;
            if (existingProp && existingProp.isKind(SyntaxKind.PropertyAssignment)) {
                oldPropAstNode = existingProp.getInitializerIfKind(SyntaxKind.ObjectLiteralExpression);
            }

            const newInitializer = this.convertJsonToAstString(propertyConfig, 2, oldPropAstNode);

            if (existingProp) {
                if (existingProp.isKind(SyntaxKind.PropertyAssignment)) {
                    existingProp.setInitializer(newInitializer);
                }
            } else {
                propsObj.addPropertyAssignment({
                    name: /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(propertyKey) ? propertyKey : `"${propertyKey}"`,
                    initializer: newInitializer
                });
            }

            await this.project.save();
        }
    }

    public async deleteProperty(collectionId: string, propertyKey: string) {
        const collectionObj = this.getCollectionObject(collectionId);
        if (!collectionObj) return;

        const propertiesProp = collectionObj.getProperty("properties") as PropertyAssignment;
        if (propertiesProp) {
            const propsObj = propertiesProp.getInitializerIfKind(SyntaxKind.ObjectLiteralExpression);
            if (propsObj) {
                const existingProp = propsObj.getProperty(
                    (p: any) => p.getName && (p.getName() === propertyKey || p.getName() === `"${propertyKey}"`)
                );
                if (existingProp) {
                    existingProp.remove();
                    await this.project.save();
                }
            }
        }
    }

    public async saveCollection(collectionId: string, collectionData: any) {
        let file = this.getCollectionFile(collectionId);
        let collectionObj = this.getCollectionObject(collectionId);

        if (!file || !collectionObj) {
            // Create a new file
            const newFilePath = path.join(this.collectionsDir, `${collectionId}.ts`);
            file = this.project.createSourceFile(newFilePath, `import { EntityCollection } from "@firecms/types";\n\nconst ${collectionId}Collection: EntityCollection = ${this.convertJsonToAstString(collectionData)};\n\nexport default ${collectionId}Collection;\n`, { overwrite: true });
        } else {
            // Update root level properties gracefully
            for (const key of Object.keys(collectionData)) {
                if (key === "relations" || key === "customId") continue; // Kept via other AST functions or handled separately.

                let prop = collectionObj.getProperty(key) as PropertyAssignment;

                let oldAstNode: ObjectLiteralExpression | undefined;
                if (prop && prop.isKind(SyntaxKind.PropertyAssignment)) {
                    oldAstNode = prop.getInitializerIfKind(SyntaxKind.ObjectLiteralExpression);
                }

                const newInit = this.convertJsonToAstString(collectionData[key], 1, oldAstNode);
                if (prop) {
                    prop.setInitializer(newInit);
                } else {
                    collectionObj.addPropertyAssignment({
                        name: key,
                        initializer: newInit
                    });
                }
            }
        }
        await this.project.save();
    }

    public async deleteCollection(collectionId: string) {
        const file = this.getCollectionFile(collectionId);
        if (file) {
            file.deleteImmediatelySync();
        }
    }
}
