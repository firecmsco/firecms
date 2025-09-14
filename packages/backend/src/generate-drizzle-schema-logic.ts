import {
    EntityCollection,
    NumberProperty,
    Property,
    Relation,
    RelationProperty,
    StringProperty
} from "@firecms/types";
import {
    getColumnName,
    getEnumVarName,
    getTableName,
    getTableVarName,
    resolveCollectionRelations,
    toSnakeCase
} from "@firecms/common";

// --- Helper Functions ---

/**
 * Helper function to extract column name(s) from fully qualified column reference(s)
 */
function getColumnNamesFromColumns(columns: string | string[]): string[] {
    if (Array.isArray(columns)) {
        return columns.map(col => getColumnName(col));
    }
    return [getColumnName(columns)];
}

const isNumericId = (collection: EntityCollection): boolean => {
    const idField = collection.idField ?? "id";
    const idProp = collection.properties?.[idField] as Property | undefined;
    if (idProp?.type === "number") return true;
    // Default serial IDs are numbers, so if no customId is specified, it's numeric.
    return !collection.customId;
};

const getJunctionKeyColumns = (keys: string | string[], targetCollection: EntityCollection, refOptions: string): string[] => {
    const keyArray = Array.isArray(keys) ? keys : [keys];
    const targetTableVar = getTableVarName(getTableName(targetCollection));
    const idField = targetCollection.idField ?? "id";
    const columnType = isNumericId(targetCollection) ? "integer" : "varchar";

    return keyArray.map(key => {
        const columnName = getColumnName(key);
        const targetIdField = getColumnName(idField);
        return `	${columnName}: ${columnType}("${toSnakeCase(columnName)}").references(() => ${targetTableVar}.${targetIdField}, ${refOptions}).notNull()`;
    });
};

const getDrizzleIdColumn = (collection: EntityCollection): string => {
    const idField = collection.idField ?? "id";
    if (collection.customId) {
        const idType = isNumericId(collection) ? "integer" : "varchar";
        return `	${idField}: ${idType}("${toSnakeCase(idField)}").primaryKey()`;
    } else {
        return `	${idField}: serial("${toSnakeCase(idField)}").primaryKey()`;
    }
}

const getDrizzleColumn = (propName: string, prop: Property, collection: EntityCollection): string | null => {
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
            const relation = collection.relations?.find((rel) => rel.relationName === refProp.relationName)

            if (!relation || relation.cardinality === "many") {
                return null; // Many-to-many is virtual here, handled by junction table.
            }

            let targetCollection: EntityCollection | undefined;
            try {
                targetCollection = relation.target();
            } catch {
                // This can happen if the target collection is not in the list, which is a valid case for subcollections.
                return null;
            }

            if (!targetCollection) {
                console.warn(`Could not find target collection for relation property ${propName}`);
                return null;
            }

            if (!relation.joins || relation.joins.length === 0) {
                return null;
            }
            const join = relation.joins[0];

            // Handle multi-column joins - use first column for simple FK cases
            const sourceColumnNames = getColumnNamesFromColumns(join.sourceColumn);
            const targetColumnNames = getColumnNamesFromColumns(join.targetColumn);
            const fkColumnName = sourceColumnNames[0];
            const targetIdField = targetColumnNames[0];

            const baseColumn = isNumericId(targetCollection) ? `integer("${fkColumnName}")` : `varchar("${fkColumnName}")`;
            const targetTableVar = getTableVarName(getTableName(targetCollection));

            const onUpdate = relation.onUpdate ? `onUpdate: "${relation.onUpdate}"` : "";
            const required = (prop).validation?.required;

            let onDeleteVal = relation.onDelete;
            if (!onDeleteVal) {
                onDeleteVal = required ? "cascade" : "set null";
            }
            const onDelete = `onDelete: "${onDeleteVal}"`;

            const refOptionsParts = [onUpdate, onDelete].filter(Boolean);
            const refOptions = refOptionsParts.length > 0 ? `{ ${refOptionsParts.join(", ")} }` : "";

            let columnDef = `${baseColumn}.references(() => ${targetTableVar}.${targetIdField}${refOptions ? `, ${refOptions}` : ""})`;

            if (required) {
                columnDef += ".notNull()";
            }

            return `${fkColumnName}: ${columnDef}`;
        }
        case "array": {
            const arrayProp = prop;
            if (Array.isArray(arrayProp.of) || arrayProp.of?.type === "relation") {
                return null; // Virtual property for relation, no column needed.
            }
            columnDefinition = `jsonb("${colName}")`;
            break;
        }
        default:
            return null;
    }

    if ((prop).validation?.required) {
        columnDefinition += ".notNull()";
    }

    return `${propName}: ${columnDefinition}`;
};

// --- Main Schema Generation Logic ---

export const generateSchema = async (collections: EntityCollection[]): Promise<string> => {
    let schemaContent = "// This file is auto-generated by the FireCMS Drizzle generator. Do not edit manually.\n\n";
    schemaContent += "import { primaryKey, pgTable, integer, varchar, boolean, timestamp, jsonb, pgEnum, numeric, serial } from 'drizzle-orm/pg-core';\n";
    schemaContent += "import { relations as drizzleRelations } from 'drizzle-orm';\n\n";

    const relationsToGenerate: { tableVarName: string; relations: string[] }[] = [];
    const exportedEnumVars: string[] = [];
    const exportedTableVars: string[] = [];
    const exportedRelationVars: string[] = [];

    // 1. Generate Enums
    collections.forEach(collection => {
        const collectionPath = getTableName(collection);
        Object.entries(collection.properties ?? {}).forEach(([propName, prop]) => {
            const property = prop as Property;
            const enumData = "enum" in property ? property.enum : undefined;
            if ((property.type === "string" || property.type === "number") && enumData) {
                const enumVarName = getEnumVarName(collectionPath, propName);
                const enumDbName = `${collectionPath}_${toSnakeCase(propName)}`;

                let values: string[];
                if (Array.isArray(enumData)) {
                    if (enumData.length > 0 && typeof enumData[0] === "object" && enumData[0] !== null && "id" in enumData[0]) {
                        values = enumData.map((v: any) => String(v.id));
                    } else {
                        values = enumData.map(String);
                    }
                } else if (typeof enumData === "object") {
                    values = Object.keys(enumData);
                } else {
                    values = [];
                }

                if (values.length > 0) {
                    schemaContent += `export const ${enumVarName} = pgEnum("${enumDbName}", [${values.map((v: any) => `'${v}'`).join(", ")}]);\n`;
                    if (!exportedEnumVars.includes(enumVarName)) exportedEnumVars.push(enumVarName);
                }
            }
        });
    });
    if (exportedEnumVars.length > 0) schemaContent += "\n\n";

    // 2. Identify all unique tables to be generated (from collections and relations)
    const allTablesToGenerate = new Map<string, {
        collection: EntityCollection,
        isJunction?: boolean,
        relation?: Relation,
        sourceCollection?: EntityCollection
    }>();

    for (const collection of collections) {
        const tableName = getTableName(collection);
        if (tableName) {
            allTablesToGenerate.set(tableName, { collection });
        }
    }

    collections.forEach(sourceCollection => {
        const resolvedRelations = resolveCollectionRelations(sourceCollection);
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
                schemaContent += `	pk: primaryKey({ columns: [${[...sourceKeyArray, ...targetKeyArray].map(key => `table.${key}`).join(", ")}] })\n`;
                schemaContent += `}));\n\n`;

            } catch (e) {
                console.warn("Could not generate junction table:", e);
            }
        } else {
            schemaContent += `export const ${tableVarName} = pgTable("${tableName}", {\n`;
            schemaContent += getDrizzleIdColumn(collection);

            const columns = new Set<string>();
            Object.entries(collection.properties ?? {}).forEach(([propName, prop]) => {
                if (propName === (collection.idField ?? "id")) return;
                const columnString = getDrizzleColumn(propName, prop as Property, collection);
                if (columnString) columns.add(`	${columnString}`);
            });

            if (columns.size > 0) {
                schemaContent += `,\n${Array.from(columns).join(",\n")}`;
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
            const targetCollection = relation.target();
            const sourceTableVarName = getTableVarName(getTableName(sourceCollection));
            const targetTableVarName = getTableVarName(getTableName(targetCollection));
            const sourceIdField = sourceCollection.idField ?? "id";
            const targetIdField = targetCollection.idField ?? "id";

            // Handle multi-column joins - use first column for junction relations
            const sourceJunctionKeyNames = getColumnNamesFromColumns(relation.joins[0].targetColumn);
            const targetJunctionKeyNames = getColumnNamesFromColumns(relation.joins[1].sourceColumn);
            const sourceJunctionKey = sourceJunctionKeyNames[0];
            const targetJunctionKey = targetJunctionKeyNames[0];

            tableRelations.push(`	${sourceJunctionKey}: one(${sourceTableVarName}, {\n		fields: [${tableVarName}.${sourceJunctionKey}],\n		references: [${sourceTableVarName}.${sourceIdField}]\n	})`);
            tableRelations.push(`	${targetJunctionKey}: one(${targetTableVarName}, {\n		fields: [${tableVarName}.${targetJunctionKey}],\n		references: [${targetTableVarName}.${targetIdField}]\n	})`);
        } else {
            const collection = allTablesToGenerate.get(tableName)!.collection;
            const resolvedRelations = resolveCollectionRelations(collection);
            Object.entries(resolvedRelations).forEach(([relationKey, relationDef]) => {
                try {
                    const targetCollection = relationDef.target();
                    const targetTableName = getTableName(targetCollection);
                    const targetTableVarName = getTableVarName(targetTableName);

                    if (relationDef.cardinality === "one") {
                        if (!relationDef.joins || relationDef.joins.length === 0) return;
                        const join = relationDef.joins[0];

                        // Handle multi-column joins - use first column for relation definitions
                        const sourceColumnNames = getColumnNamesFromColumns(join.sourceColumn);
                        const targetColumnNames = getColumnNamesFromColumns(join.targetColumn);
                        const sourceColumnName = sourceColumnNames[0];
                        const targetColumnName = targetColumnNames[0];

                        const fieldsStr = `${tableVarName}.${sourceColumnName}`;
                        const referencesStr = `${targetTableVarName}.${targetColumnName}`;
                        const relationName = relationDef.relationName ?? relationKey;
                        const relationArgs = `{\n		fields: [${fieldsStr}],\n		references: [${referencesStr}],\n		relationName: "${relationName}"\n	}`;
                        tableRelations.push(`	${relationKey}: one(${targetTableVarName}, ${relationArgs})`);
                    } else if (relationDef.cardinality === "many") {
                        if (!relationDef.joins) {
                            console.warn(`Could not generate Drizzle relation for ${relationKey}: joins not defined.`);
                            return;
                        }
                        const relationName = relationDef.relationName ?? relationKey;
                        if (relationDef.joins.length > 1) { // Many-to-many
                            const junctionTableName = relationDef.joins[0].table;
                            const junctionTableVarName = getTableVarName(junctionTableName);
                            tableRelations.push(`	${relationKey}: many(${junctionTableVarName}, { relationName: "${relationName}" })`);
                        } else { // One-to-many
                            tableRelations.push(`	${relationKey}: many(${targetTableVarName}, { relationName: "${relationName}" })`);
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

    return schemaContent;
};
