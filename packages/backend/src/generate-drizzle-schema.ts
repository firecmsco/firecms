import { promises as fs } from "fs";
import path from "path";
import chokidar from "chokidar";
import { EntityCollection, NumberProperty, Property, ReferenceProperty, StringProperty, } from "@firecms/types";
import {
    getEnumVarName,
    getTableName,
    getTableVarName,
    resolveJunctionTableName,
    resolveTargetTableName,
    toSnakeCase
} from "./utils/collection-utils";
import { resolveCollectionRelations } from "./utils/relations";

let loadedCollections: EntityCollection[] | undefined = [];

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
 * Generates Drizzle column definitions for junction keys.
 * @param targetCollection The target collection to reference.
 * @param tableVarName The variable name of the target table.
 * @param refOptions Relation options.
 * @returns An array of Drizzle column definition strings.
 */
const getJunctionKeyColumns = (keys: string | string[], targetCollection: EntityCollection, refOptions: string): string[] => {
    const keyArray = Array.isArray(keys) ? keys : [keys];
    const targetTableVar = getTableVarName(getTableName(targetCollection));
    const idField = targetCollection.idField ?? "id";
    const idProp = targetCollection.properties?.[idField] as Property | undefined;
    const isNumberId = idProp?.type === "number";
    const columnType = isNumberId ? "integer" : "varchar";

    return keyArray.map(key =>
        `\t${key}: ${columnType}("${toSnakeCase(key)}").references(() => ${targetTableVar}.${idField}, ${refOptions}).notNull()`
    );
};

const getDrizzleIdColumn = (collection: EntityCollection): string => {
    const idField = collection.idField ?? "id";
    const idProp = collection.properties?.[idField] as Property | undefined;

    if (collection.customId) {
        // User wants to provide their own IDs
        const isNumber = idProp?.type === "number";
        const idType = isNumber ? "integer" : "varchar";
        return `\t${idField}: ${idType}("${toSnakeCase(idField)}").primaryKey()`;
    } else {
        // Default to auto-incrementing serial IDs
        return `\t${idField}: serial("${toSnakeCase(idField)}").primaryKey()`;
    }
}

/**
 * Maps a FireCMS Property to a Drizzle column definition string.
 * @param propName The name of the property.
 * @param prop The FireCMS property configuration.
 * @param collection The parent entity collection.
 * @returns A string representing the Drizzle column.
 */
const getDrizzleColumn = (propName: string, prop: Property, collection: EntityCollection): string => {
    const colName = toSnakeCase(propName);
    const collectionPath = getTableName(collection);
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
        case "relation": {
            const refProp = prop as ReferenceProperty;
            if (refProp.relation?.type === "manyToMany") {
                return ""; // This is a virtual property for a many-to-many relation, handled by a junction table.
            }

            // ensure we have a path or a target function
            if (!refProp.path) return "";

            const collections = loadedCollections;
            if (!collections) {
                console.warn("Could not find loaded collections in global scope. Skipping reference type resolution.");
                return "";
            }

            const targetCollectionPath = resolveTargetTableName(refProp.path);
            const targetCollection = collections.find(c => getTableName(c) === targetCollectionPath);

            if (!targetCollection) {
                console.warn(`Could not find target collection with path ${targetCollectionPath}`);
                return `varchar("${colName}")`;
            }

            const idField = targetCollection.idField ?? "id";
            const idProp = targetCollection.properties?.[idField] as Property | undefined;

            const isNumberId = idProp?.type === "number" || (targetCollection.customId !== "optional" && !targetCollection.customId && typeof targetCollection.customId !== "object" && !idProp);

            const baseColumn = isNumberId ? `integer("${colName}")` : `varchar("${colName}")`;
            const targetTableName = resolveTargetTableName(refProp.path);
            const targetTableVar = getTableVarName(targetTableName);
            const refOptions = (prop ).validation?.required
                ? "{ onDelete: \"cascade\" }"
                : "{ onDelete: \"set null\" }";
            columnDefinition = `${baseColumn}.references(() => ${targetTableVar}.${idField}, ${refOptions})`;
            break;
        }
        case "array": {
            const arrayProp = prop as any;
            if (arrayProp.of?.type === "relation") {
                const refProp = arrayProp.of as ReferenceProperty;
                if (refProp.relation?.type === "manyToMany") {
                    return ""; // This is a virtual property for the relation, no column needed.
                }
            }
            columnDefinition = `jsonb("${colName}")`;
            break;
        }
        default:
            return "";
    }

    if ((prop ).validation?.required) {
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
    schemaContent += "import { primaryKey, pgTable, integer, varchar, boolean, timestamp, jsonb, pgEnum, numeric, foreignKey, index, serial } from \"drizzle-orm/pg-core\";\n";
    schemaContent += "import { relations as drizzleRelations } from \"drizzle-orm\";\n\n";

    const relationsToGenerate: { tableVarName: string; relations: string[] }[] = [];
    const allTables = new Map<string, string>(); // tableName -> tableVarName
    const junctionTables: string[] = []; // Track junction tables for many-to-many

    // Track aggregate exports
    const exportedEnumVars: string[] = [];
    const exportedTableVars: string[] = [];
    const exportedRelationVars: string[] = [];

    // 1. Generate Enums
    collections.forEach(collection => {
        const collectionPath = getTableName(collection);
        Object.entries(collection.properties ?? {}).forEach(([propName, prop]) => {
            const property = prop as Property;
            if ((property.type === "string" || property.type === "number") && (property ).enum) {
                const enumVarName = getEnumVarName(collectionPath, propName);
                const enumDbName = `${collectionPath}_${toSnakeCase(propName)}`;
                const values = Array.isArray((property ).enum)
                    ? (property ).enum.map((v: any) => String(v.id))
                    : Object.keys((property ).enum);
                if (values.length > 0) {
                    schemaContent += `export const ${enumVarName} = pgEnum("${enumDbName}", [${values.map((v: any) => `'${v}'`).join(", ")}]);\n`;
                    if (!exportedEnumVars.includes(enumVarName)) exportedEnumVars.push(enumVarName);
                }
            }
        });
    });
    schemaContent += "\n\n";

    // 2. Generate Junction Tables for Many-to-Many Relations
    collections.forEach(collection => {
        const resolvedRelations = resolveCollectionRelations(collection, collections);
        Object.entries(resolvedRelations).forEach(([, relation]) => {
            if (relation.type === "manyToMany") {
                try {
                    const sourceCollection = collection;
                    const targetCollection = relation.target();
                    const junctionTableName = resolveJunctionTableName(relation.through, sourceCollection, targetCollection);
                    const junctionTableVarName = getTableVarName(junctionTableName);

                    if (!junctionTables.includes(junctionTableName)) {
                        junctionTables.push(junctionTableName);

                        const sourceName = getTableName(sourceCollection);
                        const targetName = getTableName(targetCollection);

                        const sourceJunctionKey = relation.through?.sourceJunctionKey ?? `${toSnakeCase(sourceName)}_id`;
                        const targetJunctionKey = relation.through?.targetJunctionKey ?? `${toSnakeCase(targetName)}_id`;

                        // Get source and target collection info
                        const sourceRefOptions: string[] = [];
                        const onSourceDelete = relation.through?.onSourceDelete ?? "cascade";
                        sourceRefOptions.push(`onDelete: "${onSourceDelete}"`);

                        const targetRefOptions: string[] = [];
                        const onTargetDelete = relation.through?.onTargetDelete ?? "cascade";
                        targetRefOptions.push(`onDelete: "${onTargetDelete}"`);

                        const sourceRefOptionsString = `{ ${sourceRefOptions.join(", ")} }`;
                        const targetRefOptionsString = `{ ${targetRefOptions.join(", ")} }`;

                        const sourceJunctionColumns = getJunctionKeyColumns(sourceJunctionKey, sourceCollection, sourceRefOptionsString);
                        const targetJunctionColumns = getJunctionKeyColumns(targetJunctionKey, targetCollection, targetRefOptionsString);

                        const sourceKeyArray = Array.isArray(sourceJunctionKey) ? sourceJunctionKey : [sourceJunctionKey];
                        const targetKeyArray = Array.isArray(targetJunctionKey) ? targetJunctionKey : [targetJunctionKey];

                        // Generate junction table with proper structure
                        schemaContent += `export const ${junctionTableVarName} = pgTable("${junctionTableName}", {\n`;
                        schemaContent += `${sourceJunctionColumns.join(",\n")},\n`;
                        schemaContent += `${targetJunctionColumns.join(",\n")}\n`;
                        schemaContent += `}, (table) => ({\n`;
                        schemaContent += `\tpk: primaryKey({ columns: [${[...sourceKeyArray, ...targetKeyArray].map(key => `table.${key}`).join(", ")}] })\n`;
                        schemaContent += `}));\n\n`;
                        if (!exportedTableVars.includes(junctionTableVarName)) exportedTableVars.push(junctionTableVarName);
                    }
                } catch (e) {
                    console.warn("Could not generate junction table for relation manyToMany:", e);
                }
            }
        });
    });

    // 3. Generate Main Collection Tables
    for (const collection of collections) {
        const tableName = getTableName(collection);
        if (!tableName) continue;
        const tableVarName = getTableVarName(tableName);
        allTables.set(tableName, tableVarName);

        schemaContent += `export const ${tableVarName} = pgTable("${tableName}", {\n`;
        schemaContent += getDrizzleIdColumn(collection);

        const columns: string[] = [];
        Object.entries(collection.properties ?? {}).forEach(([propName, prop]) => {
            if (propName === (collection.idField ?? "id")) return;
            const columnString = getDrizzleColumn(propName, prop as Property, collection);
            if (columnString) columns.push(`\t${columnString}`);
        });

        // Process reference fields from resolved relations
        const resolvedRelations = resolveCollectionRelations(collection, collections);
        Object.entries(resolvedRelations).forEach(([, relation]) => {
            if (relation.type === "one" && relation.sourceFields && relation.targetFields) {
                const refOptionsParts: string[] = [];
                if (relation.onUpdate) refOptionsParts.push(`onUpdate: "${relation.onUpdate}"`);
                if (relation.onDelete) refOptionsParts.push(`onDelete: "${relation.onDelete}"`);
                const refOptions = refOptionsParts.length > 0 ? `{ ${refOptionsParts.join(", ")} }` : "{}";
                // For one() relations, add the foreign key columns if they're not already in properties
                relation.sourceFields.forEach((fieldName) => {
                    if (!collection.properties?.[fieldName]) {
                        const targetTableName = resolveTargetTableName(relation.target);
                        const targetTableVarName = getTableVarName(targetTableName);
                        const isRequired = relation.validation?.required ?? false;
                        const columnDef = `integer("${toSnakeCase(fieldName)}").references(() => ${targetTableVarName}.id, ${refOptions})`;
                        const finalDef = isRequired ? `${columnDef}.notNull()` : columnDef;
                        columns.push(`\t${fieldName}: ${finalDef}`);
                    }
                });
            }
        });

        if (columns.length > 0) {
            schemaContent += `,\n${columns.join(",\n")}`;
        }
        schemaContent += "\n});\n\n";
        if (!exportedTableVars.includes(tableVarName)) exportedTableVars.push(tableVarName);
    }

    // 4. Generate Relations from the new relation system
    for (const collection of collections) {
        const tableName = getTableName(collection);
        if (!tableName) continue;
        const tableVarName = getTableVarName(tableName);
        const tableRelations: string[] = [];

        // Process resolved relations
        const resolvedRelations = resolveCollectionRelations(collection, collections);
        Object.entries(resolvedRelations).forEach(([relationKey, relation]) => {
            try {
                if (relation.type === "one") {
                    // Generate one() relation
                    if (relation.sourceFields && relation.targetFields) {
                        const targetTableName = resolveTargetTableName(relation.target);
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
                    const targetTableName = resolveTargetTableName(relation.target);
                    const targetTableVarName = getTableVarName(targetTableName);

                    if (relation.relationName) {
                        tableRelations.push(`\t${relationKey}: many(${targetTableVarName}, { relationName: "${relation.relationName}" })`);
                    } else {
                        tableRelations.push(`\t${relationKey}: many(${targetTableVarName})`);
                    }
                } else if (relation.type === "manyToMany") {
                    // Generate many-to-many relation
                    const sourceCollection = collection;
                    const targetCollection = relation.target();
                    const junctionTableName = resolveJunctionTableName(relation.through, sourceCollection, targetCollection);
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

        if (tableRelations.length > 0) {
            const existingRelations = relationsToGenerate.find(r => r.tableVarName === tableVarName);
            if (existingRelations) {
                existingRelations.relations.push(...tableRelations);
            } else {
                relationsToGenerate.push({
                    tableVarName,
                    relations: tableRelations
                });
            }
        }
    }

    // 5. Generate Junction Table Relations for Many-to-Many
    junctionTables.forEach(junctionTableName => {
        const junctionTableVarName = getTableVarName(junctionTableName);
        const junctionRelations: string[] = [];
        const addedRelationKeys = new Set<string>(); // Track added keys to avoid duplicates

        // Find collections that use this junction table
        collections.forEach(collection => {
            const resolvedRelations = resolveCollectionRelations(collection, collections);
            Object.entries(resolvedRelations).forEach(([, relation]) => {
                if (relation.type === "manyToMany") {
                    const sourceCollection = collection;
                    const targetCollection = relation.target();
                    const currentJunctionTableName = resolveJunctionTableName(relation.through, sourceCollection, targetCollection);

                    if (currentJunctionTableName === junctionTableName) {
                        const sourceTableName = getTableName(sourceCollection);
                        const targetTableName = getTableName(targetCollection);
                        const sourceTableVarName = getTableVarName(sourceTableName);
                        const targetTableVarName = getTableVarName(targetTableName);

                        const sourceIdField = sourceCollection.idField ?? "id";
                        const targetIdField = targetCollection.idField ?? "id";

                        const sourceJunctionKey = relation.through?.sourceJunctionKey ?? `${toSnakeCase(sourceTableName)}_id`;
                        const targetJunctionKey = relation.through?.targetJunctionKey ?? `${toSnakeCase(targetTableName)}_id`;

                        const sourceKeys = Array.isArray(sourceJunctionKey) ? sourceJunctionKey : [sourceJunctionKey];
                        sourceKeys.forEach(key => {
                            if (!addedRelationKeys.has(key)) {
                                junctionRelations.push(`\t${key}: one(${sourceTableVarName}, {\n\t\tfields: [${junctionTableVarName}.${key}],\n\t\treferences: [${sourceTableVarName}.${sourceIdField}]\n\t})`);
                                addedRelationKeys.add(key);
                            }
                        });

                        const targetKeys = Array.isArray(targetJunctionKey) ? targetJunctionKey : [targetJunctionKey];
                        targetKeys.forEach(key => {
                            if (!addedRelationKeys.has(key)) {
                                junctionRelations.push(`\t${key}: one(${targetTableVarName}, {\n\t\tfields: [${junctionTableVarName}.${key}],\n\t\treferences: [${targetTableVarName}.${targetIdField}]\n\t})`);
                                addedRelationKeys.add(key);
                            }
                        });
                    }
                }
            });
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
        const hasOne = relations.some(r => r.includes("one("));
        const hasMany = relations.some(r => r.includes("many("));
        let helpers = "";
        if (hasOne && hasMany) {
            helpers = "{ one, many }";
        } else if (hasOne) {
            helpers = "{ one }";
        } else if (hasMany) {
            helpers = "{ many }";
        }
        schemaContent += `export const ${tableVarName}Relations = drizzleRelations(${tableVarName}, (${helpers}) => ({\n${relationStr}\n}));\n\n`;
        const relVar = `${tableVarName}Relations`;
        if (!exportedRelationVars.includes(relVar)) exportedRelationVars.push(relVar);
    });

    // Aggregate exports
    const tablesExport = `export const tables = { ${exportedTableVars.join(", ")} };\n`;
    const enumsExport = `export const enums = { ${exportedEnumVars.join(", ")} };\n`;
    const relationsExport = `export const relations = { ${exportedRelationVars.join(", ")} };\n\n`;
    schemaContent += tablesExport + enumsExport + relationsExport;

    // Write to output file or console
    if (outputPath) {
        const outputDir = path.dirname(outputPath);
        await fs.mkdir(outputDir, { recursive: true });
        await fs.writeFile(outputPath, schemaContent);
        console.log("✅ Drizzle schema generated successfully at", outputPath);
    } else {
        console.log("✅ Drizzle schema generated successfully.");
    }

    console.log(`You can now run ${formatTerminalText("pnpm db:generate", {
        bold: true,
        backgroundColor: "blue",
        textColor: "black"
    })} to generate the SQL migration files.`);
};

// --- Execution and Watch Logic ---

const runGeneration = async (collectionsFilePath?: string, outputPath?: string) => {
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

        loadedCollections = collections;

        await generateSchema(collections, outputPath);
    } catch (error) {
        console.error("Error generating schema:", error);
    }
};

const main = () => {
    const collectionsFilePathArg = process.argv.find(arg => arg.startsWith("--collections="));
    const collectionsFilePath = collectionsFilePathArg ? collectionsFilePathArg.split("=")[1] : process.argv[2];

    const outputPathArg = process.argv.find(arg => arg.startsWith("--output="));
    const outputPath = outputPathArg ? outputPathArg.split("=")[1] : undefined;

    const watch = process.argv.includes("--watch");

    if (!collectionsFilePath) {
        console.log("Usage: ts-node generate-drizzle-schema.ts <path-to-collections-file> [--output <path-to-output-file>] [--watch]");
        return;
    }

    const resolvedPath = path.resolve(process.cwd(), collectionsFilePath);
    const resolvedOutputPath = outputPath ? path.resolve(process.cwd(), outputPath) : undefined;

    if (watch) {
        console.log(`Watching for changes in ${resolvedPath}...`);
        const watcher = chokidar.watch(resolvedPath, {
            persistent: true,
            ignoreInitial: false // Run on start
        });

        watcher.on("all", (event, filePath) => {
            console.log(`[${event}] ${filePath}. Regenerating schema...`);
            runGeneration(resolvedPath, resolvedOutputPath);
        });
    } else {
        runGeneration(resolvedPath, resolvedOutputPath);
    }
};

// Check if this module is being run directly (ES module equivalent of require.main === module)
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}
