import { promises as fs } from "fs";
import path from "path";
import chokidar from "chokidar";
import {
    EntityCollection,
    NumberProperty, Properties,
    Property,
    ReferenceProperty,
    RelationshipProperty,
    StringProperty,
    CollectionRelations,
    ExtendedRelation
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
        };
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
        };
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
                // Remove _enum suffix to match introspected schema
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
                // Handle number enums
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
            if (!refProp.path) return "";
            const targetTableVarName = getTableVarName(refProp.path);
            const refOptions = prop.validation?.required ? "{ onDelete: \"cascade\" }" : "{ onDelete: \"set null\" }";
            columnDefinition = `integer("${colName}").references(() => ${targetTableVarName}.id, ${refOptions})`;
            break;
        }
        case "relation": {
            const relProp = prop as RelationshipProperty;
            if (!relProp.hasMany) {
                const fkColumnName = relProp.sourceForeignKey ? toSnakeCase(String(relProp.sourceForeignKey)) : `${toSnakeCase(propName)}`;
                const targetTableVarName = getTableVarName(relProp.target);
                const refOptions = prop.validation?.required ? "{ onDelete: \"cascade\" }" : "{ onDelete: \"set null\" }";
                // Drizzle ORM uses the property name as the key for the relation object
                return `${propName}: integer("${fkColumnName}").references(() => ${targetTableVarName}.id, ${refOptions})`;
            }
            return ""; // One-to-many and many-to-many are handled by relations and junction tables
        }
        case "array":
            return ""; // Handled as separate tables
        default:
            return "";
    }

    if (prop.validation?.required) {
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
            if ((property.type === "string" || property.type === "number") && property.enum) {
                const enumVarName = getEnumVarName(collectionPath, propName);
                const enumDbName = `${collectionPath}_${toSnakeCase(propName)}`;
                const values = Array.isArray(property.enum)
                    ? property.enum.map(v => String(v.id))
                    : Object.keys(property.enum);
                if (values.length > 0) {
                    schemaContent += `export const ${enumVarName} = pgEnum("${enumDbName}", [${values.map(v => `'${v}'`).join(", ")}]);\n`;
                }
            }
        });
    });
    schemaContent += "\n\n";

    // 2. Generate Junction Tables for Many-to-Many Relations
    collections.forEach(collection => {
        if (collection.relations) {
            Object.entries(collection.relations).forEach(([relationKey, relation]) => {
                if (relation.type === "manyToMany") {
                    try {
                        const junctionTable = relation.through.table();
                        const junctionTableName = junctionTable.dbPath ?? junctionTable.name ?? "";
                        const junctionTableVarName = getTableVarName(junctionTableName);

                        if (!junctionTables.includes(junctionTableName)) {
                            junctionTables.push(junctionTableName);

                            // Get source and target collection info
                            const sourceCollection = collection;
                            const targetCollection = relation.with();
                            const sourceTableName = sourceCollection.dbPath ?? sourceCollection.name ?? "";
                            const targetTableName = targetCollection.dbPath ?? targetCollection.name ?? "";
                            const sourceTableVarName = getTableVarName(sourceTableName);
                            const targetTableVarName = getTableVarName(targetTableName);

                            schemaContent += `export const ${junctionTableVarName} = pgTable("${junctionTableName}", {\n`;
                            schemaContent += `\tid: integer().primaryKey().notNull(),\n`;
                            schemaContent += `\t${relation.through.sourceKey}: integer("${toSnakeCase(relation.through.sourceKey)}").references(() => ${sourceTableVarName}.id, { onDelete: "cascade" }).notNull(),\n`;
                            schemaContent += `\t${relation.through.targetKey}: integer("${toSnakeCase(relation.through.targetKey)}").references(() => ${targetTableVarName}.id, { onDelete: "cascade" }).notNull()\n`;
                            schemaContent += "});\n\n";
                        }
                    } catch (e) {
                        console.warn(`Could not generate junction table for relation ${relationKey}:`, e);
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
            Object.entries(collection.relations).forEach(([relationKey, relation]) => {
                if (relation.type === "one" && relation.fields && relation.references) {
                    // For one() relations, add the foreign key columns if they're not already in properties
                    relation.fields.forEach((fieldName, index) => {
                        if (!collection.properties?.[fieldName]) {
                            try {
                                const targetCollection = relation.with();
                                const targetTableName = targetCollection.dbPath ?? targetCollection.name ?? "";
                                const targetTableVarName = getTableVarName(targetTableName);
                                const isRequired = relation.ui?.validation?.required ?? false;
                                const refOptions = isRequired ? "{ onDelete: \"cascade\" }" : "{ onDelete: \"set null\" }";
                                const columnDef = `integer("${toSnakeCase(fieldName)}").references(() => ${targetTableVarName}.id, ${refOptions})`;
                                const finalDef = isRequired ? `${columnDef}.notNull()` : columnDef;
                                columns.push(`\t${fieldName}: ${finalDef}`);
                            } catch (e) {
                                console.warn(`Could not resolve target collection for relation ${relationKey}`);
                            }
                        }
                    });
                } else if (relation.type === "self") {
                    // Add self-referencing foreign key
                    if (!collection.properties?.[relation.parentKey]) {
                        const isRequired = relation.ui?.validation?.required ?? false;
                        const refOptions = isRequired ? "{ onDelete: \"cascade\" }" : "{ onDelete: \"set null\" }";
                        const columnDef = `integer("${toSnakeCase(relation.parentKey)}").references(() => ${tableVarName}.id, ${refOptions})`;
                        const finalDef = isRequired ? `${columnDef}.notNull()` : columnDef;
                        columns.push(`\t${relation.parentKey}: ${finalDef}`);
                    }
                } else if (relation.type === "polymorphic") {
                    // Add polymorphic foreign key and type discriminator
                    if (!collection.properties?.[relation.foreignKey]) {
                        const isRequired = relation.ui?.validation?.required ?? false;
                        const columnDef = `integer("${toSnakeCase(relation.foreignKey)}")`;
                        const finalDef = isRequired ? `${columnDef}.notNull()` : columnDef;
                        columns.push(`\t${relation.foreignKey}: ${finalDef}`);
                    }
                    if (!collection.properties?.[relation.typeKey]) {
                        const isRequired = relation.ui?.validation?.required ?? false;
                        const columnDef = `varchar("${toSnakeCase(relation.typeKey)}")`;
                        const finalDef = isRequired ? `${columnDef}.notNull()` : columnDef;
                        columns.push(`\t${relation.typeKey}: ${finalDef}`);
                    }
                } else if (relation.type === "composite") {
                    // Add composite key fields
                    relation.keys.forEach(({ local }) => {
                        if (!collection.properties?.[local]) {
                            const isRequired = relation.ui?.validation?.required ?? false;
                            const columnDef = `integer("${toSnakeCase(local)}")`;
                            const finalDef = isRequired ? `${columnDef}.notNull()` : columnDef;
                            columns.push(`\t${local}: ${finalDef}`);
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
                        if (relation.fields && relation.references) {
                            const targetCollection = relation.with();
                            const targetTableName = targetCollection.dbPath ?? targetCollection.name ?? "";
                            const targetTableVarName = getTableVarName(targetTableName);
                            const fieldsStr = relation.fields.map(f => `${tableVarName}.${f}`).join(", ");
                            const referencesStr = relation.references.map(r => `${targetTableVarName}.${r}`).join(", ");

                            if (relation.relationName) {
                                tableRelations.push(`\t${relationKey}: one(${targetTableVarName}, {\n\t\tfields: [${fieldsStr}],\n\t\treferences: [${referencesStr}],\n\t\trelationName: "${relation.relationName}"\n\t})`);
                            } else {
                                tableRelations.push(`\t${relationKey}: one(${targetTableVarName}, {\n\t\tfields: [${fieldsStr}],\n\t\treferences: [${referencesStr}]\n\t})`);
                            }
                        }
                    } else if (relation.type === "many") {
                        // Generate many() relation
                        const targetCollection = relation.with();
                        const targetTableName = targetCollection.dbPath ?? targetCollection.name ?? "";
                        const targetTableVarName = getTableVarName(targetTableName);

                        if (relation.relationName) {
                            tableRelations.push(`\t${relationKey}: many(${targetTableVarName}, { relationName: "${relation.relationName}" })`);
                        } else {
                            tableRelations.push(`\t${relationKey}: many(${targetTableVarName})`);
                        }
                    } else if (relation.type === "manyToMany") {
                        // Generate many-to-many relation
                        const targetCollection = relation.with();
                        const junctionTable = relation.through.table();
                        const targetTableName = targetCollection.dbPath ?? targetCollection.name ?? "";
                        const junctionTableName = junctionTable.dbPath ?? junctionTable.name ?? "";
                        const targetTableVarName = getTableVarName(targetTableName);
                        const junctionTableVarName = getTableVarName(junctionTableName);

                        if (relation.relationName) {
                            tableRelations.push(`\t${relationKey}: many(${junctionTableVarName}, { relationName: "${relation.relationName}" })`);
                        } else {
                            tableRelations.push(`\t${relationKey}: many(${junctionTableVarName})`);
                        }
                    } else if (relation.type === "self") {
                        // Generate self-referencing relation
                        if (relation.direction === "parentToChildren") {
                            // Parent has many children
                            if (relation.relationName) {
                                tableRelations.push(`\t${relationKey}: many(${tableVarName}, { relationName: "${relation.relationName}" })`);
                            } else {
                                tableRelations.push(`\t${relationKey}: many(${tableVarName})`);
                            }
                        } else {
                            // Child has one parent
                            const fieldsStr = `${tableVarName}.${relation.parentKey}`;
                            const referencesStr = `${tableVarName}.id`;

                            if (relation.relationName) {
                                tableRelations.push(`\t${relationKey}: one(${tableVarName}, {\n\t\tfields: [${fieldsStr}],\n\t\treferences: [${referencesStr}],\n\t\trelationName: "${relation.relationName}"\n\t})`);
                            } else {
                                tableRelations.push(`\t${relationKey}: one(${tableVarName}, {\n\t\tfields: [${fieldsStr}],\n\t\treferences: [${referencesStr}]\n\t})`);
                            }
                        }
                    } else if (relation.type === "conditional") {
                        // Generate conditional relation (treated as regular one/many with where clause in queries)
                        const targetCollection = relation.with();
                        const targetTableName = targetCollection.dbPath ?? targetCollection.name ?? "";
                        const targetTableVarName = getTableVarName(targetTableName);

                        if (relation.cardinality === "one") {
                            const fieldsStr = relation.fields.map(f => `${tableVarName}.${f}`).join(", ");
                            const referencesStr = relation.references.map(r => `${targetTableVarName}.${r}`).join(", ");

                            if (relation.relationName) {
                                tableRelations.push(`\t${relationKey}: one(${targetTableVarName}, {\n\t\tfields: [${fieldsStr}],\n\t\treferences: [${referencesStr}],\n\t\trelationName: "${relation.relationName}"\n\t})`);
                            } else {
                                tableRelations.push(`\t${relationKey}: one(${targetTableVarName}, {\n\t\tfields: [${fieldsStr}],\n\t\treferences: [${referencesStr}]\n\t})`);
                            }
                        } else {
                            if (relation.relationName) {
                                tableRelations.push(`\t${relationKey}: many(${targetTableVarName}, { relationName: "${relation.relationName}" })`);
                            } else {
                                tableRelations.push(`\t${relationKey}: many(${targetTableVarName})`);
                            }
                        }
                    } else if (relation.type === "composite") {
                        // Generate composite key relation
                        const targetCollection = relation.with();
                        const targetTableName = targetCollection.dbPath ?? targetCollection.name ?? "";
                        const targetTableVarName = getTableVarName(targetTableName);

                        const fieldsStr = relation.keys.map(k => `${tableVarName}.${k.local}`).join(", ");
                        const referencesStr = relation.keys.map(k => `${targetTableVarName}.${k.foreign}`).join(", ");

                        if (relation.cardinality === "one") {
                            if (relation.relationName) {
                                tableRelations.push(`\t${relationKey}: one(${targetTableVarName}, {\n\t\tfields: [${fieldsStr}],\n\t\treferences: [${referencesStr}],\n\t\trelationName: "${relation.relationName}"\n\t})`);
                            } else {
                                tableRelations.push(`\t${relationKey}: one(${targetTableVarName}, {\n\t\tfields: [${fieldsStr}],\n\t\treferences: [${referencesStr}]\n\t})`);
                            }
                        } else {
                            if (relation.relationName) {
                                tableRelations.push(`\t${relationKey}: many(${targetTableVarName}, { relationName: "${relation.relationName}" })`);
                            } else {
                                tableRelations.push(`\t${relationKey}: many(${targetTableVarName})`);
                            }
                        }
                    } else if (relation.type === "polymorphic") {
                        // For polymorphic relations, we need to generate relations for each target type
                        // This is complex in Drizzle and might need custom query handling
                        relation.targets.forEach((target, index) => {
                            const targetCollection = target.with();
                            const targetTableName = targetCollection.dbPath ?? targetCollection.name ?? "";
                            const targetTableVarName = getTableVarName(targetTableName);
                            const relationName = `${relationKey}_${target.typeValue}`;

                            // Generate a relation for each polymorphic target
                            tableRelations.push(`\t${relationName}: one(${targetTableVarName}, {\n\t\tfields: [${tableVarName}.${relation.foreignKey}],\n\t\treferences: [${targetTableVarName}.id]\n\t})`);
                        });
                    }
                } catch (e) {
                    console.warn(`Could not generate relation ${relationKey}:`, e);
                }
            });
        }

        // Also process legacy reference properties for backward compatibility
        Object.entries(collection.properties as Properties ?? {}).forEach(([propName, prop]) => {
            if (prop.type === "reference") {
                const refProp = prop as ReferenceProperty;
                if (refProp.path) {
                    const targetTableVarName = getTableVarName(refProp.path);
                    // Only add if not already handled by the new relations system
                    const existingRelation = collection.relations && Object.values(collection.relations).find(rel =>
                        rel.type === "one" && rel.fields?.includes(propName)
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
                Object.entries(collection.relations).forEach(([relationKey, relation]) => {
                    if (relation.type === "manyToMany") {
                        try {
                            const junctionTable = relation.through.table();
                            const currentJunctionTableName = junctionTable.dbPath ?? junctionTable.name ?? "";

                            if (currentJunctionTableName === junctionTableName) {
                                const sourceTableName = collection.dbPath ?? collection.name ?? "";
                                const targetCollection = relation.with();
                                const targetTableName = targetCollection.dbPath ?? targetCollection.name ?? "";
                                const sourceTableVarName = getTableVarName(sourceTableName);
                                const targetTableVarName = getTableVarName(targetTableName);

                                junctionRelations.push(`\t${relation.through.sourceKey}: one(${sourceTableVarName}, {\n\t\tfields: [${junctionTableVarName}.${relation.through.sourceKey}],\n\t\treferences: [${sourceTableVarName}.id]\n\t})`);
                                junctionRelations.push(`\t${relation.through.targetKey}: one(${targetTableVarName}, {\n\t\tfields: [${junctionTableVarName}.${relation.through.targetKey}],\n\t\treferences: [${targetTableVarName}.id]\n\t})`);
                            }
                        } catch (e) {
                            console.warn(`Could not generate junction table relations for ${relationKey}:`, e);
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
    relationsToGenerate.forEach(({ tableVarName, relations }) => {
        const relationVarName = `${tableVarName}Relations`;
        schemaContent += `export const ${relationVarName} = relations(${tableVarName}, ({ one, many }) => ({\n`;
        schemaContent += `${relations.join(",\n")}\n`;
        schemaContent += "}));\n\n";
    });

    const finalOutputPath = outputPath || path.resolve(process.cwd(), "src/schema.generated.ts");
    await fs.writeFile(finalOutputPath, schemaContent);
    console.log("✅ Drizzle schema generated successfully at", finalOutputPath);
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

        watcher.on("all", (event, path) => {
            console.log(`[${event}] ${path}. Regenerating schema...`);
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
