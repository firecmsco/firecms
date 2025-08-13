import { promises as fs } from "fs";
import path from "path";
import chokidar from "chokidar";
import {
    EntityCollection,
    NumberProperty,
    Property,
    ReferenceProperty,
    RelationshipProperty,
    StringProperty
} from "@firecms/core";

// --- Helper Functions ---

/**
 * Formats text with ANSI escape codes for terminal display
 * @param text The text to format
 * @param options Formatting options
 * @returns Formatted string with ANSI codes
 */
const formatTerminalText = (text: string, options: {
    bold?: boolean;
    backgroundColor?: 'blue' | 'green' | 'red' | 'yellow' | 'cyan' | 'magenta';
    textColor?: 'white' | 'black' | 'red' | 'green' | 'yellow' | 'blue' | 'magenta' | 'cyan';
} = {}): string => {
    let codes = '';

    if (options.bold) codes += '\x1b[1m';

    // Background colors
    if (options.backgroundColor) {
        const bgColors = {
            blue: '\x1b[44m',
            green: '\x1b[42m',
            red: '\x1b[41m',
            yellow: '\x1b[43m',
            cyan: '\x1b[46m',
            magenta: '\x1b[45m'
        };
        codes += bgColors[options.backgroundColor];
    }

    // Text colors
    if (options.textColor) {
        const textColors = {
            white: '\x1b[37m',
            black: '\x1b[30m',
            red: '\x1b[31m',
            green: '\x1b[32m',
            yellow: '\x1b[33m',
            blue: '\x1b[34m',
            magenta: '\x1b[35m',
            cyan: '\x1b[36m'
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
            if (stringProp.enumValues) {
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
            if (numProp.enumValues) {
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
            const refOptions = prop.validation?.required ? `{ onDelete: "cascade" }` : `{ onDelete: "set null" }`;
            columnDefinition = `integer("${colName}").references(() => ${targetTableVarName}.id, ${refOptions})`;
            break;
        }
        case "relationship": {
            const relProp = prop as RelationshipProperty;
            if (!relProp.hasMany) {
                const fkColumnName = relProp.sourceForeignKey ? toSnakeCase(String(relProp.sourceForeignKey)) : `${toSnakeCase(propName)}_id`;
                const targetTableVarName = getTableVarName(relProp.target);
                const refOptions = prop.validation?.required ? `{ onDelete: "cascade" }` : `{ onDelete: "set null" }`;
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
    let schemaContent = `// This file is auto-generated by the FireCMS Drizzle generator. Do not edit manually.\n\n`;
    schemaContent += `import { pgTable, integer, varchar, boolean, timestamp, jsonb, pgEnum, numeric, foreignKey, index } from "drizzle-orm/pg-core";\n`;
    schemaContent += `import { sql } from "drizzle-orm";\n`;
    schemaContent += `import { relations } from "drizzle-orm";\n\n`;

    const relationsToGenerate: { tableVarName: string; relations: string[] }[] = [];
    const allTables = new Map<string, string>(); // tableName -> tableVarName

    // 1. Generate Enums
    collections.forEach(collection => {
        const collectionPath = collection.dbPath ?? collection.name ?? "";
        Object.entries(collection.properties ?? {}).forEach(([propName, prop]) => {
            const property = prop as Property;
            if ((property.type === "string" || property.type === "number") && property.enumValues) {
                const enumVarName = getEnumVarName(collectionPath, propName);
                const enumDbName = `${collectionPath}_${toSnakeCase(propName)}`;
                const values = Array.isArray(property.enumValues)
                    ? property.enumValues.map(v => String(v.id))
                    : Object.keys(property.enumValues);
                if (values.length > 0) {
                    // Use enum values exactly as they are defined - DO NOT convert them
                    schemaContent += `export const ${enumVarName} = pgEnum("${enumDbName}", [${values.map(v => `'${v}'`).join(", ")}]);\n`;
                }
            }
        });
    });
    schemaContent += "\n\n";

    // 2. Generate Main Collection Tables
    for (const collection of collections) {
        const tableName = collection.dbPath ?? collection.name;
        if (!tableName) continue;
        const tableVarName = getTableVarName(tableName);
        allTables.set(tableName, tableVarName);

        schemaContent += `export const ${tableVarName} = pgTable("${tableName}", {\n`;
        schemaContent += `\tid: integer().primaryKey().notNull()`;

        const columns: string[] = [];
        Object.entries(collection.properties ?? {}).forEach(([propName, prop]) => {
            if (propName === "id") return;
            const columnString = getDrizzleColumn(propName, prop as Property, collection);
            if (columnString) columns.push(`\t${columnString}`);
        });

        // Add standard timestamp fields if they exist in the properties
        const hasCreatedAt = collection.properties?.createdAt;
        const hasUpdatedAt = collection.properties?.updatedAt;

        if (hasCreatedAt && !columns.find(c => c.includes('createdAt'))) {
            columns.push(`\tcreatedAt: timestamp("created_at", { withTimezone: true, mode: 'string' })`);
        }
        if (hasUpdatedAt && !columns.find(c => c.includes('updatedAt'))) {
            columns.push(`\tupdatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' })`);
        }

        if (columns.length > 0) {
            schemaContent += `,\n${columns.join(",\n")}`;
        }
        schemaContent += `\n`;

        // Add table constraints if needed (indexes, foreign keys)
        const constraints: string[] = [];

        // Add foreign key constraints and indexes
        Object.entries(collection.properties ?? {}).forEach(([propName, prop]) => {
            if (prop.type === "reference" || (prop.type === "relationship" && !(prop as RelationshipProperty).hasMany)) {
                const colName = toSnakeCase(propName);
                if (prop.type === "reference") {
                    const refProp = prop as ReferenceProperty;
                    if (refProp.path) {
                        const targetTableVarName = getTableVarName(refProp.path);
                        const onDelete = prop.validation?.required ? "cascade" : "set null";
                        constraints.push(`\tindex("${tableVarName}_${colName}_idx").using("btree", table.${propName}.asc().nullsLast().op("int4_ops"))`);
                        constraints.push(`\tforeignKey({\n\t\tcolumns: [table.${propName}],\n\t\tforeignColumns: [${targetTableVarName}.id],\n\t\tname: "${tableVarName}_${colName}_${targetTableVarName}_id_fk"\n\t}).onDelete("${onDelete}")`);
                    }
                }
            }
        });

        if (constraints.length > 0) {
            schemaContent += `\n}, (table) => [\n${constraints.join(",\n")}\n]);\n\n`;
        } else {
            schemaContent += `\n});\n\n`;
        }
    }

    // 3. Generate Relations
    for (const collection of collections) {
        const tableName = collection.dbPath ?? collection.name;
        if (!tableName) continue;
        const tableVarName = getTableVarName(tableName);
        const tableRelations: string[] = [];

        Object.entries(collection.properties ?? {}).forEach(([propName, prop]) => {
            if (prop.type === "reference") {
                const refProp = prop as ReferenceProperty;
                if (refProp.path) {
                    const targetTableVarName = getTableVarName(refProp.path);
                    tableRelations.push(`\t${propName}: one(${targetTableVarName}, {\n\t\tfields: [${tableVarName}.${propName}],\n\t\treferences: [${targetTableVarName}.id]\n\t})`);
                }
            } else if (prop.type === "relationship") {
                const relProp = prop as RelationshipProperty;
                if (relProp.hasMany) {
                    const targetTableVarName = getTableVarName(relProp.target);
                    // Find the inverse foreign key in the target collection
                    const targetCollection = collections.find(c => (c.dbPath ?? c.name) === relProp.target);
                    if (targetCollection) {
                        const inverseFkProp = Object.entries(targetCollection.properties ?? {}).find(([_, targetProp]) => {
                            return (targetProp.type === "reference" && (targetProp as ReferenceProperty).path === tableName) ||
                                   (targetProp.type === "relationship" && (targetProp as RelationshipProperty).target === tableName && !(targetProp as RelationshipProperty).hasMany);
                        });

                        if (inverseFkProp) {
                            tableRelations.push(`\t${propName}: many(${targetTableVarName})`);
                        }
                    }
                } else {
                    const targetTableVarName = getTableVarName(relProp.target);
                    const fkColumnName = relProp.sourceForeignKey ? String(relProp.sourceForeignKey) : `${propName}Id`;
                    tableRelations.push(`\t${propName}: one(${targetTableVarName}, {\n\t\tfields: [${tableVarName}.${fkColumnName}],\n\t\treferences: [${targetTableVarName}.id]\n\t})`);
                }
            }
        });

        // Generate inverse relations (many side of one-to-many)
        collections.forEach(otherCollection => {
            const otherTableName = otherCollection.dbPath ?? otherCollection.name;
            if (!otherTableName || otherTableName === tableName) return;

            Object.entries(otherCollection.properties ?? {}).forEach(([otherPropName, otherProp]) => {
                if (otherProp.type === "reference" && (otherProp as ReferenceProperty).path === tableName) {
                    const otherTableVarName = getTableVarName(otherTableName);
                    // Use the exact table name from the introspected relations
                    const relationName = otherTableName === "maintenance_history" ? "maintenanceHistories" :
                                       otherTableName === "payment_history" ? "paymentHistories" :
                                       otherTableName;
                    tableRelations.push(`\t${relationName}: many(${otherTableVarName})`);
                }
            });
        });

        if (tableRelations.length > 0) {
            relationsToGenerate.push({
                tableVarName,
                relations: tableRelations
            });
        }
    }

    // Generate all Relations
    relationsToGenerate.forEach(({ tableVarName, relations }) => {
        // Convert table variable name to camelCase for relation exports
        const relationVarName = tableVarName.replace(/_([a-z])/g, (_, char) => char.toUpperCase());
        schemaContent += `export const ${relationVarName}Relations = relations(${tableVarName}, ({ one, many }) => ({\n`;
        schemaContent += `${relations.join(",\n")}\n`;
        schemaContent += `}));\n\n`;
    });

    const finalOutputPath = outputPath || path.resolve(process.cwd(), "src/schema.generated.ts");
    await fs.writeFile(finalOutputPath, schemaContent);
    console.log("✅ Drizzle schema generated successfully at", finalOutputPath);
    // suggest running `pnpm db:generate` with bold and colored background for the command only
    console.log(`You can now run ${formatTerminalText('pnpm db:generate', { bold: true, backgroundColor: 'blue', textColor: 'black' })} to generate the SQL migration files.`);
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
