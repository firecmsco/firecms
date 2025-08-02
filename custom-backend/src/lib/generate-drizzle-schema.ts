import { promises as fs } from "fs";
import path from "path";
import chokidar from "chokidar";
import {
    AnyProperty,
    ArrayProperty,
    EntityCollection,
    NumberProperty,
    Property,
    ReferenceProperty,
    RelationshipProperty,
    StringProperty
} from "@firecms/core";

// Helper to convert camelCase to snake_case
const toSnakeCase = (str: string) =>
    str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

const getDrizzleColumn = (propName: string, prop: AnyProperty, collection: EntityCollection): string => {
    const colName = toSnakeCase(propName);
    let columnDefinition: string;

    switch (prop.type) {
        case "string":
            const stringProp = prop as StringProperty;
            if (stringProp.enumValues) {
                const enumName = `${toSnakeCase(collection.dbPath)}_${toSnakeCase(propName)}_enum`;
                columnDefinition = `${enumName}("${colName}")`;
            } else {
                columnDefinition = `varchar("${colName}")`;
            }
            break;
        case "number":
            const numProp = prop as NumberProperty;
            columnDefinition = numProp.validation?.integer ? `integer("${colName}")` : `decimal("${colName}")`;
            break;
        case "boolean":
            columnDefinition = `boolean("${colName}")`;
            break;
        case "date":
            columnDefinition = `timestamp("${colName}", { withTimezone: true })`;
            break;
        case "map":
            columnDefinition = `jsonb("${colName}")`;
            break;
        case "reference":
            const refProp = prop as ReferenceProperty;
            const targetTable = refProp.path;
            columnDefinition = `integer("${colName}").references(() => ${targetTable}.id)`;
            break;
        case "relationship":
            const relProp = prop as RelationshipProperty;
            if (!relProp.hasMany) {
                const fkName = relProp.sourceForeignKey ? toSnakeCase(String(relProp.sourceForeignKey)) : `${toSnakeCase(relProp.target)}_id`;
                return `${propName}: integer("${fkName}").references(() => ${relProp.target}.id)`;
            }
            return ""; // one-to-many and many-to-many are handled by other tables
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
    let schemaContent = `import { pgTable, integer, varchar, boolean, timestamp, jsonb, pgEnum, decimal, index } from "drizzle-orm/pg-core";\n\n`;

    // Generate Enums
    collections.forEach(collection => {
        Object.entries(collection.properties).forEach(([propName, prop]) => {
            const property = prop as Property;
            if ((property.type === "string" || property.type === "number") && property.enumValues) {
                const enumName = `${toSnakeCase(collection.dbPath)}_${toSnakeCase(propName)}_enum`;
                const values = Array.isArray(property.enumValues)
                    ? property.enumValues.map(v => String(v.id))
                    : Object.keys(property.enumValues);
                schemaContent += `export const ${enumName} = pgEnum("${enumName}", [${values.map(v => `'${v.toLowerCase().replace(/\s+/g, "_")}'`).join(", ")}]);\n`;
            }
        });
    });
    schemaContent += "\n";

    // Generate Tables
    for (const collection of collections) {
        const tableName = collection.dbPath;
        schemaContent += `export const ${tableName} = pgTable("${tableName}", {\n`;
        schemaContent += `    id: integer("id").primaryKey(),\n`;

        const columns: string[] = [];
        const arrayProperties: { propName: string, prop: ArrayProperty }[] = [];

        Object.entries(collection.properties).forEach(([propName, prop]) => {
            const columnString = getDrizzleColumn(propName, prop as AnyProperty, collection);
            if (columnString) columns.push(`    ${columnString}`);
            if ((prop as AnyProperty).type === "array") {
                arrayProperties.push({
                    propName,
                    prop: prop as ArrayProperty
                });
            }
        });

        schemaContent += columns.join(",\n");
        schemaContent += `\n});\n\n`;

        // Generate tables for array properties
        for (const {
            propName,
            prop
        } of arrayProperties) {
            const subTableName = `${tableName}_${toSnakeCase(propName)}`;
            schemaContent += `export const ${subTableName} = pgTable("${subTableName}", {\n`;
            schemaContent += `    _order: integer("_order").notNull(),\n`;
            schemaContent += `    _parent_id: integer("_parent_id").notNull().references(() => ${tableName}.id, { onDelete: "cascade" }),\n`;

            if (prop.of) {
                const ofProp = Array.isArray(prop.of) ? prop.of[0] : prop.of;
                if (ofProp.type === "string") {
                    schemaContent += `    value: varchar("value")\n`;
                } else if (ofProp.type === "number") {
                    schemaContent += `    value: decimal("value")\n`;
                } else if (ofProp.type === "map" && ofProp.properties) {
                    Object.entries(ofProp.properties).forEach(([key, value]) => {
                        const column = getDrizzleColumn(key, value as AnyProperty, collection);
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
        const { allCollections } = await import(collectionsFilePath);
        await generateSchema(allCollections);
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
            ignoreInitial: true, // Don't run on initial scan
        });

        watcher.on("change", async (path) => {
            console.log(`File ${path} has been changed. Regenerating schema...`);
            await runGeneration();
        });

        watcher.on("ready", () => {
            console.log("Initial schema generation...");
            runGeneration(); // Run once on start
        });
    } else {
        console.log("Generating schema...");
        runGeneration();
    }
};

main();
