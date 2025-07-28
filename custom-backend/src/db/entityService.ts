import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import { Entity as FireCMSEntity, FilterValues, WhereFilterOp } from "../types";
import { PgTable } from "drizzle-orm/pg-core";
import { collectionRegistry } from "../collections/registry";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

function sanitizeAndConvertDates(obj: any): any {
    if (obj === null || obj === undefined) {
        return null;
    }

    // Sanitize NaN values
    if (typeof obj === "number" && isNaN(obj)) {
        return null;
    }

    // Sanitize "NaN" string
    if (typeof obj === "string" && obj.toLowerCase() === "nan") {
        return null;
    }

    if (Array.isArray(obj)) {
        return obj.map(v => sanitizeAndConvertDates(v));
    }

    if (typeof obj === "object" && !(obj instanceof Date)) {
        const newObj: Record<string, any> = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                newObj[key] = sanitizeAndConvertDates(obj[key]);
            }
        }
        return newObj;
    }

    // Convert date strings to Date objects
    if (typeof obj === "string") {
        const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;
        if (isoDateRegex.test(obj)) {
            const date = new Date(obj);
            if (!isNaN(date.getTime())) {
                return date;
            }
        }
    }

    return obj;
}

export class EntityService {
    constructor(private db: NodePgDatabase<any>, private tables: Record<string, PgTable<any>>) {
    }

    // Map collection paths to actual database tables
    private getTableForPath(path: string) {
        const collection = collectionRegistry.get(path);
        const tableId = collection?.databaseId ?? path;
        const table = this.tables[tableId];
        if (!table) {
            throw new Error(`Unknown collection path: ${path}`);
        }
        return table;
    }

    private getIdFieldInfo(path: string) {
        const collection = collectionRegistry.get(path);
        if (!collection) {
            throw new Error(`Collection not found for path: ${path}`);
        }

        const idFieldName = collection.idField;
        if (!idFieldName) {
            throw new Error(`ID field not configured for collection '${path}'`);
        }

        const idFieldConfig = collection.properties[idFieldName];
        if (!idFieldConfig) {
            throw new Error(`ID field '${idFieldName}' not found in properties for collection '${path}'`);
        }

        return {
            fieldName: idFieldName,
            type: idFieldConfig.type
        };
    }

    private parseIdValue(idValue: string | number, idType: string): any {
        if (idType === "number") {
            if (typeof idValue === "number") {
                return idValue;
            }

            const parsed = parseInt(idValue);
            if (isNaN(parsed)) {
                throw new Error(`Invalid numeric ID: ${idValue}`);
            }
            return parsed;
        } else if (idType === "string") {
            return idValue;
        } else {
            throw new Error(`Unsupported ID type: ${idType}`);
        }
    }

    async fetchEntity<M extends Record<string, any>>(
        path: string,
        entityId: string,
        databaseId?: string
    ): Promise<FireCMSEntity<M> | undefined> {
        const table = this.getTableForPath(path);
        const idInfo = this.getIdFieldInfo(path);
        const idField = (table as any)[idInfo.fieldName];
        const parsedId = this.parseIdValue(entityId, idInfo.type);

        const result = await this.db
            .select()
            .from(table)
            .where(eq(idField, parsedId))
            .limit(1);

        if (result.length === 0) return undefined;

        const entity = result[0];
        console.log("Fetched entity:", entity);
        return {
            id: (entity as any)[idInfo.fieldName].toString(),
            path: path,
            values: entity as M,
            databaseId
        };
    }

    async fetchCollection<M extends Record<string, any>>(
        path: string,
        options: {
            filter?: FilterValues<Extract<keyof M, string>>;
            orderBy?: string;
            order?: "desc" | "asc";
            limit?: number;
            startAfter?: any;
            databaseId?: string;
        } = {}
    ): Promise<FireCMSEntity<M>[]> {
        const table = this.getTableForPath(path);
        const idInfo = this.getIdFieldInfo(path);
        const idField = (table as any)[idInfo.fieldName];
        let query: any = this.db.select().from(table);

        // Apply filters
        if (options.filter) {
            const conditions = [];
            for (const [field, filterParam] of Object.entries(options.filter)) {
                if (!filterParam) continue;

                const [op, value] = filterParam as [WhereFilterOp, any];
                const fieldColumn = (table as any)[field];

                if (!fieldColumn) continue; // Skip if field doesn't exist in table

                switch (op) {
                    case "==":
                        conditions.push(eq(fieldColumn, value));
                        break;
                    case "!=":
                        conditions.push(sql`${fieldColumn} != ${value}`);
                        break;
                    case ">":
                        conditions.push(sql`${fieldColumn} > ${value}`);
                        break;
                    case ">=":
                        conditions.push(sql`${fieldColumn} >= ${value}`);
                        break;
                    case "<":
                        conditions.push(sql`${fieldColumn} < ${value}`);
                        break;
                    case "<=":
                        conditions.push(sql`${fieldColumn} <= ${value}`);
                        break;
                    case "in":
                        if (Array.isArray(value)) {
                            conditions.push(sql`${fieldColumn} = ANY(${value})`);
                        }
                        break;
                    case "array-contains":
                        // For JSONB arrays
                        conditions.push(sql`${fieldColumn} @> ${JSON.stringify([value])}`);
                        break;
                }
            }
            if (conditions.length > 0) {
                query = query.where(and(...conditions));
            }
        }

        // Apply ordering
        if (options.orderBy) {
            const orderField = (table as any)[options.orderBy];
            if (orderField) {
                if (options.order === "desc") {
                    query = query.orderBy(desc(orderField));
                } else {
                    query = query.orderBy(asc(orderField));
                }
            }
        } else {
            // Default ordering by ID
            query = query.orderBy(desc(idField));
        }

        // Apply limit
        if (options.limit) {
            query = query.limit(options.limit);
        }

        const results = await query;


        console.log("Fetched collection:", results);

        return results.map((entity: any) => ({
            id: entity[idInfo.fieldName].toString(),
            path: path,
            values: entity as M,
            databaseId: options.databaseId
        }));
    }

    async saveEntity<M extends Record<string, any>>(
        path: string,
        values: Partial<M>,
        entityId?: string,
        databaseId?: string
    ): Promise<FireCMSEntity<M>> {
        const table = this.getTableForPath(path);
        const idInfo = this.getIdFieldInfo(path);
        const idField = (table as any)[idInfo.fieldName];

        const entityData = sanitizeAndConvertDates(values);

        console.log("Saving entity", entityData);

        if (entityId) {
            // Update existing entity
            const parsedId = this.parseIdValue(entityId, idInfo.type);
            const updateQuery = this.db
                .update(table)
                .set(entityData)
                .where(eq(idField, parsedId));

            console.log("🔍 [EntityService] Update SQL:", updateQuery.toSQL());
            await updateQuery;

            return {
                id: entityId,
                path,
                values: values as M,
                databaseId
            };
        } else {
            const insertQuery = this.db
                .insert(table)
                .values(entityData)
                .returning({ id: idField });

            console.log("🔍 [EntityService] Insert SQL:", insertQuery.toSQL());
            console.log("🔍 [EntityService] Entity data being inserted:", JSON.stringify(entityData, null, 2));

            const result = await insertQuery;

            const newId = result[0].id;

            return {
                id: newId,
                path,
                values: values as M,
                databaseId
            };
        }
    }

    async deleteEntity(path: string, entityId: string | number, _databaseId?: string): Promise<void> {
        const table = this.getTableForPath(path);
        const idInfo = this.getIdFieldInfo(path);
        const idField = (table as any)[idInfo.fieldName];
        const parsedId = this.parseIdValue(entityId, idInfo.type);

        await this.db
            .delete(table)
            .where(eq(idField, parsedId));
    }

    async checkUniqueField(
        path: string,
        fieldName: string,
        value: any,
        excludeEntityId?: string,
        _databaseId?: string
    ): Promise<boolean> {
        if (value === undefined || value === null) return true;

        const table = this.getTableForPath(path);
        const idInfo = this.getIdFieldInfo(path);
        const idField = (table as any)[idInfo.fieldName];
        const field = (table as any)[fieldName];

        if (!field) return true; // Field doesn't exist, consider it unique

        const conditions = [eq(field, value)];

        if (excludeEntityId) {
            const parsedExcludeId = this.parseIdValue(excludeEntityId, idInfo.type);
            conditions.push(sql`${idField} != ${parsedExcludeId}`);
        }

        const result = await this.db
            .select({ count: sql`count(*)` })
            .from(table)
            .where(and(...conditions));

        const count = Number(result[0]?.count || 0);
        return count === 0;
    }

    async countEntities(path: string, _databaseId?: string): Promise<number> {
        const table = this.getTableForPath(path);

        const result = await this.db
            .select({ count: sql`count(*)` })
            .from(table);

        return Number(result[0]?.count || 0);
    }

    generateEntityId(): string {
        // For PostgreSQL with auto-increment IDs, we don't need to pre-generate
        // The database will assign the ID on insert
        return Date.now().toString() + Math.random().toString(36).substr(2, 5);
    }

    // Search functionality for text search
    async searchEntities<M extends Record<string, any>>(
        path: string,
        searchString: string,
        databaseId?: string
    ): Promise<FireCMSEntity<M>[]> {
        const table = this.getTableForPath(path);
        const collection = collectionRegistry.get(path);
        const idInfo = this.getIdFieldInfo(path);
        const idField = (table as any)[idInfo.fieldName];

        if (!collection) {
            return [];
        }

        const searchConditions = [];
        for (const [key, prop] of Object.entries(collection.properties)) {
            if (prop.searchable && (prop.type === "string")) {
                const fieldColumn = (table as any)[key];
                if (fieldColumn) {
                    searchConditions.push(ilike(fieldColumn, `%${searchString}%`));
                }
            }
        }

        if (searchConditions.length === 0) {
            // Fallback to generic text search on 'name', 'title', 'description'
            for (const key of ["name", "title", "description"]) {
                const fieldColumn = (table as any)[key];
                if (fieldColumn) {
                    searchConditions.push(ilike(fieldColumn, `%${searchString}%`));
                }
            }
        }

        if (searchConditions.length === 0) {
            return []; // No searchable fields found
        }

        const results = await this.db
            .select()
            .from(table)
            .where(or(...searchConditions))
            .orderBy(desc(idField))
            .limit(50);

        return results.map((entity: any) => ({
            id: entity[idInfo.fieldName].toString(),
            path: path,
            values: entity as M,
            databaseId
        }));
    }
}
