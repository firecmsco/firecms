import { promises as fs } from "fs";
import path from "path";
import chokidar from "chokidar";
import {
    EntityCollection,
    NumberProperty,
    Properties,
    Property,
    ReferenceProperty,
    StringProperty
} from "@firecms/types";

// --- Helper Functions ---

/**
 * Formats text with ANSI escape codes for terminal display
 * @param text The text to format
 * @param options Formatting options
 * @returns Formatted string with ANSI codes
 */
const formatTerminalText = (text: string, options: {
    bold?: boolean;
    backgroundColor?: "blue" | "green" | "red" | "yellow" | "cyan" | "magenta";
    textColor?: "white" | "black" | "red" | "green" | "yellow" | "blue" | "magenta" | "cyan";
} = {}): string => {
    let codes = "";

    if (options.bold) codes += "\x1b[1m";

    // Background colors
    if (options.backgroundColor) {
        const bgColors = {
            blue: "\x1b[44m",
            green: "\x1b[42m",
            red: "\x1b[41m",
            yellow: "\x1b[43m",
            cyan: "\x1b[46m",
            magenta: "\x1b[45m"
        } as const;
        codes += bgColors[options.backgroundColor];
    }

    // Text colors
    if (options.textColor) {
        const textColors = {
            white: "\x1b[37m",
            black: "\x1b[30m",
            red: "\x1b[31m",
            green: "\x1b[32m",
            yellow: "\x1b[33m",
            blue: "\x1b[34m",
            magenta: "\x1b[35m",
            cyan: "\x1b[36m"
        } as const;
        codes += textColors[options.textColor];
    }

    return `${codes}${text}\x1b[0m`;
};

/**
 * Converts a camelCase or PascalCase string to snake_case.
 * @param str The string to convert.
 * @returns The snake_cased string.
 */
const toSnakeCase = (str: string): string => {
    if (!str) return "";
    return str.replace(/[A-Z]/g, (letter, index) =>
        index === 0 ? letter.toLowerCase() : `_${letter.toLowerCase()}`
    );
};

/**
 * Generates a Drizzle-friendly variable name from a table name.
 * @param tableName The name of the table.
 * @returns A variable-safe name in camelCase.
 */
const getTableVarName = (tableName: string): string => {
    // Convert snake_case to camelCase for table variable names
    return tableName.replace(/_([a-z])/g, (_, char) => char.toUpperCase());
};

/**
 * Converts table name and property name to camelCase enum variable name
 * @param tableName The name of the table.
 * @param propName The property name.
 * @returns A camelCase enum variable name.
 */
const getEnumVarName = (tableName: string, propName: string): string => {
    const tableVar = getTableVarName(tableName);
    const propVar = propName.charAt(0).toUpperCase() + propName.slice(1);
    return `${tableVar}${propVar}`;
};

/**
 * Resolve a target value that can be a string or a function returning an EntityCollection
 */
const resolveTargetTableName = (target: string | (() => EntityCollection)): string => {
    if (typeof target === "function") {
        const col = target();
        return col.dbPath ?? col.name ?? "";
    }
    return target;
};

/**
 * Resolve a junction table which can be a string or a function returning an EntityCollection
 */
const resolveJunctionTableName = (table: string | (() => EntityCollection)): string => {
    if (typeof table === "function") {
        const col = table();
        return col.dbPath ?? col.name ?? "";
    }
    return table;
};

/**
 * Generates Drizzle column definitions for junction keys.
 * @param keys The key or keys (string or array of strings).
 * @param tableVarName The variable name of the target table.
 * @param refOptions Relation options.
 * @returns An array of Drizzle column definition strings.
 */
const getJunctionKeyColumns = (keys: string | string[], tableVarName: string, refOptions: string): string[] => {
    const keyArray = Array.isArray(keys) ? keys : [keys];
    return keyArray.map(key =>
        `	${key}: integer("${toSnakeCase(key)}").references(() => ${getTableVarName(tableVarName)}.id, ${refOptions}).notNull()`
    );
};

/**
 * Maps a FireCMS Property to a Drizzle column definition string.
 * @param propName The name of the property.
 * @param prop The FireCMS property configuration.
 * @param collection The parent entity collection.
 * @returns A string representing the Drizzle column.
 */
const getDrizzleColumn = (propName: string, prop: Property, collection: EntityCollection): string => {
    const colName = toSnakeCase(propName);
    const collectionPath = collection.dbPath ?? collection.name ?? "";
    let columnDefinition: string;

    switch (prop.type) {
        case "string": {
            const stringProp = prop as StringProperty;
            if (stringProp.enum) {
                const enumName = getEnumVarName(collectionPath, propName);
                columnDefinition = `${enumName}("${colName}")`;
            } else {
                columnDefinition = `varchar("${colName}")`;
            }
            break;
        }
        case "number": {
            const numProp = prop as NumberProperty;
            if (numProp.enum) {
                const enumName = getEnumVarName(collectionPath, propName);
                columnDefinition = `${enumName}("${colName}")`;
            } else {
                columnDefinition = numProp.validation?.integer ? `integer("${colName}")` : `numeric("${colName}")`;
            }
            break;
        }
        case "boolean":
            columnDefinition = `boolean("${colName}")`;
            break;
        case "date":
            columnDefinition = `timestamp("${colName}", { withTimezone: true, mode: 'string' })`;
            break;
        case "map":
            columnDefinition = `jsonb("${colName}")`;
            break;
        case "reference": {
            const refProp = prop as ReferenceProperty;
            // ensure we have a path or a target function
            if (!refProp.path && typeof (refProp as any).target !== "function") return "";
            // resolve target collection to inspect its idField type
            const targetCollection: EntityCollection =
                typeof (refProp as any).target === "function"
                    ? (refProp as any).target()
                    : {} as EntityCollection;
            const idField = targetCollection.idField ?? "id";
            const idProp = targetCollection.properties?.[idField] as Property | undefined;
            const isNumberId = idProp?.type === "number";
            const baseColumn = isNumberId ? `integer("${colName}")` : `varchar("${colName}")`;
            const targetTableName = resolveTargetTableName(refProp.path ?? (refProp as any).target);
            const targetTableVar = getTableVarName(targetTableName);
            const refOptions = (prop as any).validation?.required
                ? "{ onDelete: \"cascade\" }"
                : "{ onDelete: \"set null\" }";
            columnDefinition = `${baseColumn}.references(() => ${targetTableVar}.${idField}, ${refOptions})`;
            break;
        }
        case "array":
            return ""; // Handled as separate tables
        default:
            return "";
    }

    if ((prop as any).validation?.required) {
        columnDefinition += ".notNull()";
    }

    return `${propName}: ${columnDefinition}`;
};

// --- Main Schema Generation Logic ---

/**
 * Generates the full Drizzle schema from an array of FireCMS collections.
 * @param collections The array of EntityCollection configurations.
 * @param outputPath Optional path to write the generated file.
 */
const generateSchema = async (collections: EntityCollection[], outputPath?: string) => {
    let schemaContent = "// This file is auto-generated by the FireCMS Drizzle generator. Do not edit manually.\n\n";
    schemaContent += "import { pgTable, integer, varchar, boolean, timestamp, jsonb, pgEnum, numeric, foreignKey, index } from \"drizzle-orm/pg-core\";\n";
    schemaContent += "import { sql } from \"drizzle-orm\";\n";
    schemaContent += "import { relations } from \"drizzle-orm\";\n\n";

    const relationsToGenerate: { tableVarName: string; relations: string[] }[] = [];
    const allTables = new Map<string, string>(); // tableName -> tableVarName
    const junctionTables: string[] = []; // Track junction tables for many-to-many

    // 1. Generate Enums
    collections.forEach(collection => {
        const collectionPath = collection.dbPath ?? collection.name ?? "";
        Object.entries(collection.properties ?? {}).forEach(([propName, prop]) => {
            const property = prop as Property;
            if ((property.type === "string" || property.type === "number") && (property as any).enum) {
                const enumVarName = getEnumVarName(collectionPath, propName);
                const enumDbName = `${collectionPath}_${toSnakeCase(propName)}`;
                const values = Array.isArray((property as any).enum)
                    ? (property as any).enum.map((v: any) => String(v.id))
                    : Object.keys((property as any).enum);
                if (values.length > 0) {
                    schemaContent += `export const ${enumVarName} = pgEnum("${enumDbName}", [${values.map((v: any) => `'${v}'`).join(", ")}]);\n`;
                }
            }
        });
    });
    schemaContent += "\n\n";

    // 2. Generate Junction Tables for Many-to-Many Relations
    collections.forEach(collection => {
        if (collection.relations) {
            Object.entries(collection.relations).forEach(([, relation]) => {
                if (relation.type === "manyToMany") {
                    try {
                        const junctionTableName = resolveJunctionTableName(relation.through.table as any);
                        const junctionTableVarName = getTableVarName(junctionTableName);

                        if (!junctionTables.includes(junctionTableName)) {
                            junctionTables.push(junctionTableName);

                            // Get source and target collection info
                            const sourceCollection = collection;
                            const targetTableName = resolveTargetTableName(relation.target as any);
                            const sourceTableName = sourceCollection.dbPath ?? sourceCollection.name ?? "";
                            const sourceRefOptions: string[] = [];
                            if (relation.through.onSourceDelete) sourceRefOptions.push(`onDelete: "${relation.through.onSourceDelete}"`);
                            const targetRefOptions: string[] = [];
                            if (relation.through.onTargetDelete) targetRefOptions.push(`onDelete: "${relation.through.onTargetDelete}"`);

                            const sourceRefOptionsString = `{ ${sourceRefOptions.join(", ")} }`;
                            const targetRefOptionsString = `{ ${targetRefOptions.join(", ")} }`;

                            const sourceJunctionColumns = getJunctionKeyColumns(relation.through.sourceJunctionKey, sourceTableName, sourceRefOptionsString);
                            const targetJunctionColumns = getJunctionKeyColumns(relation.through.targetJunctionKey, targetTableName, targetRefOptionsString);

                            schemaContent += `export const ${junctionTableVarName} = pgTable("${junctionTableName}", {\n`;
                            schemaContent += "	id: integer().primaryKey().notNull(),\n";
                            schemaContent += `${sourceJunctionColumns.join(",\n")},\n`;
                            schemaContent += `${targetJunctionColumns.join("\n")}\n`;
                            schemaContent += "});\n\n";
                        }
                    } catch (e) {
                        console.warn("Could not generate junction table for relation manyToMany:", e);
                    }
                }
            });
        }
    });

    // 3. Generate Main Collection Tables
    for (const collection of collections) {
        const tableName = collection.dbPath ?? collection.name;
        if (!tableName) continue;
        const tableVarName = getTableVarName(tableName);
        allTables.set(tableName, tableVarName);

        schemaContent += `export const ${tableVarName} = pgTable("${tableName}", {\n`;
        schemaContent += "\tid: integer().primaryKey().notNull()";

        const columns: string[] = [];
        Object.entries(collection.properties ?? {}).forEach(([propName, prop]) => {
            if (propName === "id") return;
            const columnString = getDrizzleColumn(propName, prop as Property, collection);
            if (columnString) columns.push(`\t${columnString}`);
        });

        // Process reference fields from relations
        if (collection.relations) {
            Object.entries(collection.relations).forEach(([, relation]) => {
                if (relation.type === "one" && relation.sourceFields && relation.targetFields) {
                    const refOptionsParts: string[] = [];
                    if (relation.onUpdate) refOptionsParts.push(`onUpdate: "${relation.onUpdate}"`);
                    if (relation.onDelete) refOptionsParts.push(`onDelete: "${relation.onDelete}"`);
                    const refOptions = refOptionsParts.length > 0 ? `{ ${refOptionsParts.join(", ")} }` : "{}";
                    // For one() relations, add the foreign key columns if they're not already in properties
                    relation.sourceFields.forEach((fieldName) => {
                        if (!collection.properties?.[fieldName]) {
                            const targetTableName = resolveTargetTableName(relation.target as any);
                            const targetTableVarName = getTableVarName(targetTableName);
                            const isRequired = relation.validation?.required ?? false;
                            const columnDef = `integer("${toSnakeCase(fieldName)}").references(() => ${targetTableVarName}.id, ${refOptions})`;
                            const finalDef = isRequired ? `${columnDef}.notNull()` : columnDef;
                            columns.push(`	${fieldName}: ${finalDef}`);
                        }
                    });
                }
            });
        }

        if (columns.length > 0) {
            schemaContent += `,\n${columns.join(",\n")}`;
        }
        schemaContent += "\n\n});\n\n";
    }

    // 4. Generate Relations from the new relation system
    for (const collection of collections) {
        const tableName = collection.dbPath ?? collection.name;
        if (!tableName) continue;
        const tableVarName = getTableVarName(tableName);
        const tableRelations: string[] = [];

        // Process relations defined in the collection.relations object
        if (collection.relations) {
            Object.entries(collection.relations).forEach(([relationKey, relation]) => {
                try {
                    if (relation.type === "one") {
                        // Generate one() relation
                        if (relation.sourceFields && relation.targetFields) {
                            const targetTableName = resolveTargetTableName(relation.target as any);
                            const targetTableVarName = getTableVarName(targetTableName);
                            const fieldsStr = relation.sourceFields.map(f => `${tableVarName}.${f}`).join(", ");
                            const referencesStr = relation.targetFields.map(r => `${targetTableVarName}.${r}`).join(", ");

                            if (relation.relationName) {
                                tableRelations.push(`\t${relationKey}: one(${targetTableVarName}, {\n\t\tfields: [${fieldsStr}],\n\t\treferences: [${referencesStr}],\n\t\trelationName: "${relation.relationName}"\n\t})`);
                            } else {
                                tableRelations.push(`\t${relationKey}: one(${targetTableVarName}, {\n\t\tfields: [${fieldsStr}],\n\t\treferences: [${referencesStr}]\n\t})`);
                            }
                        }
                    } else if (relation.type === "many") {
                        // Generate many() relation
                        const targetTableName = resolveTargetTableName(relation.target as any);
                        const targetTableVarName = getTableVarName(targetTableName);

                        if (relation.relationName) {
                            tableRelations.push(`\t${relationKey}: many(${targetTableVarName}, { relationName: "${relation.relationName}" })`);
                        } else {
                            tableRelations.push(`\t${relationKey}: many(${targetTableVarName})`);
                        }
                    } else if (relation.type === "manyToMany") {
                        // Generate many-to-many relation
                        const junctionTableName = resolveJunctionTableName(relation.through.table as any);
                        const junctionTableVarName = getTableVarName(junctionTableName);

                        if (relation.relationName) {
                            tableRelations.push(`\t${relationKey}: many(${junctionTableVarName}, { relationName: "${relation.relationName}" })`);
                        } else {
                            tableRelations.push(`\t${relationKey}: many(${junctionTableVarName})`);
                        }
                    }
                } catch (e) {
                    console.warn(`Could not generate relation ${relationKey}:`, e);
                }
            });
        }

        // Also process legacy reference properties for backward compatibility
        Object.entries(collection.properties as Properties ?? {}).forEach(([propName, prop]) => {
            if ((prop as any).type === "reference") {
                const refProp = prop as ReferenceProperty;
                if (refProp.path) {
                    const targetTableVarName = getTableVarName(refProp.path);
                    // Only add if not already handled by the new relations system
                    const existingRelation = collection.relations && Object.values(collection.relations).find(rel =>
                        rel.type === "one" && rel.sourceFields?.includes(propName)
                    );
                    if (!existingRelation) {
                        tableRelations.push(`\t${propName}: one(${targetTableVarName}, {\n\t\tfields: [${tableVarName}.${propName}],\n\t\treferences: [${targetTableVarName}.id]\n\t})`);
                    }
                }
            }
        });

        if (tableRelations.length > 0) {
            relationsToGenerate.push({
                tableVarName,
                relations: tableRelations
            });
        }
    }

    // 5. Generate Junction Table Relations for Many-to-Many
    junctionTables.forEach(junctionTableName => {
        const junctionTableVarName = getTableVarName(junctionTableName);
        const junctionRelations: string[] = [];

        // Find collections that use this junction table
        collections.forEach(collection => {
            if (collection.relations) {
                Object.entries(collection.relations).forEach(([, relation]) => {
                    if (relation.type === "manyToMany") {
                        const currentJunctionTableName = resolveJunctionTableName(relation.through.table as any);

                        if (currentJunctionTableName === junctionTableName) {
                            const sourceTableName = collection.dbPath ?? collection.name ?? "";
                            const targetTableName = resolveTargetTableName(relation.target as any);
                            const sourceKeys = Array.isArray(relation.through.sourceJunctionKey) ? relation.through.sourceJunctionKey : [relation.through.sourceJunctionKey];
                            sourceKeys.forEach(key => {
                                junctionRelations.push(`	${key}: one(${sourceTableName}, {\n		fields: [${junctionTableVarName}.${key}],\n		references: [${sourceTableName}.id]\n	})`);
                            });

                            const targetKeys = Array.isArray(relation.through.targetJunctionKey) ? relation.through.targetJunctionKey : [relation.through.targetJunctionKey];
                            targetKeys.forEach(key => {
                                junctionRelations.push(`	${key}: one(${targetTableName}, {\n		fields: [${junctionTableVarName}.${key}],\n		references: [${targetTableName}.id]\n	})`);
                            });
                        }
                    }
                });
            }
        });

        if (junctionRelations.length > 0) {
            relationsToGenerate.push({
                tableVarName: junctionTableVarName,
                relations: junctionRelations
            });
        }
    });

    // Generate all Relations
    relationsToGenerate.forEach(({
                                     tableVarName,
                                     relations
                                 }) => {
        const relationStr = relations.join(",\n");
        schemaContent += `export const ${tableVarName}Relations = relations(${tableVarName}, {\n${relationStr}\n});\n\n`;
    });

    // Write to output file or console
    if (outputPath) {
        const outputDir = path.dirname(outputPath);
        await fs.mkdir(outputDir, { recursive: true });
        await fs.writeFile(outputPath, schemaContent);
        console.log("✅ Drizzle schema generated successfully at", outputPath);
    } else {
        console.log("✅ Drizzle schema generated successfully. Output:\n");
        console.log(schemaContent);
    }

    console.log(`You can now run ${formatTerminalText("pnpm db:generate", {
        bold: true,
        backgroundColor: "blue",
        textColor: "black"
    })} to generate the SQL migration files.`);
};

// --- Execution and Watch Logic ---

const runGeneration = async (collectionsFilePath?: string) => {
    try {
        if (!collectionsFilePath) {
            console.error("Error: No collections file path provided. Skipping schema generation.");
            return;
        }

        // Convert to file:// URL for ES module import
        const resolvedPath = path.resolve(collectionsFilePath);
        const fileUrl = `file://${resolvedPath}?t=${Date.now()}`;

        const imported = await import(fileUrl);
        const collections = imported.backendCollections || imported.collections;

        if (!collections || !Array.isArray(collections)) {
            console.error("Error: Could not find 'backendCollections' or 'collections' array export in the provided file.");
            return;
        }

        await generateSchema(collections);
    } catch (error) {
        console.error("Error generating schema:", error);
    }
};

const main = () => {
    const collectionsFilePathArg = process.argv.find(arg => arg.startsWith("--collections="));
    const collectionsFilePath = collectionsFilePathArg ? collectionsFilePathArg.split("=")[1] : process.argv[2];
    const watch = process.argv.includes("--watch");

    if (!collectionsFilePath) {
        console.log("Usage: ts-node generate-drizzle-schema.ts <path-to-collections-file> [--watch]");
        return;
    }

    const resolvedPath = path.resolve(process.cwd(), collectionsFilePath);

    if (watch) {
        console.log(`Watching for changes in ${resolvedPath}...`);
        const watcher = chokidar.watch(resolvedPath, {
            persistent: true,
            ignoreInitial: false // Run on start
        });

        watcher.on("all", (event, filePath) => {
            console.log(`[${event}] ${filePath}. Regenerating schema...`);
            runGeneration(resolvedPath);
        });
    } else {
        runGeneration(resolvedPath);
    }
};

// Check if this module is being run directly (ES module equivalent of require.main === module)
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}
