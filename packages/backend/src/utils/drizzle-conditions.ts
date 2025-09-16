import { and, eq, or, sql, SQLWrapper, ilike } from "drizzle-orm";
import { AnyPgColumn, PgTable } from "drizzle-orm/pg-core";
import { FilterValues, WhereFilterOp, Relation } from "@firecms/types";
import { getColumnName, getTableName } from "@firecms/common";
import { BackendCollectionRegistry } from "../collections/BackendCollectionRegistry";

/**
 * Helper function to extract table name(s) from column reference(s)
 */
function getTableNamesFromColumns(columns: string | string[]): string[] {
    if (Array.isArray(columns)) {
        return columns.map(col => col.includes(".") ? col.split(".")[0] : "");
    }
    return [columns.includes(".") ? columns.split(".")[0] : ""];
}

/**
 * Helper function to extract column name(s) from fully qualified column reference(s)
 */
function getColumnNamesFromColumns(columns: string | string[]): string[] {
    if (Array.isArray(columns)) {
        return columns.map(col => getColumnName(col));
    }
    return [getColumnName(columns)];
}

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
    ): SQLWrapper[] {
        const conditions: SQLWrapper[] = [];

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
    ): SQLWrapper | null {
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
        parentEntityId: string | number,
        targetTable: PgTable<any>,
        parentTable: PgTable<any>,
        parentIdColumn: AnyPgColumn,
        targetIdColumn: AnyPgColumn,
        registry: BackendCollectionRegistry
    ): {
        joinConditions: { table: PgTable<any>; condition: SQLWrapper }[];
        whereConditions: SQLWrapper[];
    } {
        const joinConditions: { table: PgTable<any>; condition: SQLWrapper }[] = [];
        const whereConditions: SQLWrapper[] = [];

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

        } else {
            // Handle simple relations
            const simpleCondition = this.buildSimpleRelationCondition(
                relation,
                targetTable,
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
        parentEntityId: string | number,
        registry: BackendCollectionRegistry
    ): {
        joins: { table: PgTable<any>; condition: SQLWrapper }[];
        finalCondition: SQLWrapper;
    } {
        const joins: { table: PgTable<any>; condition: SQLWrapper }[] = [];
        let currentTable = targetTable;

        // Process join steps in reverse order to build path back to parent
        for (const joinStep of [...joinPath].reverse()) {
            const fromTableName = getTableNamesFromColumns(joinStep.on.from)[0];
            const toTableName = getTableNamesFromColumns(joinStep.on.to)[0];
            const fromColName = getColumnNamesFromColumns(joinStep.on.from)[0];
            const toColName = getColumnNamesFromColumns(joinStep.on.to)[0];

            const fromTable = registry.getTable(fromTableName);
            const toTable = registry.getTable(toTableName);

            if (!fromTable || !toTable) {
                throw new Error(`Join tables not found for step: from ${fromTableName} to ${toTableName}`);
            }

            const {
                joinTable,
                condition
            } = this.buildSingleJoinCondition(
                currentTable,
                fromTable,
                toTable,
                fromColName,
                toColName,
                fromTableName,
                toTableName
            );

            joins.push({
                table: joinTable,
                condition
            });
            currentTable = joinTable;
        }

        // Ensure we've connected back to the parent table
        if (currentTable !== parentTable) {
            throw new Error("Join path did not result in connecting to parent table");
        }

        const finalCondition = eq(parentIdColumn, parentEntityId);
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
        toTableName: string
    ): { joinTable: PgTable<any>; condition: SQLWrapper } {
        let joinTable: PgTable<any>;
        let condition: SQLWrapper;

        if (currentTable === toTable) {
            // current -> toTable, so join the fromTable
            const left = fromTable[fromColName as keyof typeof fromTable] as AnyPgColumn;
            const right = (currentTable as any)[toColName] as AnyPgColumn;

            if (!left || !right) {
                throw new Error(`Join columns not found: ${fromTableName}.${fromColName} = ${toTableName}.${toColName}`);
            }

            joinTable = fromTable;
            condition = eq(left, right);
        } else if (currentTable === fromTable) {
            // current -> fromTable, so join the toTable
            const left = toTable[toColName as keyof typeof toTable] as AnyPgColumn;
            const right = (currentTable as any)[fromColName] as AnyPgColumn;

            if (!left || !right) {
                throw new Error(`Join columns not found: ${toTableName}.${toColName} = ${fromTableName}.${fromColName}`);
            }

            joinTable = toTable;
            condition = eq(left, right);
        } else {
            throw new Error(`Join step does not match current table. Current table does not match from: ${fromTableName} or to: ${toTableName}`);
        }

        return {
            joinTable,
            condition
        };
    }

    /**
     * Build conditions for junction table (many-to-many) relations
     */
    private static buildJunctionTableConditions(
        through: { table: string; sourceColumn: string; targetColumn: string },
        targetIdColumn: AnyPgColumn,
        parentEntityId: string | number,
        registry: BackendCollectionRegistry
    ): { join: { table: PgTable<any>; condition: SQLWrapper }; condition: SQLWrapper } {
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

        return {
            join: {
                table: junctionTable,
                condition: eq(targetIdColumn, junctionTargetCol)
            },
            condition: eq(junctionSourceCol, parentEntityId)
        };
    }

    /**
     * Build conditions for simple relations (owning/inverse without join paths)
     */
    private static buildSimpleRelationCondition(
        relation: Relation,
        targetTable: PgTable<any>,
        parentEntityId: string | number
    ): SQLWrapper {
        if (relation.direction === "owning" && relation.localKey) {
            // Owning relation: use foreign key on target table
            const localKeyCol = targetTable[relation.localKey as keyof typeof targetTable] as AnyPgColumn;
            if (!localKeyCol) {
                throw new Error(`Local key column '${relation.localKey}' not found in target table`);
            }
            return eq(localKeyCol, parentEntityId);

        } else if (relation.direction === "inverse" && relation.foreignKeyOnTarget) {
            // Inverse relation: use foreign key on target table
            const foreignKeyCol = targetTable[relation.foreignKeyOnTarget as keyof typeof targetTable] as AnyPgColumn;
            if (!foreignKeyCol) {
                throw new Error(`Foreign key column '${relation.foreignKeyOnTarget}' not found in target table`);
            }
            return eq(foreignKeyCol, parentEntityId);

        } else {
            throw new Error(`Relation '${relation.relationName}' lacks proper configuration. For many-to-many relations, use 'through' property. For simple relations, use 'localKey' or 'foreignKeyOnTarget'.`);
        }
    }

    /**
     * Combine multiple conditions with AND operator
     */
    static combineConditionsWithAnd(conditions: SQLWrapper[]): SQLWrapper | undefined {
        if (conditions.length === 0) return undefined;
        if (conditions.length === 1) return conditions[0];
        return and(...conditions);
    }

    /**
     * Combine multiple conditions with OR operator
     */
    static combineConditionsWithOr(conditions: SQLWrapper[]): SQLWrapper | undefined {
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
    ): SQLWrapper[] {
        const searchConditions: SQLWrapper[] = [];

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
    ): SQLWrapper[] {
        const conditions: SQLWrapper[] = [eq(fieldColumn, value)];

        if (excludeId && idColumn) {
            conditions.push(sql`${idColumn} != ${excludeId}`);
        }

        return conditions;
    }
}
