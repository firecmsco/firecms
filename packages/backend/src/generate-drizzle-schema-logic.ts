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
                // Check if this property is used as a foreign key in any relation
                const relation = collection.relations?.find(rel => rel.localKey === propName);
                if (relation) {
                    try {
                        const targetCollection = relation.target();
                        const targetTableVar = getTableVarName(getTableName(targetCollection));
                        const targetIdField = targetCollection.idField ?? "id";

                        const baseColumn = isNumericId(targetCollection) ? `integer("${colName}")` : `varchar("${colName}")`;

                        const onUpdate = relation.onUpdate ? `onUpdate: "${relation.onUpdate}"` : "";
                        const required = prop.validation?.required;

                        let onDeleteVal = relation.onDelete;
                        if (!onDeleteVal) {
                            onDeleteVal = required ? "cascade" : "set null";
                        }
                        const onDelete = `onDelete: "${onDeleteVal}"`;

                        const refOptionsParts = [onUpdate, onDelete].filter(Boolean);
                        const refOptions = refOptionsParts.length > 0 ? `{ ${refOptionsParts.join(", ")} }` : "";

                        columnDefinition = `${baseColumn}.references(() => ${targetTableVar}.${targetIdField}${refOptions ? `, ${refOptions}` : ""})`;

                        if (required) {
                            columnDefinition += ".notNull()";
                        }
                    } catch {
                        // Fall back to regular numeric column if target collection can't be resolved
                        columnDefinition = numProp.validation?.integer ? `integer("${colName}")` : `numeric("${colName}")`;
                    }
                } else {
                    columnDefinition = numProp.validation?.integer ? `integer("${colName}")` : `numeric("${colName}")`;
                }
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

            // Skip generating columns for inverse relations - the FK is on the other table
            if (relation.direction === "inverse") {
                return null;
            }

            // Skip generating columns for relation properties when the FK property already exists
            if (relation.localKey && collection.properties[relation.localKey]) {
                return null; // The FK column will be generated by the actual property, not the relation property
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

            // Use localKey for owning relations, or fall back to joins format
            let fkColumnName: string;
            let targetIdField: string;

            if (relation.localKey) {
                // New format: use localKey and target collection's ID field
                fkColumnName = relation.localKey;
                targetIdField = targetCollection.idField ?? "id";
            } else if (relation.joins && relation.joins.length > 0) {
                // Old format: use joins
                const join = relation.joins[0];
                const sourceColumnNames = getColumnNamesFromColumns(join.sourceColumn);
                const targetColumnNames = getColumnNamesFromColumns(join.targetColumn);
                fkColumnName = sourceColumnNames[0];
                targetIdField = targetColumnNames[0];
            } else {
                return null;
            }

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
            if (relation.cardinality === "many") {
                let junctionTableName: string | undefined;

                if (relation.through) {
                    // New format: many-to-many with through table
                    junctionTableName = relation.through.table;
                } else if (relation.joins && relation.joins.length > 1) {
                    // Old format: many-to-many with joins
                    junctionTableName = relation.joins[0].table;
                }

                if (junctionTableName && !allTablesToGenerate.has(junctionTableName)) {
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
                const targetCollection = relation.target();
                let sourceJunctionKey: string;
                let targetJunctionKey: string;

                if (relation.through) {
                    // New format: many-to-many with through table
                    sourceJunctionKey = relation.through.sourceColumn;
                    targetJunctionKey = relation.through.targetColumn;
                } else if (relation.joins && relation.joins.length >= 2) {
                    // Old format: many-to-many with joins
                    const junctionJoin = relation.joins[0];
                    const targetJoin = relation.joins[1];
                    sourceJunctionKey = junctionJoin.targetColumn;
                    targetJunctionKey = targetJoin.sourceColumn;
                } else {
                    console.warn(`Could not generate junction table for relation ${relation.relationName}: insufficient relation configuration.`);
                    continue;
                }

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
            const targetCollection = relation.target();
            const sourceTableVarName = getTableVarName(getTableName(sourceCollection));
            const targetTableVarName = getTableVarName(getTableName(targetCollection));
            const sourceIdField = sourceCollection.idField ?? "id";
            const targetIdField = targetCollection.idField ?? "id";

            let sourceJunctionKey: string;
            let targetJunctionKey: string;

            if (relation.through) {
                // New format: many-to-many with through table
                sourceJunctionKey = getColumnName(relation.through.sourceColumn);
                targetJunctionKey = getColumnName(relation.through.targetColumn);
            } else if (relation.joins && relation.joins.length >= 2) {
                // Old format: many-to-many with joins
                const sourceJunctionKeyNames = getColumnNamesFromColumns(relation.joins[0].targetColumn);
                const targetJunctionKeyNames = getColumnNamesFromColumns(relation.joins[1].sourceColumn);
                sourceJunctionKey = sourceJunctionKeyNames[0];
                targetJunctionKey = targetJunctionKeyNames[0];
            } else {
                console.warn(`Could not generate Drizzle relation for junction table for relation ${relation.relationName}: insufficient relation configuration.`);
                continue;
            }

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
                        // Handle both new format (localKey/foreignKeyOnTarget) and old format (joins)
                        let sourceColumnName: string;
                        let targetColumnName: string;

                        if (relationDef.direction === "owning" && relationDef.localKey) {
                            // New format: owning relation with localKey
                            sourceColumnName = relationDef.localKey;
                            targetColumnName = targetCollection.idField ?? "id";
                        } else if (relationDef.direction === "inverse" && relationDef.foreignKeyOnTarget) {
                            // New format: inverse relation with foreignKeyOnTarget
                            sourceColumnName = collection.idField ?? "id";
                            targetColumnName = relationDef.foreignKeyOnTarget;
                        } else if (relationDef.joins && relationDef.joins.length > 0) {
                            // Old format: use joins
                            const join = relationDef.joins[0];
                            const sourceColumnNames = getColumnNamesFromColumns(join.sourceColumn);
                            const targetColumnNames = getColumnNamesFromColumns(join.targetColumn);
                            sourceColumnName = sourceColumnNames[0];
                            targetColumnName = targetColumnNames[0];
                        } else {
                            return; // Skip if no valid relation config found
                        }

                        const relationName = relationDef.relationName ?? relationKey;

                        if (relationDef.direction === "inverse") {
                            // For inverse relations, we don't own the FK, so we reference via the target table's FK
                            // The relation goes from this table to target table via target's FK column
                            const relationArgs = `{\n		fields: [${tableVarName}.${sourceColumnName}],\n		references: [${targetTableVarName}.${targetColumnName}],\n		relationName: "${relationName}"\n	}`;
                            tableRelations.push(`	${relationKey}: one(${targetTableVarName}, ${relationArgs})`);
                        } else {
                            // For owning relations, use standard field/reference mapping
                            const fieldsStr = `${tableVarName}.${sourceColumnName}`;
                            const referencesStr = `${targetTableVarName}.${targetColumnName}`;
                            const relationArgs = `{\n		fields: [${fieldsStr}],\n		references: [${referencesStr}],\n		relationName: "${relationName}"\n	}`;
                            tableRelations.push(`	${relationKey}: one(${targetTableVarName}, ${relationArgs})`);
                        }
                    } else if (relationDef.cardinality === "many") {
                        const relationName = relationDef.relationName ?? relationKey;

                        if (relationDef.through) {
                            // New format: many-to-many with through table
                            const junctionTableName = relationDef.through.table;
                            const junctionTableVarName = getTableVarName(junctionTableName);
                            tableRelations.push(`	${relationKey}: many(${junctionTableVarName}, { relationName: "${relationName}" })`);
                        } else if (relationDef.joins && relationDef.joins.length > 1) {
                            // Old format: many-to-many with joins
                            const junctionTableName = relationDef.joins[0].table;
                            const junctionTableVarName = getTableVarName(junctionTableName);
                            tableRelations.push(`	${relationKey}: many(${junctionTableVarName}, { relationName: "${relationName}" })`);
                        } else if (relationDef.direction === "inverse") {
                            // One-to-many inverse relation
                            tableRelations.push(`	${relationKey}: many(${targetTableVarName}, { relationName: "${relationName}" })`);
                        } else {
                            console.warn(`Could not generate Drizzle relation for ${relationKey}: unclear many relation format.`);
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
