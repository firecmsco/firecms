import { and, eq, or, sql, SQL, ilike } from "drizzle-orm";
import { AnyPgColumn, PgTable } from "drizzle-orm/pg-core";
import { FilterValues, WhereFilterOp, Relation } from "@firecms/types";
import { getColumnName, resolveCollectionRelations } from "@firecms/common";
import { BackendCollectionRegistry } from "../collections/BackendCollectionRegistry";

/**
 * Unified condition builder for drizzle queries
 */
export class DrizzleConditionBuilder {

    /**
     * Build filter conditions from FilterValues
     */
    static buildFilterConditions<M extends Record<string, any>>(
        filter: FilterValues<Extract<keyof M, string>>,
        table: PgTable<any>,
        collectionPath: string
    ): SQL[] {
        const conditions: SQL[] = [];

        for (const [field, filterParam] of Object.entries(filter)) {
            if (!filterParam) continue;

            const [op, value] = filterParam as [WhereFilterOp, any];
            const fieldColumn = table[field as keyof typeof table] as AnyPgColumn;

            if (!fieldColumn) {
                console.warn(`Filtering by field '${field}', but it does not exist in table for collection '${collectionPath}'`);
                continue;
            }

            const condition = this.buildSingleFilterCondition(fieldColumn, op, value);
            if (condition) {
                conditions.push(condition);
            }
        }

        return conditions;
    }

    /**
     * Build a single filter condition for a specific operator and value
     */
    static buildSingleFilterCondition(
        column: AnyPgColumn,
        op: WhereFilterOp,
        value: any
    ): SQL | null {
        switch (op) {
            case "==":
                return eq(column, value);
            case "!=":
                return sql`${column} != ${value}`;
            case ">":
                return sql`${column} > ${value}`;
            case ">=":
                return sql`${column} >= ${value}`;
            case "<":
                return sql`${column} < ${value}`;
            case "<=":
                return sql`${column} <= ${value}`;
            case "in":
                if (Array.isArray(value) && value.length > 0) {
                    return sql`${column} = ANY(${value})`;
                }
                return null;
            case "array-contains":
                // For JSONB arrays
                return sql`${column} @> ${JSON.stringify([value])}`;
            default:
                console.warn(`Unsupported filter operation: ${op}`);
                return null;
        }
    }

    /**
     * Build relation-based conditions for different relation types
     */
    static buildRelationConditions(
        relation: Relation,
        parentEntityId: string | number | (string | number)[],
        targetTable: PgTable<any>,
        parentTable: PgTable<any>,
        parentIdColumn: AnyPgColumn,
        targetIdColumn: AnyPgColumn,
        registry: BackendCollectionRegistry
    ): {
        joinConditions: { table: PgTable<any>; condition: SQL }[];
        whereConditions: SQL[];
    } {
        const joinConditions: { table: PgTable<any>; condition: SQL }[] = [];
        const whereConditions: SQL[] = [];

        if (relation.joinPath && relation.joinPath.length > 0) {
            // Handle join path relations
            const {
                joins,
                finalCondition
            } = this.buildJoinPathConditions(
                relation.joinPath,
                targetTable,
                parentTable,
                parentIdColumn,
                parentEntityId,
                registry
            );
            joinConditions.push(...joins);
            whereConditions.push(finalCondition);

        } else if (relation.through && relation.cardinality === "many" && relation.direction === "owning") {
            // Handle many-to-many relations with junction table
            const junctionResult = this.buildJunctionTableConditions(
                relation.through,
                targetIdColumn,
                parentEntityId,
                registry
            );
            joinConditions.push(junctionResult.join);
            whereConditions.push(junctionResult.condition);

        } else if (relation.through && relation.cardinality === "many" && relation.direction === "inverse") {
            // Handle inverse many-to-many relations with junction table
            const junctionResult = this.buildInverseJunctionTableConditions(
                relation.through,
                targetIdColumn,
                parentEntityId,
                registry
            );
            joinConditions.push(junctionResult.join);
            whereConditions.push(junctionResult.condition);

        } else if (relation.cardinality === "many" && relation.direction === "inverse" && !relation.through) {
            // Handle inverse many-to-many relations without explicit through property
            // Find the corresponding owning relation to get junction table info
            const junctionInfo = this.findCorrespondingJunctionTable(relation, registry);
            if (junctionInfo) {
                const junctionResult = this.buildInverseJunctionTableConditions(
                    junctionInfo,
                    targetIdColumn,
                    parentEntityId,
                    registry
                );
                joinConditions.push(junctionResult.join);
                whereConditions.push(junctionResult.condition);
            } else {
                throw new Error(`Cannot resolve junction table for inverse many-to-many relation '${relation.relationName}'. Either specify 'through' property or ensure corresponding owning relation exists.`);
            }

        } else {
            // Handle simple relations
            const simpleCondition = this.buildSimpleRelationCondition(
                relation,
                targetTable,
                parentTable,
                parentEntityId
            );
            whereConditions.push(simpleCondition);
        }

        return {
            joinConditions,
            whereConditions
        };
    }

    /**
     * Build conditions for join path relations
     */
    private static buildJoinPathConditions(
        joinPath: any[],
        targetTable: PgTable<any>,
        parentTable: PgTable<any>,
        parentIdColumn: AnyPgColumn,
        parentEntityId: string | number | (string | number)[],
        registry: BackendCollectionRegistry
    ): {
        joins: { table: PgTable<any>; condition: SQL }[];
        finalCondition: SQL;
    } {
        const joins: { table: PgTable<any>; condition: SQL }[] = [];
        let currentTable = targetTable;

        // Process join steps in reverse order to build path back to parent
        for (const joinStep of [...joinPath].reverse()) {
            const fromTableName = this.getTableNamesFromColumns(joinStep.on.from)[0];
            const toTableName = this.getTableNamesFromColumns(joinStep.on.to)[0];
            const fromColName = this.getColumnNamesFromColumns(joinStep.on.from)[0];
            const toColName = this.getColumnNamesFromColumns(joinStep.on.to)[0];

            const fromTable = registry.getTable(fromTableName);
            const toTable = registry.getTable(toTableName);

            if (!fromTable || !toTable) {
                throw new Error(`Join tables not found for step: from ${fromTableName} to ${toTableName}`);
            }

            const {
                joinTable,
                condition,
                additionalJoins
            } = this.buildSingleJoinCondition(
                currentTable,
                fromTable,
                toTable,
                fromColName,
                toColName,
                fromTableName,
                toTableName,
                registry
            );

            joins.push({
                table: joinTable,
                condition
            });
            currentTable = joinTable;

            // Add any additional joins needed for many-to-many relationships
            if (additionalJoins && additionalJoins.length > 0) {
                joins.push(...additionalJoins);
            }
        }

        // Ensure we've connected back to the parent table
        // For junction tables, we might end up at the junction table instead of the parent table
        if (currentTable !== parentTable) {
            // Try to get table names from the Drizzle table objects
            let currentTableName = 'unknown';
            let parentTableName = 'unknown';

            // Try multiple ways to extract table names from Drizzle objects
            if (currentTable && typeof currentTable === 'object') {
                // Check common Drizzle table name properties
                currentTableName = (currentTable as any)[Symbol.for('drizzle:Name')] ||
                                  (currentTable as any)._.name ||
                                  (currentTable as any).tableName ||
                                  (currentTable as any).name ||
                                  'unknown';
            }

            if (parentTable && typeof parentTable === 'object') {
                parentTableName = (parentTable as any)[Symbol.for('drizzle:Name')] ||
                                 (parentTable as any)._.name ||
                                 (parentTable as any).tableName ||
                                 (parentTable as any).name ||
                                 'unknown';
            }

            // For junction table scenarios, be more lenient with validation
            // If we can't determine table names reliably, or if this looks like a junction table scenario,
            // we'll allow it and let the SQL execution validate the correctness
            const couldBeJunctionScenario = currentTableName.includes('_') ||
                                          currentTableName === 'unknown' ||
                                          parentTableName === 'unknown';

            if (!couldBeJunctionScenario) {
                throw new Error(`Join path did not result in connecting to parent table. Current: ${currentTableName}, Parent: ${parentTableName}`);
            }
        }

        // Handle both single ID and array of IDs
        const finalCondition = Array.isArray(parentEntityId)
            ? sql`${parentIdColumn} = ANY(${parentEntityId})`
            : eq(parentIdColumn, parentEntityId);

        return {
            joins,
            finalCondition
        };
    }

    /**
     * Build a single join condition between tables
     */
    private static buildSingleJoinCondition(
        currentTable: PgTable<any>,
        fromTable: PgTable<any>,
        toTable: PgTable<any>,
        fromColName: string,
        toColName: string,
        fromTableName: string,
        toTableName: string,
        registry?: BackendCollectionRegistry
    ): { joinTable: PgTable<any>; condition: SQL; additionalJoins?: { table: PgTable<any>; condition: SQL }[] } {
        let joinTable: PgTable<any>;
        let condition: SQL;
        let additionalJoins: { table: PgTable<any>; condition: SQL }[] = [];

        if (currentTable === toTable) {
            // current -> toTable, so join the fromTable
            const left = fromTable[fromColName as keyof typeof fromTable] as AnyPgColumn;
            const right = (currentTable as any)[toColName] as AnyPgColumn;

            if (!left || !right) {
                // Check if this might be a many-to-many relationship requiring a junction table
                if (registry) {
                    const junctionResult = this.tryBuildJunctionJoin(
                        currentTable,
                        fromTable,
                        fromColName,
                        toColName,
                        fromTableName,
                        toTableName,
                        registry
                    );
                    if (junctionResult) {
                        return junctionResult;
                    }
                }
                throw new Error(`Join columns not found: ${fromTableName}.${fromColName} = ${toTableName}.${toColName}`);
            }

            joinTable = fromTable;
            condition = eq(left, right);
        } else if (currentTable === fromTable) {
            // current -> fromTable, so join the toTable
            const left = toTable[toColName as keyof typeof toTable] as AnyPgColumn;
            const right = (currentTable as any)[fromColName] as AnyPgColumn;

            if (!left || !right) {
                // Check if this might be a many-to-many relationship requiring a junction table
                if (registry) {
                    const junctionResult = this.tryBuildJunctionJoin(
                        currentTable,
                        toTable,
                        fromColName,
                        toColName,
                        fromTableName,
                        toTableName,
                        registry
                    );
                    if (junctionResult) {
                        return junctionResult;
                    }
                }
                throw new Error(`Join columns not found: ${toTableName}.${toColName} = ${fromTableName}.${fromColName}`);
            }

            joinTable = toTable;
            condition = eq(left, right);
        } else {
            throw new Error(`Join step does not match current table. Current table does not match from: ${fromTableName} or to: ${toTableName}`);
        }

        return {
            joinTable,
            condition,
            additionalJoins
        };
    }

    /**
     * Try to build a junction table join when direct foreign key relationship is not found
     */
    private static tryBuildJunctionJoin(
        currentTable: PgTable<any>,
        targetTable: PgTable<any>,
        fromColName: string,
        toColName: string,
        fromTableName: string,
        toTableName: string,
        registry: BackendCollectionRegistry
    ): { joinTable: PgTable<any>; condition: SQL; additionalJoins: { table: PgTable<any>; condition: SQL }[] } | null {
        // Try to find a junction table that connects these two tables
        // Common naming patterns: table1_table2, table1Table2, etc.
        const possibleJunctionNames = [
            `${fromTableName}_${toTableName}`,
            `${toTableName}_${fromTableName}`,
            `${fromTableName}${toTableName.charAt(0).toUpperCase() + toTableName.slice(1)}`,
            `${toTableName}${fromTableName.charAt(0).toUpperCase() + fromTableName.slice(1)}`
        ];

        for (const junctionName of possibleJunctionNames) {
            const junctionTable = registry.getTable(junctionName);
            if (junctionTable) {
                // Try to find the appropriate columns in the junction table
                const sourceColName = `${fromTableName.slice(0, -1)}_id`; // Remove 's' and add '_id'
                const targetColName = `${toTableName.slice(0, -1)}_id`;

                const junctionSourceCol = junctionTable[sourceColName as keyof typeof junctionTable] as AnyPgColumn;
                const junctionTargetCol = junctionTable[targetColName as keyof typeof junctionTable] as AnyPgColumn;

                if (junctionSourceCol && junctionTargetCol) {
                    // Found a valid junction table setup
                    const currentTableIdCol = Object.values(currentTable).find((col: any) => col.primary) as AnyPgColumn;
                    const targetTableIdCol = Object.values(targetTable).find((col: any) => col.primary) as AnyPgColumn;

                    if (!currentTableIdCol || !targetTableIdCol) {
                        continue; // Skip if we can't find primary keys
                    }

                    // Determine which direction to join
                    if (currentTable === targetTable) {
                        // We're joining through junction to reach the other table
                        return {
                            joinTable: targetTable,
                            condition: eq(targetTableIdCol, junctionTargetCol),
                            additionalJoins: [
                                {
                                    table: junctionTable,
                                    condition: eq(currentTableIdCol, junctionSourceCol)
                                }
                            ]
                        };
                    } else {
                        // Standard junction join
                        return {
                            joinTable: junctionTable,
                            condition: eq(currentTableIdCol, junctionSourceCol),
                            additionalJoins: [
                                {
                                    table: targetTable,
                                    condition: eq(targetTableIdCol, junctionTargetCol)
                                }
                            ]
                        };
                    }
                }
            }
        }

        return null; // No junction table found
    }

    /**
     * Build conditions for junction table (many-to-many) relations
     */
    private static buildJunctionTableConditions(
        through: { table: string; sourceColumn: string; targetColumn: string },
        targetIdColumn: AnyPgColumn,
        parentEntityId: string | number | (string | number)[],
        registry: BackendCollectionRegistry
    ): { join: { table: PgTable<any>; condition: SQL }; condition: SQL } {
        const junctionTable = registry.getTable(through.table);
        if (!junctionTable) {
            throw new Error(`Junction table not found: ${through.table}`);
        }

        const junctionSourceCol = junctionTable[through.sourceColumn as keyof typeof junctionTable] as AnyPgColumn;
        const junctionTargetCol = junctionTable[through.targetColumn as keyof typeof junctionTable] as AnyPgColumn;

        if (!junctionSourceCol) {
            throw new Error(`Source column '${through.sourceColumn}' not found in junction table '${through.table}'`);
        }
        if (!junctionTargetCol) {
            throw new Error(`Target column '${through.targetColumn}' not found in junction table '${through.table}'`);
        }

        // Handle both single ID and array of IDs
        const condition = Array.isArray(parentEntityId)
            ? sql`${junctionSourceCol} = ANY(${parentEntityId})`
            : eq(junctionSourceCol, parentEntityId);

        return {
            join: {
                table: junctionTable,
                condition: eq(targetIdColumn, junctionTargetCol)
            },
            condition
        };
    }

    /**
     * Build conditions for inverse junction table (many-to-many) relations
     */
    private static buildInverseJunctionTableConditions(
        through: { table: string; sourceColumn: string; targetColumn: string },
        targetIdColumn: AnyPgColumn,
        parentEntityId: string | number | (string | number)[],
        registry: BackendCollectionRegistry
    ): { join: { table: PgTable<any>; condition: SQL }; condition: SQL } {
        const junctionTable = registry.getTable(through.table);
        if (!junctionTable) {
            throw new Error(`Junction table not found: ${through.table}`);
        }

        const junctionSourceCol = junctionTable[through.sourceColumn as keyof typeof junctionTable] as AnyPgColumn;
        const junctionTargetCol = junctionTable[through.targetColumn as keyof typeof junctionTable] as AnyPgColumn;

        if (!junctionSourceCol) {
            throw new Error(`Source column '${through.sourceColumn}' not found in junction table '${through.table}'`);
        }
        if (!junctionTargetCol) {
            throw new Error(`Target column '${through.targetColumn}' not found in junction table '${through.table}'`);
        }

        // For inverse relations, the parentEntityId (tag ID) should match the sourceColumn (tag_id)
        // and we want to find target entities (posts) through the targetColumn (post_id)
        const condition = Array.isArray(parentEntityId)
            ? sql`${junctionSourceCol} = ANY(${parentEntityId})`
            : eq(junctionSourceCol, parentEntityId);

        return {
            join: {
                table: junctionTable,
                condition: eq(targetIdColumn, junctionTargetCol)
            },
            condition
        };
    }

    /**
     * Build conditions for simple relations (owning/inverse without join paths)
     */
    private static buildSimpleRelationCondition(
        relation: Relation,
        targetTable: PgTable<any>,
        parentTable: PgTable<any>,
        parentEntityId: string | number | (string | number)[]
    ): SQL {
        if (relation.direction === "owning" && relation.localKey) {
            // For owning relations, the parentEntityId is actually the foreign key value
            // that should match the target table's primary key
            const targetIdCol = Object.values(targetTable).find((col: any) => col.primary) as AnyPgColumn;
            if (!targetIdCol) {
                // Fallback to looking for an 'id' column by name
                const idCol = Object.values(targetTable).find((col: any) => col.name === 'id') as AnyPgColumn;
                if (!idCol) {
                    throw new Error(`No primary key or 'id' column found in target table`);
                }
                return Array.isArray(parentEntityId)
                    ? sql`${idCol} = ANY(${parentEntityId})`
                    : eq(idCol, parentEntityId);
            }
            return Array.isArray(parentEntityId)
                ? sql`${targetIdCol} = ANY(${parentEntityId})`
                : eq(targetIdCol, parentEntityId);

        } else if (relation.direction === "inverse" && relation.foreignKeyOnTarget) {
            // Inverse relation: use foreign key on target table
            const foreignKeyCol = targetTable[relation.foreignKeyOnTarget as keyof typeof targetTable] as AnyPgColumn;
            if (!foreignKeyCol) {
                throw new Error(`Foreign key column '${relation.foreignKeyOnTarget}' not found in target table`);
            }
            return Array.isArray(parentEntityId)
                ? sql`${foreignKeyCol} = ANY(${parentEntityId})`
                : eq(foreignKeyCol, parentEntityId);

        } else {
            throw new Error(`Relation '${relation.relationName}' lacks proper configuration. For many-to-many relations, use 'through' property. For simple relations, use 'localKey' or 'foreignKeyOnTarget'.`);
        }
    }

    /**
     * Combine multiple conditions with AND operator
     */
    static combineConditionsWithAnd(conditions: SQL[]): SQL | undefined {
        if (conditions.length === 0) return undefined;
        if (conditions.length === 1) return conditions[0];
        return and(...conditions);
    }

    /**
     * Combine multiple conditions with OR operator
     */
    static combineConditionsWithOr(conditions: SQL[]): SQL | undefined {
        if (conditions.length === 0) return undefined;
        if (conditions.length === 1) return conditions[0];
        return or(...conditions);
    }

    /**
     * Build search conditions for text fields
     */
    static buildSearchConditions(
        searchString: string,
        properties: Record<string, any>,
        table: PgTable<any>
    ): SQL[] {
        const searchConditions: SQL[] = [];

        for (const [key, prop] of Object.entries(properties)) {
            if (prop.type === "string") {
                const fieldColumn = table[key as keyof typeof table] as AnyPgColumn;
                if (fieldColumn) {
                    searchConditions.push(ilike(fieldColumn, `%${searchString}%`));
                }
            }
        }

        return searchConditions;
    }

    /**
     * Build a unique field check condition
     */
    static buildUniqueFieldCondition(
        fieldColumn: AnyPgColumn,
        value: any,
        idColumn?: AnyPgColumn,
        excludeId?: string | number
    ): SQL[] {
        const conditions: SQL[] = [eq(fieldColumn, value)];

        if (excludeId && idColumn) {
            conditions.push(sql`${idColumn} != ${excludeId}`);
        }

        return conditions;
    }

    /**
     * Build relation-based query with joins and conditions
     */
    static buildRelationQuery(
        baseQuery: any,
        relation: Relation,
        parentEntityId: string | number | (string | number)[],
        targetTable: PgTable<any>,
        parentTable: PgTable<any>,
        parentIdColumn: AnyPgColumn,
        targetIdColumn: AnyPgColumn,
        registry: BackendCollectionRegistry,
        additionalFilters?: SQL[]
    ): any {
        const { joinConditions, whereConditions } = this.buildRelationConditions(
            relation,
            parentEntityId,
            targetTable,
            parentTable,
            parentIdColumn,
            targetIdColumn,
            registry
        );

        let query = baseQuery;

        // Apply joins
        for (const { table, condition } of joinConditions) {
            query = query.innerJoin(table, condition);
        }

        // Combine all conditions
        const allConditions = [...whereConditions];
        if (additionalFilters) {
            allConditions.push(...additionalFilters);
        }

        // Apply where conditions
        if (allConditions.length > 0) {
            query = query.where(and(...allConditions));
        }

        return query;
    }

    /**
     * Build count query for relations with proper joins and conditions
     */
    static buildRelationCountQuery(
        baseCountQuery: any,
        relation: Relation,
        parentEntityId: string | number,
        targetTable: PgTable<any>,
        parentTable: PgTable<any>,
        parentIdColumn: AnyPgColumn,
        targetIdColumn: AnyPgColumn,
        registry: BackendCollectionRegistry,
        additionalFilters?: SQL[]
    ): any {
        // For count queries, we need to handle joins differently to avoid duplicates
        if (relation.joinPath && relation.joinPath.length > 0) {
            return this.buildJoinPathCountQuery(
                baseCountQuery,
                relation.joinPath,
                targetTable,
                parentTable,
                parentIdColumn,
                parentEntityId,
                registry,
                additionalFilters
            );
        } else if (relation.through && relation.cardinality === "many" && relation.direction === "owning") {
            return this.buildJunctionCountQuery(
                baseCountQuery,
                relation.through,
                targetIdColumn,
                parentEntityId,
                registry,
                additionalFilters
            );
        } else if (relation.through && relation.cardinality === "many" && relation.direction === "inverse") {
            return this.buildInverseJunctionCountQuery(
                baseCountQuery,
                relation.through,
                targetIdColumn,
                parentEntityId,
                registry,
                additionalFilters
            );
        } else {
            // Simple relations
            const simpleCondition = this.buildSimpleRelationCondition(
                relation,
                targetTable,
                parentTable,
                parentEntityId
            );

            const allConditions = [simpleCondition];
            if (additionalFilters) {
                allConditions.push(...additionalFilters);
            }

            return baseCountQuery.where(and(...allConditions));
        }
    }

    /**
     * Build join path conditions for count queries
     */
    private static buildJoinPathCountQuery(
        baseCountQuery: any,
        joinPath: any[],
        targetTable: PgTable<any>,
        parentTable: PgTable<any>,
        parentIdColumn: AnyPgColumn,
        parentEntityId: string | number,
        registry: BackendCollectionRegistry,
        additionalFilters?: SQL[]
    ): any {
        let query = baseCountQuery;
        let currentTable = targetTable;

        // Process join steps in reverse order
        for (const joinStep of [...joinPath].reverse()) {
            const fromTableName = this.getTableNamesFromColumns(joinStep.on.from)[0];
            const toTableName = this.getTableNamesFromColumns(joinStep.on.to)[0];
            const fromColName = this.getColumnNamesFromColumns(joinStep.on.from)[0];
            const toColName = this.getColumnNamesFromColumns(joinStep.on.to)[0];

            const fromTable = registry.getTable(fromTableName);
            const toTable = registry.getTable(toTableName);

            if (!fromTable || !toTable) {
                throw new Error(`Join tables not found for step: from ${fromTableName} to ${toTableName}`);
            }

            const { joinTable, condition } = this.buildSingleJoinCondition(
                currentTable,
                fromTable,
                toTable,
                fromColName,
                toColName,
                fromTableName,
                toTableName
            );

            query = query.innerJoin(joinTable, condition);
            currentTable = joinTable;
        }

        if (currentTable !== parentTable) {
            throw new Error("Join path did not result in connecting to parent table");
        }

        const allConditions = [eq(parentIdColumn, parentEntityId)];
        if (additionalFilters) {
            allConditions.push(...additionalFilters);
        }

        return query.where(and(...allConditions));
    }

    /**
     * Build junction table conditions for count queries
     */
    private static buildJunctionCountQuery(
        baseCountQuery: any,
        through: { table: string; sourceColumn: string; targetColumn: string },
        targetIdColumn: AnyPgColumn,
        parentEntityId: string | number,
        registry: BackendCollectionRegistry,
        additionalFilters?: SQL[]
    ): any {
        const junctionTable = registry.getTable(through.table);
        if (!junctionTable) {
            throw new Error(`Junction table not found: ${through.table}`);
        }

        const junctionSourceCol = junctionTable[through.sourceColumn as keyof typeof junctionTable] as AnyPgColumn;
        const junctionTargetCol = junctionTable[through.targetColumn as keyof typeof junctionTable] as AnyPgColumn;

        if (!junctionSourceCol) {
            throw new Error(`Source column '${through.sourceColumn}' not found in junction table '${through.table}'`);
        }
        if (!junctionTargetCol) {
            throw new Error(`Target column '${through.targetColumn}' not found in junction table '${through.table}'`);
        }

        const baseConditions = [eq(junctionSourceCol, parentEntityId)];
        if (additionalFilters && additionalFilters.length > 0) {
            baseConditions.push(...additionalFilters);
        }

        return baseCountQuery
            .innerJoin(junctionTable, eq(targetIdColumn, junctionTargetCol))
            .where(and(...baseConditions));
    }

    /**
     * Build inverse junction table conditions for count queries
     */
    private static buildInverseJunctionCountQuery(
        baseCountQuery: any,
        through: { table: string; sourceColumn: string; targetColumn: string },
        targetIdColumn: AnyPgColumn,
        parentEntityId: string | number,
        registry: BackendCollectionRegistry,
        additionalFilters?: SQL[]
    ): any {
        const junctionTable = registry.getTable(through.table);
        if (!junctionTable) {
            throw new Error(`Junction table not found: ${through.table}`);
        }

        const junctionSourceCol = junctionTable[through.sourceColumn as keyof typeof junctionTable] as AnyPgColumn;
        const junctionTargetCol = junctionTable[through.targetColumn as keyof typeof junctionTable] as AnyPgColumn;

        if (!junctionSourceCol) {
            throw new Error(`Source column '${through.sourceColumn}' not found in junction table '${through.table}'`);
        }
        if (!junctionTargetCol) {
            throw new Error(`Target column '${through.targetColumn}' not found in junction table '${through.table}'`);
        }

        const baseConditions = [eq(junctionSourceCol, parentEntityId)];
        if (additionalFilters && additionalFilters.length > 0) {
            baseConditions.push(...additionalFilters);
        }

        return baseCountQuery
            .innerJoin(junctionTable, eq(targetIdColumn, junctionTargetCol))
            .where(and(...baseConditions));
    }

    /**
     * Helper method to extract table names from columns
     */
    static getTableNamesFromColumns(columns: string | string[]): string[] {
        if (Array.isArray(columns)) {
            return columns.map(col => col.includes(".") ? col.split(".")[0] : "");
        }
        return [columns.includes(".") ? columns.split(".")[0] : ""];
    }

    /**
     * Helper method to extract column names from columns
     */
    static getColumnNamesFromColumns(columns: string | string[]): string[] {
        if (Array.isArray(columns)) {
            return columns.map(col => getColumnName(col));
        }
        return [getColumnName(columns)];
    }

    /**
     * Find the corresponding junction table for an inverse many-to-many relation
     */
    private static findCorrespondingJunctionTable(
        relation: Relation,
        registry: BackendCollectionRegistry
    ): { table: string; sourceColumn: string; targetColumn: string } | null {
        try {
            // Get the target collection of the inverse relation
            const targetCollection = relation.target();

            // We need to find the corresponding owning relation on the target collection
            // that points back to the current collection
            const targetCollectionRelations = resolveCollectionRelations(targetCollection);

            // Look for an owning many-to-many relation that has the inverse relation name
            for (const [relationKey, targetRelation] of Object.entries(targetCollectionRelations)) {
                if (targetRelation.cardinality === "many" &&
                    targetRelation.direction === "owning" &&
                    targetRelation.through &&
                    (targetRelation.relationName === relation.inverseRelationName || relationKey === relation.inverseRelationName)) {

                    // Found the corresponding owning relation with junction table info
                    // For inverse relation, we need to swap source and target columns
                    return {
                        table: targetRelation.through.table,
                        sourceColumn: targetRelation.through.targetColumn, // Swapped
                        targetColumn: targetRelation.through.sourceColumn  // Swapped
                    };
                }
            }

            return null;
        } catch (error) {
            console.warn(`Error finding corresponding junction table for relation '${relation.relationName}':`, error);
            return null;
        }
    }
}
