// custom-backend/src/lib/generate-drizzle-schema.ts
import { promises as fs } from "fs";
import path from "path";
import chokidar from "chokidar";
import {
    ArrayProperty,
    EntityCollection,
    NumberProperty,
    Property,
    ReferenceProperty,
    RelationshipProperty,
    StringProperty
} from "@firecms/core";

// Helper to convert camelCase to snake_case
const toSnakeCase = (str: string | undefined | null) => {
    if (!str || typeof str !== 'string') {
        console.warn(`toSnakeCase received invalid input: ${str}`);
        return '';
    }
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
};

const getDrizzleColumn = (propName: string, prop: Property, collection: EntityCollection): string => {
    const colName = toSnakeCase(propName);
    const collectionPath = collection.path || collection.dbPath;
    let columnDefinition: string;

    switch (prop.type) {
        case "string": {
            const stringProp = prop as StringProperty;
            if (stringProp.enumValues) {
                const enumName = `${toSnakeCase(collectionPath)}${toSnakeCase(propName) ? '_' + toSnakeCase(propName) : ''}_enum`;
                columnDefinition = `${enumName}("${colName}")`;
            } else {
                columnDefinition = `varchar("${colName}")`;
            }
            break;
        }
        case "number": {
            const numProp = prop as NumberProperty;
            columnDefinition = numProp.validation?.integer ? `integer("${colName}")` : `customDecimal("${colName}")`;
            break;
        }
        case "boolean":
            columnDefinition = `boolean("${colName}")`;
            break;
        case "date":
            columnDefinition = `timestamp("${colName}", { withTimezone: true })`;
            break;
        case "map":
            columnDefinition = `jsonb("${colName}")`;
            break;
        case "reference": {
            const refProp = prop as ReferenceProperty;
            const targetTable = refProp.path;
            // Generate proper foreign key with cascade delete for required references
            const refOptions = prop.validation?.required ?
                `{ onDelete: "cascade" }` :
                `{ onDelete: "set null" }`;
            columnDefinition = `integer("${colName}").references(() => ${targetTable}.id, ${refOptions})`;
            break;
        }
        case "relationship": {
            const relProp = prop as RelationshipProperty;
            if (!relProp.hasMany) {
                const fkName = relProp.sourceForeignKey ? toSnakeCase(String(relProp.sourceForeignKey)) : `${toSnakeCase(propName)}_id`;
                const refOptions = prop.validation?.required ?
                    `{ onDelete: "cascade" }` :
                    `{ onDelete: "set null" }`;
                return `${propName}: integer("${fkName}").references(() => ${relProp.target}.id, ${refOptions})`;
            }
            return ""; // one-to-many and many-to-many are handled by other tables
        }
        case "array":
            return ""; // Arrays are handled as separate tables
        default:
            return "";
    }

    if (prop.validation?.required) {
        columnDefinition += ".notNull()";
    }

    return `${propName}: ${columnDefinition}`;
};

const generateSchema = async (collections: EntityCollection[]) => {
    let schemaContent = `import { pgTable, integer, varchar, boolean, timestamp, jsonb, pgEnum, decimal, index, customType } from "drizzle-orm/pg-core";\n\n`;

    // Add custom decimal type definition
    schemaContent += `const customDecimal = customType<{ data: number; driverData: string }>({\n`;
    schemaContent += `    dataType() {\n`;
    schemaContent += `        return "decimal";\n`;
    schemaContent += `    },\n`;
    schemaContent += `    fromDriver(value: string): number {\n`;
    schemaContent += `        return parseFloat(value);\n`;
    schemaContent += `    },\n`;
    schemaContent += `    toDriver(value: number): string {\n`;
    schemaContent += `        return String(value);\n`;
    schemaContent += `    },\n`;
    schemaContent += `});\n\n`;

    // Generate Enums
    collections.forEach(collection => {
        if (!collection.path && !collection.dbPath) {
            console.warn(`Collection missing path/dbPath:`, collection.name || 'unnamed');
            return;
        }
        const collectionPath = collection.path || collection.dbPath;

        Object.entries(collection.properties || {}).forEach(([propName, prop]) => {
            if (!propName || !prop) {
                console.warn(`Invalid property in collection ${collectionPath}:`, propName, prop);
                return;
            }
            const property = prop as Property;
            if ((property.type === "string" || property.type === "number") && property.enumValues) {
                const enumName = `${toSnakeCase(collectionPath)}${toSnakeCase(propName) ? '_' + toSnakeCase(propName) : ''}_enum`;
                let values: string[];

                if (Array.isArray(property.enumValues)) {
                    // Handle array format: [{id: "value", label: "Label"}, ...]
                    values = property.enumValues.map(v => String(v.id));
                } else {
                    // Handle object format: {"key": "value"} - use the keys as the enum values
                    values = Object.keys(property.enumValues);
                }

                schemaContent += `export const ${enumName} = pgEnum("${enumName.replace(/_enum$/, '')}", [${values.map((v: any) => `"${String(v)}"`).join(", ")}]);\n`;
            }
        });
    });
    schemaContent += "\n";

    // Generate Tables
    for (const collection of collections) {
        if (!collection.path && !collection.dbPath) {
            console.warn(`Skipping collection without path/dbPath:`, collection.name || 'unnamed');
            continue;
        }
        const tableName = collection.path || collection.dbPath;
        const tableVarName = toSnakeCase(tableName).replace(/^_+|_+$/g, '') || tableName;

        schemaContent += `export const ${tableVarName} = pgTable("${tableName}", {\n`;
        schemaContent += `    id: integer("id").primaryKey(),\n`;

        const columns: string[] = [];
        const arrayProperties: { propName: string, prop: ArrayProperty }[] = [];
        const indexColumns: string[] = [];

        // Add standard timestamp fields if they exist
        const hasCreatedAt = collection.properties && 'createdAt' in collection.properties;
        const hasUpdatedAt = collection.properties && 'updatedAt' in collection.properties;

        Object.entries(collection.properties || {}).forEach(([propName, prop]) => {
            if (!propName || !prop) {
                console.warn(`Invalid property in collection ${tableName}:`, propName, prop);
                return;
            }
            if (propName === "id") return; // Skip 'id' as it's already defined

            const columnString = getDrizzleColumn(propName, prop as Property, collection);
            if (columnString) {
                columns.push(`    ${columnString}`);

                // Add indexes for certain column types
                const property = prop as Property;
                if (property.type === "string" && (propName === "email" || propName.includes("Id") || propName === "serialNumber")) {
                    indexColumns.push(propName);
                } else if (property.type === "reference" || (property.type === "string" && property.enumValues)) {
                    indexColumns.push(propName);
                } else if (property.type === "date" && propName === "startDate") {
                    indexColumns.push(propName);
                }
            }

            if ((prop as Property).type === "array") {
                arrayProperties.push({
                    propName,
                    prop: prop as ArrayProperty
                });
            }
        });

        // Add createdAt and updatedAt if they don't exist but should
        if (!hasCreatedAt && tableName !== 'media') {
            columns.push(`    createdAt: timestamp("created_at", { withTimezone: true }).notNull()`);
        }
        if (!hasUpdatedAt && tableName !== 'media') {
            columns.push(`    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull()`);
        }

        schemaContent += columns.join(",\n");

        // Add table closing with indexes
        if (indexColumns.length > 0) {
            schemaContent += `\n}, (table) => ({\n`;
            indexColumns.forEach((col, index) => {
                const indexName = `${tableVarName}_${toSnakeCase(col)}_idx`;
                schemaContent += `    ${col}Idx: index("${indexName}").on(table.${col})${index < indexColumns.length - 1 ? ',' : ''}\n`;
            });
            schemaContent += `}));\n\n`;
        } else {
            schemaContent += `\n});\n\n`;
        }

        // Generate tables for array properties
        for (const { propName, prop } of arrayProperties) {
            const subTableName = `${tableName}_${toSnakeCase(propName)}`;
            const subTableVarName = toSnakeCase(subTableName).replace(/^_+|_+$/g, '');

            schemaContent += `export const ${subTableVarName} = pgTable("${subTableName}", {\n`;
            schemaContent += `    _order: integer("_order").notNull(),\n`;
            schemaContent += `    _parent_id: integer("_parent_id").notNull().references(() => ${tableVarName}.id, { onDelete: "cascade" }),\n`;

            const ofProp = Array.isArray(prop.of) ? prop.of[0] : prop.of;
            if (ofProp && "type" in ofProp) {
                if (ofProp.type === "string") {
                    schemaContent += `    value: varchar("value")\n`;
                } else if (ofProp.type === "number") {
                    schemaContent += `    value: customDecimal("value")\n`;
                } else if (ofProp.type === "map" && ofProp.properties) {
                    Object.entries(ofProp.properties).forEach(([key, subProp]) => {
                        const column = getDrizzleColumn(key, subProp as Property, collection);
                        if (column) schemaContent += `    ${column},\n`;
                    });
                }
            }
            schemaContent += `});\n\n`;
        }
    }

    const outputPath = path.resolve(__dirname, "../example/schema.generated.ts");
    await fs.writeFile(outputPath, schemaContent);
    console.log("Drizzle schema generated successfully at", outputPath);
};

const collectionsFilePath = path.resolve(__dirname, "../example/collections.ts");

const runGeneration = async () => {
    try {
        // Bust the require cache to get the latest version of the collections file
        delete require.cache[require.resolve(collectionsFilePath)];
        const { backendCollections } = await import(collectionsFilePath);
        await generateSchema(backendCollections);
    } catch (error) {
        console.error("Error generating schema:", error);
    }
};

const main = () => {
    const watch = process.argv.includes("--watch");

    if (watch) {
        console.log(`Watching for changes in ${path.basename(collectionsFilePath)}...`);
        const watcher = chokidar.watch(collectionsFilePath, {
            persistent: true,
            ignoreInitial: true,
        });

        watcher.on("change", async (filePath) => {
            console.log(`File ${path.basename(filePath)} has been changed. Regenerating schema...`);
            await runGeneration();
        });

        watcher.on("ready", () => {
            console.log("Initial schema generation...");
            runGeneration();
        });
    } else {
        console.log("Generating schema...");
        runGeneration();
    }
};

main();
