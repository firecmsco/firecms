import { EntityCollection, NumberProperty, Property, Relation, RelationProperty, StringProperty } from "@firecms/types";
import {
    getEnumVarName,
    getTableName,
    getTableVarName,
    resolveCollectionRelations,
    toSnakeCase
} from "@firecms/common";

// --- Helper Functions ---

const isNumericId = (collection: EntityCollection): boolean => {
    const idField = collection.idField ?? "id";
    const idProp = collection.properties?.[idField] as Property | undefined;
    if (idProp?.type === "number") return true;
    return !collection.customId;
};

const getDrizzleIdColumn = (collection: EntityCollection): string => {
    const idField = collection.idField ?? "id";
    if (collection.customId) {
        const idType = isNumericId(collection) ? "integer" : "varchar";
        return `    ${idField}: ${idType}(\"${toSnakeCase(idField)}\").primaryKey()`;
    } else {
        return `    ${idField}: serial(\"${toSnakeCase(idField)}\").primaryKey()`;
    }
};

const getDrizzleColumn = (propName: string, prop: Property, collection: EntityCollection): string | null => {
    const colName = toSnakeCase(propName);
    let columnDefinition: string;

    switch (prop.type) {
        case "string": {
            const stringProp = prop as StringProperty;
            if (stringProp.enum) {
                const enumName = getEnumVarName(getTableName(collection), propName);
                columnDefinition = `${enumName}(\"${colName}\")`;
            } else {
                columnDefinition = `varchar(\"${colName}\")`;
            }
            break;
        }
        case "number": {
            const numProp = prop as NumberProperty;
            const isId = propName === (collection.idField ?? "id");
            columnDefinition = (numProp.validation?.integer || isId) ? `integer(\"${colName}\")` : `numeric(\"${colName}\")`;
            break;
        }
        case "boolean":
            columnDefinition = `boolean(\"${colName}\")`;
            break;
        case "date":
            columnDefinition = `timestamp(\"${colName}\", { withTimezone: true, mode: 'string' })`;
            break;
        case "map":
        case "array": // Arrays of non-relational data are stored as JSON
            columnDefinition = `jsonb(\"${colName}\")`;
            break;
        case "relation": {
            const refProp = prop as RelationProperty;
            const resolvedRelations = resolveCollectionRelations(collection);
            const relation = resolvedRelations[refProp.relationName ?? propName];

            // Only owning one-to-one/many-to-one relations create a column here.
            if (!relation || relation.direction !== "owning" || relation.cardinality !== "one") {
                return null;
            }

            // The localKey property is the source of truth for the FK column name.
            if (!relation.localKey) {
                console.warn(`Could not generate column for owning relation '${relation.relationName}' on '${collection.name}': 'localKey' is not defined.`);
                return null;
            }

            // If the localKey property is defined elsewhere in the properties, it will be handled there.
            // This logic is for when the relation property itself defines the FK.
            if (collection.properties[relation.localKey] && propName !== relation.localKey) {
                return null;
            }

            let targetCollection: EntityCollection;
            try {
                targetCollection = relation.target();
            } catch {
                return null; // Cannot resolve target
            }

            const fkColumnName = toSnakeCase(relation.localKey);
            const targetTableVar = getTableVarName(getTableName(targetCollection));
            const targetIdField = targetCollection.idField ?? "id";
            const baseColumn = isNumericId(targetCollection) ? `integer(\"${fkColumnName}\")` : `varchar(\"${fkColumnName}\")`;

            const onUpdate = relation.onUpdate ? `onUpdate: \"${relation.onUpdate}\"` : "";
            const required = prop.validation?.required;
            const onDeleteVal = relation.onDelete ?? (required ? "cascade" : "set null");
            const onDelete = `onDelete: \"${onDeleteVal}\"`;

            const refOptionsParts = [onUpdate, onDelete].filter(Boolean);
            const refOptions = refOptionsParts.length > 0 ? `{ ${refOptionsParts.join(", ")} }` : "";

            let columnDef = `${baseColumn}.references(() => ${targetTableVar}.${targetIdField}${refOptions ? `, ${refOptions}` : ""})`;

            if (required) {
                columnDef += ".notNull()";
            }

            return `    ${relation.localKey}: ${columnDef}`;
        }
        default:
            return null;
    }

    if (prop.validation?.required) {
        columnDefinition += ".notNull()";
    }

    return `    ${propName}: ${columnDefinition}`;
};

// --- Main Schema Generation Logic ---
export const generateSchema = async (collections: EntityCollection[]): Promise<string> => {
    let schemaContent = "// This file is auto-generated by the FireCMS Drizzle generator. Do not edit manually.\n\n";
    schemaContent += "import { primaryKey, pgTable, integer, varchar, boolean, timestamp, jsonb, pgEnum, numeric, serial } from 'drizzle-orm/pg-core';\n";
    schemaContent += "import { relations as drizzleRelations } from 'drizzle-orm';\n\n";

    const exportedTableVars: string[] = [];
    const exportedEnumVars: string[] = [];
    const exportedRelationVars: string[] = [];

    const allTablesToGenerate = new Map<string, {
        collection: EntityCollection,
        isJunction?: boolean,
        relation?: Relation,
        sourceCollection?: EntityCollection
    }>();

    // 1. Generate Enums
    collections.forEach(collection => {
        const collectionPath = getTableName(collection);
        Object.entries(collection.properties ?? {}).forEach(([propName, prop]) => {
            if (("enum" in prop) && (prop.type === "string" || prop.type === "number") && prop.enum) {
                const enumVarName = getEnumVarName(collectionPath, propName);
                const enumDbName = `${collectionPath}_${toSnakeCase(propName)}`;
                const values = Array.isArray(prop.enum)
                    ? prop.enum.map(v => String(v.id ?? v))
                    : Object.keys(prop.enum);
                if (values.length > 0) {
                    schemaContent += `export const ${enumVarName} = pgEnum(\"${enumDbName}\", [${values.map(v => `'${v}'`).join(", ")}]);\n`;
                    if (!exportedEnumVars.includes(enumVarName)) exportedEnumVars.push(enumVarName);
                }
            }
        });
    });
    schemaContent += "\n";

    // 2. Identify all tables (collections and junction tables only)
    for (const collection of collections) {
        const tableName = getTableName(collection);
        if (tableName) {
            allTablesToGenerate.set(tableName, { collection });
        }

        const resolvedRelations = resolveCollectionRelations(collection);
        for (const relation of Object.values(resolvedRelations)) {
            if (relation.through) { // Standard M2M junction table
                const junctionTableName = relation.through.table;
                if (!allTablesToGenerate.has(junctionTableName)) {
                    allTablesToGenerate.set(junctionTableName, {
                        collection: { dbPath: junctionTableName, properties: {} } as EntityCollection,
                        isJunction: true,
                        relation: relation,
                        sourceCollection: collection
                    });
                }
            }
            // joinPath relations use existing user-controlled tables - no generation needed
        }
    }

    // 3. Generate pgTable definitions for all unique tables
    for (const [tableName, { collection, isJunction, relation, sourceCollection }] of allTablesToGenerate.entries()) {
        const tableVarName = getTableVarName(tableName);
        if (isJunction && relation && sourceCollection && relation.through) {
            const targetCollection = relation.target();
            const { sourceColumn, targetColumn } = relation.through;

            const onDelete = relation.onDelete ?? "cascade";
            const refOptions = `{ onDelete: \"${onDelete}\" }`;

            const sourceColType = isNumericId(sourceCollection) ? "integer" : "varchar";
            const targetColType = isNumericId(targetCollection) ? "integer" : "varchar";
            const sourceId = sourceCollection.idField ?? 'id';
            const targetId = targetCollection.idField ?? 'id';

            schemaContent += `export const ${tableVarName} = pgTable(\"${tableName}\", {\n`;
            schemaContent += `    ${sourceColumn}: ${sourceColType}(\"${toSnakeCase(sourceColumn)}\").notNull().references(() => ${getTableVarName(getTableName(sourceCollection))}.${sourceId}, ${refOptions}),\n`;
            schemaContent += `    ${targetColumn}: ${targetColType}(\"${toSnakeCase(targetColumn)}\").notNull().references(() => ${getTableVarName(getTableName(targetCollection))}.${targetId}, ${refOptions}),\n`;
            schemaContent += `}, (table) => ({\n`;
            schemaContent += `    pk: primaryKey({ columns: [table.${sourceColumn}, table.${targetColumn}] })\n`;
            schemaContent += `}));\n\n`;
        } else if(!isJunction) {
            schemaContent += `export const ${tableVarName} = pgTable(\"${tableName}\", {\n`;
            schemaContent += getDrizzleIdColumn(collection);
            const columns = new Set<string>();
            Object.entries(collection.properties ?? {}).forEach(([propName, prop]) => {
                if (propName === (collection.idField ?? "id")) return;
                const columnString = getDrizzleColumn(propName, prop as Property, collection);
                if (columnString) columns.add(columnString);
            });
            if (columns.size > 0) schemaContent += `,\n${Array.from(columns).join(",\n")}`;
            schemaContent += "\n});\n\n";
        }
        if (!exportedTableVars.includes(tableVarName)) exportedTableVars.push(tableVarName);
    }

    // 4. Generate Drizzle Relations
    for (const [tableName, { collection, isJunction }] of allTablesToGenerate.entries()) {
        const tableVarName = getTableVarName(tableName);
        const tableRelations: string[] = [];

        if (isJunction) {
            const relationInfo = Array.from(allTablesToGenerate.values()).find(v => v.isJunction && getTableName(v.collection) === tableName);
            if(relationInfo && relationInfo.relation && relationInfo.sourceCollection && relationInfo.relation.through) {
                const { relation, sourceCollection } = relationInfo;
                const targetCollection = relation.target();
                const sourceTableVar = getTableVarName(getTableName(sourceCollection));
                const targetTableVar = getTableVarName(getTableName(targetCollection));
                const sourceId = sourceCollection.idField ?? "id";
                const targetId = targetCollection.idField ?? "id";

                if (!relation?.through)
                    throw new Error("Internal, the relation should have a through property. Relations passed to this script should sanitized first with sanitizeRelation().");

                tableRelations.push(`    ${relation.through.sourceColumn}: one(${sourceTableVar}, {\n        fields: [${tableVarName}.${relation.through.sourceColumn}],\n        references: [${sourceTableVar}.${sourceId}]\n    })`);
                tableRelations.push(`    ${relation.through.targetColumn}: one(${targetTableVar}, {\n        fields: [${tableVarName}.${relation.through.targetColumn}],\n        references: [${targetTableVar}.${targetId}]\n    })`);
            }
        } else {
            const resolvedRelations = resolveCollectionRelations(collection);
            for (const [relationKey, rel] of Object.entries(resolvedRelations)) {
                try {
                    const target = rel.target();
                    const targetTableVar = getTableVarName(getTableName(target));
                    const relationName = rel.relationName ?? relationKey;

                    // Determine the correct relation name for Drizzle
                    // For inverse relations, use inverseRelationName if specified
                    const drizzleRelationName = (rel.direction === "inverse" && rel.inverseRelationName)
                        ? rel.inverseRelationName
                        : relationName;

                    if (rel.cardinality === "one") {
                        if (rel.direction === "owning" && rel.localKey) {
                            tableRelations.push(`    ${relationKey}: one(${targetTableVar}, {\n        fields: [${tableVarName}.${rel.localKey}],\n        references: [${targetTableVar}.${target.idField ?? "id"}],\n        relationName: \"${drizzleRelationName}\"\n    })`);
                        }
                        else if (rel.direction === "inverse" && rel.foreignKeyOnTarget) {
                            const sourceIdField = collection.idField ?? "id";
                            tableRelations.push(`    ${relationKey}: one(${targetTableVar}, {\n        fields: [${tableVarName}.${sourceIdField}],\n        references: [${targetTableVar}.${rel.foreignKeyOnTarget}],\n        relationName: \"${drizzleRelationName}\"\n    })`);
                        }
                        else if (rel.direction === "inverse" && !rel.foreignKeyOnTarget) {
                            // Handle inverse one-to-one relations where the FK is on the target table
                            // but foreignKeyOnTarget is not explicitly specified
                            // In this case, we need to find the corresponding owning relation on the target
                            try {
                                const targetCollection = rel.target();
                                const targetResolvedRelations = resolveCollectionRelations(targetCollection);

                                // Find the owning relation on the target that points back to this collection
                                const correspondingRelation = Object.values(targetResolvedRelations).find(targetRel =>
                                    targetRel.direction === "owning" &&
                                    targetRel.cardinality === "one" &&
                                    targetRel.target().slug === collection.slug
                                );

                                if (correspondingRelation && correspondingRelation.localKey) {
                                    const sourceIdField = collection.idField ?? "id";
                                    tableRelations.push(`    ${relationKey}: one(${targetTableVar}, {\n        fields: [${tableVarName}.${sourceIdField}],\n        references: [${targetTableVar}.${correspondingRelation.localKey}],\n        relationName: \"${drizzleRelationName}\"\n    })`);
                                }
                            } catch (e) {
                                console.warn(`Could not resolve inverse one-to-one relation '${relationKey}':`, e);
                            }
                        }
                    } else if (rel.cardinality === "many") {
                        if (rel.direction === "inverse" && rel.foreignKeyOnTarget) {
                            tableRelations.push(`    ${relationKey}: many(${targetTableVar}, { relationName: \"${drizzleRelationName}\" })`);
                        } else if (rel.through) {
                            const junctionTableVar = getTableVarName(rel.through.table);
                            tableRelations.push(`    ${relationKey}: many(${junctionTableVar}, { relationName: \"${drizzleRelationName}\" })`);
                        }
                        // joinPath relations don't generate Drizzle relations - they use existing user tables
                    }
                } catch (e) {
                    console.warn(`Could not generate relation ${relationKey} for ${collection.name}:`, e);
                }
            }
        }

        if (tableRelations.length > 0) {
            const relVarName = `${tableVarName}Relations`;
            schemaContent += `export const ${relVarName} = drizzleRelations(${tableVarName}, ({ one, many }) => ({\n${tableRelations.join(",\n")}\n}));\n\n`;
            if (!exportedRelationVars.includes(relVarName)) exportedRelationVars.push(relVarName);
        }
    }

    // <<< ADDED: Final aggregated exports block
    const tablesExport = `export const tables = { ${exportedTableVars.join(", ")} };\n`;
    const enumsExport = `export const enums = { ${exportedEnumVars.join(", ")} };\n`;
    const relationsExport = `export const relations = { ${exportedRelationVars.join(", ")} };\n\n`;
    schemaContent += tablesExport + enumsExport + relationsExport;

    return schemaContent;
};
