import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import { PgTable } from "drizzle-orm/pg-core";
import { collectionRegistry } from "../collections/registry";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Entity, FilterValues, Property, WhereFilterOp } from "@firecms/core";

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

// Transform references for database storage (reference objects to IDs)
function transformReferencesToIds(entity: any, properties: Record<string, any>): any {
    if (!entity || !properties) return entity;

    console.log("🔄 [transformReferencesToIds] Starting transformation");
    console.log("🔄 [transformReferencesToIds] Entity keys:", Object.keys(entity));
    console.log("🔄 [transformReferencesToIds] Properties keys:", Object.keys(properties));

    const result: Record<string, any> = {};

    for (const [key, value] of Object.entries(entity)) {
        const property = properties[key];
        if (!property) {
            console.log(`🔄 [transformReferencesToIds] No property config found for key: ${key}`);
            result[key] = value;
            continue;
        }

        console.log(`🔄 [transformReferencesToIds] Processing ${key}:`, {
            value,
            propertyType: property.dataType || property.type,
            hasPath: !!property.path
        });

        result[key] = transformPropertyToId(value, property);
    }

    console.log("🔄 [transformReferencesToIds] Final result:", result);
    return result;
}

function transformPropertyToId(value: any, property: any): any {
    if (value === null || value === undefined) {
        return value;
    }

    const propertyType = property.dataType || property.type;
    console.log(`🔄 [transformPropertyToId] Property type: ${propertyType}, value:`, value);

    switch (propertyType) {
        case "reference":
            // Transform reference object to ID
            if (typeof value === "object" && value.id !== undefined) {
                console.log(`🔄 [transformPropertyToId] Transforming reference ${value.id} from path ${value.path}`);
                return value.id;
            }
            console.log(`🔄 [transformPropertyToId] Reference value is not an object or has no id:`, value);
            return value;

        case "array":
            if (Array.isArray(value) && property.of) {
                return value.map(item => transformPropertyToId(item, property.of));
            }
            return value;

        case "map":
            if (typeof value === "object" && property.properties) {
                const result: Record<string, any> = {};
                for (const [subKey, subValue] of Object.entries(value)) {
                    const subProperty = property.properties[subKey];
                    if (subProperty) {
                        result[subKey] = transformPropertyToId(subValue, subProperty);
                    } else {
                        result[subKey] = subValue;
                    }
                }
                return result;
            }
            return value;

        default:
            return value;
    }
}

// Transform IDs back to reference objects for frontend
function transformIdsToReferences(entity: any, properties: Record<string, any>): any {
    if (!entity || !properties) return entity;

    const result: Record<string, any> = {};

    for (const [key, value] of Object.entries(entity)) {
        const property = properties[key];
        if (!property) {
            result[key] = value;
            continue;
        }

        result[key] = transformPropertyFromId(value, property);
    }

    return result;
}

function transformPropertyFromId(value: any, property: any): any {
    if (value === null || value === undefined) {
        return value;
    }

    switch (property.dataType || property.type) {
        case "reference":
            // Transform ID back to reference object with type information
            if (typeof value === "string" || typeof value === "number") {
                return {
                    id: value.toString(),
                    path: property.path,
                    type: "reference"
                };
            }
            return value;

        case "array":
            if (Array.isArray(value) && property.of) {
                return value.map(item => transformPropertyFromId(item, property.of));
            }
            return value;

        case "map":
            if (typeof value === "object" && property.properties) {
                const result: Record<string, any> = {};
                for (const [subKey, subValue] of Object.entries(value)) {
                    const subProperty = property.properties[subKey];
                    if (subProperty) {
                        result[subKey] = transformPropertyFromId(subValue, subProperty);
                    } else {
                        result[subKey] = subValue;
                    }
                }
                return result;
            }
            return value;

        default:
            return value;
    }
}

export class EntityService {
    constructor(private db: NodePgDatabase<any>) {
    }

    // Map collection paths to actual database tables
    private getTableForPath(path: string): PgTable<any> {
        const collection = collectionRegistry.getBySlug(path) ?? collectionRegistry.get(path);
        if (!collection) {
            throw new Error(`Unknown collection path or slug: ${path}`);
        }
        const table = collectionRegistry.getTable(collection.dbPath);
        if (!table) {
            throw new Error(`Table not found for dbPath: ${collection.dbPath}`);
        }
        return table;
    }

    private getIdFieldInfo(path: string) {
        const collection = collectionRegistry.getBySlug(path) ?? collectionRegistry.get(path);
        if (!collection) {
            throw new Error(`Collection not found for path or slug: ${path}`);
        }

        const idFieldName = collection.idField ?? "id";
        const idFieldConfig = collection.properties[idFieldName] as Property;

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
        entityId: string | number,
        databaseId?: string
    ): Promise<Entity<M> | undefined> {
        const table = this.getTableForPath(path);
        const idInfo = this.getIdFieldInfo(path);
        console.log("idInfo", {
            path,
            idInfo
        });
        const idField = (table as any)[idInfo.fieldName];
        const parsedId = this.parseIdValue(entityId, idInfo.type);

        const result = await this.db
            .select()
            .from(table)
            .where(eq(idField, parsedId))
            .limit(1);

        if (result.length === 0) return undefined;

        const raw = result[0];
        const collection = collectionRegistry.getBySlug(path) ?? collectionRegistry.get(path);

        // Transform IDs back to reference objects and apply type conversion
        let values = raw;
        if (collection) {
            values = transformIdsToReferences(raw, collection.properties);
        }

        return {
            id: (raw as any)[idInfo.fieldName].toString(),
            path,
            values: values as M,
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
    ): Promise<Entity<M>[]> {
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
        const collection = collectionRegistry.getBySlug(path) ?? collectionRegistry.get(path);

        console.log("Fetched collection:", results);

        return results.map((entity: any) => {
            // Transform IDs back to reference objects
            let values = entity;
            if (collection) {
                values = transformIdsToReferences(entity, collection.properties);
            }

            return {
                id: entity[idInfo.fieldName].toString(),
                path: path,
                values: values as M,
                databaseId: options.databaseId
            };
        });
    }

    async saveEntity<M extends Record<string, any>>(
        path: string,
        values: Partial<M>,
        entityId?: string | number,
        databaseId?: string
    ): Promise<Entity<M>> {
        const table = this.getTableForPath(path);
        const idInfo = this.getIdFieldInfo(path);
        const idField = (table as any)[idInfo.fieldName];
        const collection = collectionRegistry.getBySlug(path) ?? collectionRegistry.get(path);

        // Transform references to IDs, map field names, then sanitize
        let processedData = values;
        if (collection) {
            processedData = transformReferencesToIds(values, collection.properties);
        }
        const entityData = sanitizeAndConvertDates(processedData);

        console.log("Saving entity after reference transformation:", entityData);

        if (entityId) {
            // Update existing entity
            const parsedId = this.parseIdValue(entityId, idInfo.type);
            const updateQuery = this.db
                .update(table)
                .set(entityData)
                .where(eq(idField, parsedId));

            console.log("🔍 [EntityService] Update SQL:", updateQuery.toSQL());
            await updateQuery;

            // Fetch the updated entity to return with proper reference objects
            const updatedEntity = await this.fetchEntity<M>(path, entityId, databaseId);
            return updatedEntity!;
        } else {
            const insertQuery = this.db
                .insert(table)
                .values(entityData)
                .returning({ id: idField });

            console.log("🔍 [EntityService] Insert SQL:", insertQuery.toSQL());
            console.log("🔍 [EntityService] Entity data being inserted:", JSON.stringify(entityData, null, 2));

            const result = await insertQuery;
            const newId = result[0].id;

            // Fetch the newly created entity to return with proper reference objects
            const newEntity = await this.fetchEntity<M>(path, newId.toString(), databaseId);
            return newEntity!;
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
    ): Promise<Entity<M>[]> {
        const table = this.getTableForPath(path);
        const collection = collectionRegistry.getBySlug(path) ?? collectionRegistry.get(path);
        const idInfo = this.getIdFieldInfo(path);
        const idField = (table as any)[idInfo.fieldName];

        if (!collection) {
            return [];
        }

        const searchConditions = [];
        for (const [key, prop] of Object.entries(collection.properties)) {
            if ((prop as Property).type === "string") {
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

        return results.map((entity: any) => {
            // Transform IDs back to reference objects
            let values = entity;
            if (collection) {
                values = transformIdsToReferences(entity, collection.properties);
            }

            return {
                id: entity[idInfo.fieldName].toString(),
                path: path,
                values: values as M,
                databaseId
            };
        });
    }
}
