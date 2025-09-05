import { promises as fs } from "fs";
import path from "path";
import chokidar from "chokidar";
import {
    EntityCollection,
    NumberProperty,
    Property,
    Relation,
    RelationProperty,
    StringProperty,
} from "@firecms/types";
import {
    getColumnName,
    getEnumVarName,
    getTableName,
    getTableVarName,
    resolveCollectionRelations,
    toSnakeCase
} from "@firecms/common";

let loadedCollections: EntityCollection[] | undefined = [];

// --- Helper Functions ---

const formatTerminalText = (text: string, options: {
    bold?: boolean;
    backgroundColor?: "blue" | "green" | "red" | "yellow" | "cyan" | "magenta";
    textColor?: "white" | "black" | "red" | "green" | "yellow" | "blue" | "magenta" | "cyan";
} = {}): string => {
    let codes = "";
    if (options.bold) codes += "\x1b[1m";
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

const getJunctionKeyColumns = (keys: string | string[], targetCollection: EntityCollection, refOptions: string): string[] => {
    const keyArray = Array.isArray(keys) ? keys : [keys];
    const targetTableVar = getTableVarName(getTableName(targetCollection));
    const idField = targetCollection.idField ?? "id";
    const idProp = targetCollection.properties?.[idField] as Property | undefined;
    const isNumberId = idProp?.type === "number";
    const columnType = isNumberId ? "integer" : "varchar";

    return keyArray.map(key => {
        const columnName = getColumnName(key);
        const targetIdField = getColumnName(idField);
        return `\t${columnName}: ${columnType}("${toSnakeCase(columnName)}").references(() => ${targetTableVar}.${targetIdField}, ${refOptions}).notNull()`;
    });
};

const getDrizzleIdColumn = (collection: EntityCollection): string => {
    const idField = collection.idField ?? "id";
    const idProp = collection.properties?.[idField] as Property | undefined;

    if (collection.customId) {
        const isNumber = idProp?.type === "number";
        const idType = isNumber ? "integer" : "varchar";
        return `\t${idField}: ${idType}("${toSnakeCase(idField)}").primaryKey()`;
    } else {
        return `\t${idField}: serial("${toSnakeCase(idField)}").primaryKey()`;
    }
}

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
            const refProp = prop as RelationProperty;
            if (refProp.relation?.cardinality === "many") {
                return ""; // Virtual property for many-to-many, handled by junction table.
            }

            const collections = loadedCollections;
            if (!collections) {
                console.warn("Could not find loaded collections. Skipping reference type resolution.");
                return "";
            }

            let targetCollection: EntityCollection | undefined;
            if (refProp.relation) {
                targetCollection = refProp.relation.target();
            }

            if (!targetCollection) {
                console.warn(`Could not find target collection for relation property ${propName}`);
                return `varchar("${colName}")`;
            }

            const idField = targetCollection.idField ?? "id";
            const idProp = targetCollection.properties?.[idField] as Property | undefined;
            const isNumberId = idProp?.type === "number" || (targetCollection.customId !== "optional" && !targetCollection.customId && typeof targetCollection.customId !== "object" && !idProp);
            const baseColumn = isNumberId ? `integer("${colName}")` : `varchar("${colName}")`;
            const targetTableName = getTableName(targetCollection);
            const targetTableVar = getTableVarName(targetTableName);
            const refOptions = (prop as any).validation?.required ? "{ onDelete: 'cascade' }" : "{ onDelete: 'set null' }";
            columnDefinition = `${baseColumn}.references(() => ${targetTableVar}.${idField}, ${refOptions})`;
            break;
        }
        case "array": {
            const arrayProp = prop as any;
            if (arrayProp.of?.type === "relation") {
                return ""; // Virtual property for relation, no column needed.
            }
            columnDefinition = `jsonb("${colName}")`;
            break;
        }
        default:
            return "";
    }

    if ((prop).validation?.required) {
        columnDefinition += ".notNull()";
    }

    return `${propName}: ${columnDefinition}`;
};

// --- Main Schema Generation Logic ---

const generateSchema = async (collections: EntityCollection[], outputPath?: string) => {
    let schemaContent = "// This file is auto-generated by the FireCMS Drizzle generator. Do not edit manually.\n\n";
    schemaContent += "import { primaryKey, pgTable, integer, varchar, boolean, timestamp, jsonb, pgEnum, numeric, serial } from 'drizzle-orm/pg-core';\n";
    schemaContent += "import { relations as drizzleRelations } from 'drizzle-orm';\n\n";
    schemaContent += `import { getTableName, getTableVarName, getEnumVarName, getColumnName, toSnakeCase } from "@firecms/common";\n\n`;

    const relationsToGenerate: { tableVarName: string; relations: string[] }[] = [];
    const exportedEnumVars: string[] = [];
    const exportedTableVars: string[] = [];
    const exportedRelationVars: string[] = [];

    // 1. Generate Enums
    collections.forEach(collection => {
        const collectionPath = getTableName(collection);
        Object.entries(collection.properties ?? {}).forEach(([propName, prop]) => {
            const property = prop as Property;
            if ((property.type === "string" || property.type === "number") && (property).enum) {
                const enumVarName = getEnumVarName(collectionPath, propName);
                const enumDbName = `${collectionPath}_${toSnakeCase(propName)}`;
                const values = Array.isArray((property).enum) ? (property).enum.map((v: any) => String(v.id)) : Object.keys((property).enum);
                if (values.length > 0) {
                    schemaContent += `export const ${enumVarName} = pgEnum("${enumDbName}", [${values.map((v: any) => `'${v}'`).join(", ")}]);\n`;
                    if (!exportedEnumVars.includes(enumVarName)) exportedEnumVars.push(enumVarName);
                }
            }
        });
    });
    schemaContent += "\n\n";

    // 2. Identify all unique tables to be generated (from collections and relations)
    const allTablesToGenerate = new Map<string, {
        collection: EntityCollection,
        isJunction?: boolean,
        relation?: Relation,
        sourceCollection?: EntityCollection
    }>();

    // First, add all primary collections
    for (const collection of collections) {
        const tableName = getTableName(collection);
        if (tableName) {
            allTablesToGenerate.set(tableName, { collection });
        }
    }

    // Then, identify and add junction tables if they are not already defined as primary collections
    collections.forEach(sourceCollection => {
        const resolvedRelations = resolveCollectionRelations(sourceCollection, collections);
        Object.entries(resolvedRelations).forEach(([, relation]) => {
            if (relation.cardinality === "many" && relation.joins && relation.joins.length > 1) {
                const junctionTableName = relation.joins[0].table;
                if (!allTablesToGenerate.has(junctionTableName)) {
                    const junctionCollection = {
                        dbPath: junctionTableName,
                        properties: {}
                    } as EntityCollection;
                    allTablesToGenerate.set(junctionTableName, {
                        collection: junctionCollection,
                        isJunction: true,
                        relation,
                        sourceCollection
                    });
                }
            }
        });
    });

    // 3. Generate pgTable definitions for all unique tables
    for (const [tableName, {
        collection,
        isJunction,
        relation,
        sourceCollection
    }] of allTablesToGenerate.entries()) {
        const tableVarName = getTableVarName(tableName);

        if (isJunction && relation && sourceCollection) {
            // Generate junction table
            try {
                if (!relation.joins || relation.joins.length < 2) {
                    console.warn(`Could not generate junction table for relation ${relation.relationName}: not enough joins defined.`);
                    continue;
                }
                const targetCollection = relation.target();
                const junctionJoin = relation.joins[0];
                const targetJoin = relation.joins[1];

                const sourceJunctionKey = junctionJoin.targetColumn;
                const targetJunctionKey = targetJoin.sourceColumn;

                const onSourceDelete = relation.onDelete ?? "cascade";
                const sourceRefOptionsString = `{ onDelete: "${onSourceDelete}" }`;

                const onTargetDelete = relation.onDelete ?? "cascade";
                const targetRefOptionsString = `{ onDelete: "${onTargetDelete}" }`;

                const sourceJunctionColumns = getJunctionKeyColumns(sourceJunctionKey, sourceCollection, sourceRefOptionsString);
                const targetJunctionColumns = getJunctionKeyColumns(targetJunctionKey, targetCollection, targetRefOptionsString);

                const sourceKeyArray = (Array.isArray(sourceJunctionKey) ? sourceJunctionKey : [sourceJunctionKey]).map(key => getColumnName(key));
                const targetKeyArray = (Array.isArray(targetJunctionKey) ? targetJunctionKey : [targetJunctionKey]).map(key => getColumnName(key));

                schemaContent += `export const ${tableVarName} = pgTable("${tableName}", {\n`;
                schemaContent += `${sourceJunctionColumns.join(",\n")},\n`;
                schemaContent += `${targetJunctionColumns.join(",\n")}\n`;
                schemaContent += `}, (table) => ({\n`;
                schemaContent += `\tpk: primaryKey({ columns: [${[...sourceKeyArray, ...targetKeyArray].map(key => `table.${key}`).join(", ")}] })\n`;
                schemaContent += `}));\n\n`;

            } catch (e) {
                console.warn("Could not generate junction table:", e);
            }
        } else {
            // Generate standard collection table
            schemaContent += `export const ${tableVarName} = pgTable("${tableName}", {\n`;
            schemaContent += getDrizzleIdColumn(collection);

            const columns: string[] = [];
            Object.entries(collection.properties ?? {}).forEach(([propName, prop]) => {
                if (propName === (collection.idField ?? "id")) return;
                const columnString = getDrizzleColumn(propName, prop as Property, collection);
                if (columnString) columns.push(`\t${columnString}`);
            });

            const resolvedRelations = resolveCollectionRelations(collection, collections);
            Object.entries(resolvedRelations).forEach(([, relation]) => {
                if (relation.cardinality === "one" && relation.joins && relation.joins.length > 0) {
                    const join = relation.joins[0];
                    const fieldName = getColumnName(join.sourceColumn);
                    if (!collection.properties?.[fieldName]) {
                        const targetCollection = relation.target();
                        const targetTableName = getTableName(targetCollection);
                        const targetTableVarName = getTableVarName(targetTableName);
                        const refOptionsParts: string[] = [];
                        if (relation.onUpdate) refOptionsParts.push(`onUpdate: "${relation.onUpdate}"`);
                        if (relation.onDelete) refOptionsParts.push(`onDelete: "${relation.onDelete}"`);
                        const refOptions = refOptionsParts.length > 0 ? `{ ${refOptionsParts.join(", ")} }` : "{}";
                        const targetColumnName = getColumnName(join.targetColumn);
                        const idProp = targetCollection.properties?.[targetColumnName] as Property | undefined;
                        const isNumberId = idProp?.type === "number" || (targetCollection.customId !== "optional" && !targetCollection.customId && typeof targetCollection.customId !== "object" && !idProp);
                        const baseColumn = isNumberId ? `integer("${toSnakeCase(fieldName)}")` : `varchar("${toSnakeCase(fieldName)}")`;
                        const columnDef = `${baseColumn}.references(() => ${targetTableVarName}.${targetColumnName}, ${refOptions})`;
                        const isRequired = relation.validation?.required ?? false;
                        const finalDef = isRequired ? `${columnDef}.notNull()` : columnDef;
                        columns.push(`\t${fieldName}: ${finalDef}`);
                    }
                }
            });

            if (columns.length > 0) {
                schemaContent += `,\n${columns.join(",\n")}`;
            }
            schemaContent += "\n});\n\n";
        }

        if (!exportedTableVars.includes(tableVarName)) exportedTableVars.push(tableVarName);
    }

    // 4. Generate Drizzle Relations for all tables
    for (const [tableName, {
        isJunction,
        relation,
        sourceCollection
    }] of allTablesToGenerate.entries()) {
        const tableVarName = getTableVarName(tableName);
        const tableRelations: string[] = [];

        if (isJunction && relation && sourceCollection) {
            if (!relation.joins || relation.joins.length < 2) {
                console.warn(`Could not generate Drizzle relation for junction table for relation ${relation.relationName}: not enough joins defined.`);
                continue;
            }
            // Generate relations for junction table
            const targetCollection = relation.target();
            const sourceTableVarName = getTableVarName(getTableName(sourceCollection));
            const targetTableVarName = getTableVarName(getTableName(targetCollection));
            const sourceIdField = sourceCollection.idField ?? "id";
            const targetIdField = targetCollection.idField ?? "id";

            const sourceJunctionKey = getColumnName(relation.joins[0].targetColumn);
            const targetJunctionKey = getColumnName(relation.joins[1].sourceColumn);

            tableRelations.push(`\t${sourceJunctionKey}: one(${sourceTableVarName}, {\n\t\tfields: [${tableVarName}.${sourceJunctionKey}],\n\t\treferences: [${sourceTableVarName}.${sourceIdField}]\n\t})`);
            tableRelations.push(`\t${targetJunctionKey}: one(${targetTableVarName}, {\n\t\tfields: [${tableVarName}.${targetJunctionKey}],\n\t\treferences: [${targetTableVarName}.${targetIdField}]\n\t})`);
        } else {
            // Generate relations for standard collection
            const collection = allTablesToGenerate.get(tableName)!.collection;
            const resolvedRelations = resolveCollectionRelations(collection, collections);
            Object.entries(resolvedRelations).forEach(([relationKey, relation]) => {
                try {
                    const targetCollection = relation.target();
                    const targetTableName = getTableName(targetCollection);
                    const targetTableVarName = getTableVarName(targetTableName);

                    if (relation.cardinality === "one") {
                        if (relation.joins && relation.joins.length > 0) {
                            const join = relation.joins[0];
                            const sourceColumnName = getColumnName(join.sourceColumn);
                            const targetColumnName = getColumnName(join.targetColumn);
                            const fieldsStr = `${tableVarName}.${sourceColumnName}`;
                            const referencesStr = `${targetTableVarName}.${targetColumnName}`;
                            let relationArgs = `{\n\t\tfields: [${fieldsStr}],\n\t\treferences: [${referencesStr}]`;
                            if (relation.relationName) {
                                relationArgs += `,\n\t\trelationName: "${relation.relationName}"`;
                            }
                            relationArgs += `\n\t}`;
                            tableRelations.push(`\t${relationKey}: one(${targetTableVarName}, ${relationArgs})`);
                        }
                    } else if (relation.cardinality === "many") {
                        if (!relation.joins) {
                            console.warn(`Could not generate Drizzle relation for ${relationKey}: joins not defined.`);
                            return;
                        }
                        if (relation.joins.length > 1) { // Many-to-many
                            const junctionTableName = relation.joins[0].table;
                            const junctionTableVarName = getTableVarName(junctionTableName);
                            if (relation.relationName) {
                                tableRelations.push(`\t${relationKey}: many(${junctionTableVarName}, { relationName: "${relation.relationName}" })`);
                            } else {
                                tableRelations.push(`\t${relationKey}: many(${junctionTableVarName})`);
                            }
                        } else { // One-to-many
                            if (relation.relationName) {
                                tableRelations.push(`\t${relationKey}: many(${targetTableVarName}, { relationName: "${relation.relationName}" })`);
                            } else {
                                tableRelations.push(`\t${relationKey}: many(${targetTableVarName})`);
                            }
                        }
                    }
                } catch (e) {
                    console.warn(`Could not generate relation ${relationKey}:`, e);
                }
            });
        }

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
            ignoreInitial: false
        });

        watcher.on("all", (event, filePath) => {
            console.log(`[${event}] ${filePath}. Regenerating schema...`);
            runGeneration(resolvedPath, resolvedOutputPath);
        });
    } else {
        runGeneration(resolvedPath, resolvedOutputPath);
    }
};

if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}
