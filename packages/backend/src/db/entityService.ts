import { and, asc, desc, eq, ilike, or, sql, SQLWrapper } from "drizzle-orm";
import { AnyPgColumn, PgTable } from "drizzle-orm/pg-core";
import { collectionRegistry } from "../collections/registry";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import {
    Entity,
    FilterValues,
    ManyRelation,
    ManyToManyRelation,
    Properties,
    Property,
    WhereFilterOp
} from "@firecms/core";

function sanitizeAndConvertDates(obj: any): any {
    if (obj === null || obj === undefined) return null;

    // Sanitize NaN values
    if (typeof obj === "number" && isNaN(obj)) return null;

    // Sanitize "NaN" string
    if (typeof obj === "string" && obj.toLowerCase() === "nan") return null;

    if (Array.isArray(obj)) return obj.map(v => sanitizeAndConvertDates(v));

    if (typeof obj === "object" && !(obj instanceof Date)) {
        const newObj: Record<string, any> = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                newObj[key] = sanitizeAndConvertDates(obj[key]);
            }
        }
        return newObj;
    }

    if (typeof obj === "string") {
        const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;
        if (isoDateRegex.test(obj)) {
            const date = new Date(obj);
            if (!isNaN(date.getTime())) return date;
        }
    }

    return obj;
}

// Helper utils to mirror schema generation defaults
function toSnakeCase(str: string): string {
    if (!str) return "";
    return str.replace(/[A-Z]/g, (letter, index) => index === 0 ? letter.toLowerCase() : `_${letter.toLowerCase()}`);
}

function getTableNameFromCollection(collection: any): string {
    // Matches getTableName in generate-drizzle-schema.ts
    return (collection.dbPath ?? toSnakeCase(collection.slug ?? "")) || toSnakeCase(collection.name ?? "");
}

function resolveJunctionTableName(
    through: { dbPath?: string } | undefined,
    sourceCollection: any,
    targetCollection: any
): string {
    if (through?.dbPath) return through.dbPath;
    const sourceName = getTableNameFromCollection(sourceCollection);
    const targetName = getTableNameFromCollection(targetCollection);
    return [sourceName, targetName].sort().join("_");
}

// Transform references for database storage (reference objects to IDs)
function serializeDataToServer<M extends Record<string, any>>(entity: M, properties: Properties<M>): any {
    if (!entity || !properties) return entity;

    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(entity)) {
        const property = properties[key as keyof M] as Property;
        if (!property) {
            result[key] = value;
            continue;
        }
        result[key] = serializePropertyToServer(value, property);
    }
    return result;
}

function serializePropertyToServer(value: any, property: Property): any {
    if (value === null || value === undefined) return value;

    const propertyType = property.type;

    switch (propertyType) {
        case "reference":
            if (typeof value === "object" && value.id !== undefined) {
                return value.id;
            }
            return value;
        case "array":
            if (Array.isArray(value) && property.of) {
                return value.map(item => serializePropertyToServer(item, property.of as Property));
            }
            return value;
        case "map":
            if (typeof value === "object" && property.properties) {
                const result: Record<string, any> = {};
                for (const [subKey, subValue] of Object.entries(value)) {
                    const subProperty = (property.properties as Properties)[subKey];
                    result[subKey] = subProperty
                        ? serializePropertyToServer(subValue, subProperty)
                        : subValue;
                }
                return result;
            }
            return value;
        default:
            return value;
    }
}

// Transform IDs back to reference objects for frontend
function parseDataFromServer<M extends Record<string, any>>(data: M, properties: Properties<M>): M {
    if (!data || !properties) return data;

    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
        const property = properties[key as keyof M] as Property;
        result[key] = property ? parsePropertyFromServer(value, property) : value;
    }
    return result as M;
}

function parsePropertyFromServer(value: any, property: Property): any {
    if (value === null || value === undefined) return value;

    switch (property.type) {
        case "reference":
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
                return value.map(item => parsePropertyFromServer(item, property.of as Property));
            }
            return value;
        case "map":
            if (typeof value === "object" && property.properties) {
                const result: Record<string, any> = {};
                for (const [subKey, subValue] of Object.entries(value)) {
                    const subProperty = (property.properties as Properties)[subKey];
                    result[subKey] = subProperty ? parsePropertyFromServer(subValue, subProperty) : subValue;
                }
                return result;
            }
            return value;
        case "number":
            if (typeof value === "string") {
                const parsed = parseFloat(value);
                return isNaN(parsed) ? null : parsed;
            }
            return value;
        case "date": {
            let date: Date | undefined;
            if (value instanceof Date) date = value;
            else if (typeof value === "string" || typeof value === "number") {
                const parsedDate = new Date(value);
                if (!isNaN(parsedDate.getTime())) date = parsedDate;
            }
            if (date) return {
                __type: "date",
                value: date.toISOString()
            };
            return null;
        }
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
        if (!collection) throw new Error(`Unknown collection path or slug: ${path}`);
        const table = collectionRegistry.getTable(collection.dbPath);
        if (!table) throw new Error(`Table not found for dbPath: ${collection.dbPath}`);
        return table;
    }

    private getIdFieldInfo(path: string) {
        const collection = collectionRegistry.getBySlug(path) ?? collectionRegistry.get(path);
        if (!collection) throw new Error(`Collection not found for path or slug: ${path}`);

        const idFieldName = collection.idField ?? "id";
        const idFieldConfig = collection.properties[idFieldName] as Property;
        if (!idFieldConfig) throw new Error(`ID field '${idFieldName}' not found in properties for collection '${path}'`);
        return {
            fieldName: idFieldName,
            type: idFieldConfig.type
        };
    }

    private parseIdValue(idValue: string | number, idType: string): string | number {
        if (idType === "number") {
            if (typeof idValue === "number") return idValue;
            const parsed = parseInt(String(idValue), 10);
            if (isNaN(parsed)) throw new Error(`Invalid numeric ID: ${idValue}`);
            return parsed;
        } else if (idType === "string") {
            return String(idValue);
        }
        throw new Error(`Unsupported ID type: ${idType}`);
    }

    async fetchEntity<M extends Record<string, any>>(
        path: string,
        entityId: string | number,
        databaseId?: string
    ): Promise<Entity<M> | undefined> {
        const table = this.getTableForPath(path);
        const idInfo = this.getIdFieldInfo(path);
        const idField = table[idInfo.fieldName as keyof typeof table] as AnyPgColumn;
        if (!idField) throw new Error(`ID field '${idInfo.fieldName}' not found in table for path '${path}'`);
        const parsedId = this.parseIdValue(entityId, idInfo.type);

        const result = await this.db.select().from(table).where(eq(idField, parsedId)).limit(1);
        if (result.length === 0) return undefined;

        const raw = result[0] as M;
        const collection = collectionRegistry.getBySlug(path) ?? collectionRegistry.get(path);
        const values = collection ? parseDataFromServer(raw, collection.properties as Properties<M>) : raw;
        return {
            id: String(raw[idInfo.fieldName as keyof M]),
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
            searchString?: string;
        } = {}
    ): Promise<Entity<M>[]> {
        const pathParts = path.split("/").filter(p => p);
        if (pathParts.length === 3) {
            const [parentCollectionSlug, parentEntityId, subcollectionSlug] = pathParts;
            const parentCollection = collectionRegistry.getBySlug(parentCollectionSlug);
            if (parentCollection) {
                const relation = parentCollection.relations?.[subcollectionSlug];
                if (relation) {
                    if (relation.type === "manyToMany")
                        return this.fetchManyToManyCollection(parentCollectionSlug, parentEntityId, subcollectionSlug, options);
                    else if (relation.type === "many")
                        return this.fetchManyCollection(parentCollectionSlug, parentEntityId, subcollectionSlug, options);
                }
            }
        }

        if (options.searchString)
            return this.searchEntities<M>(path, options.searchString, options.databaseId);

        const table = this.getTableForPath(path);
        const idInfo = this.getIdFieldInfo(path);
        const idField = table[idInfo.fieldName as keyof typeof table] as AnyPgColumn;
        if (!idField) throw new Error(`ID field '${idInfo.fieldName}' not found in table for path '${path}'`);

        let query: any = this.db.select().from(table);

        if (options.filter) {
            const conditions: SQLWrapper[] = [];
            for (const [field, filterParam] of Object.entries(options.filter)) {
                if (!filterParam) continue;
                const [op, value] = filterParam as [WhereFilterOp, any];
                const fieldColumn = table[field as keyof typeof table] as AnyPgColumn;
                if (!fieldColumn) continue;
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
                        if (Array.isArray(value) && value.length > 0) conditions.push(sql`${fieldColumn} = ANY(${value})`);
                        break;
                    case "array-contains":
                        conditions.push(sql`${fieldColumn} @> ${JSON.stringify([value])}`);
                        break;
                }
            }
            if (conditions.length > 0) query = query.where(and(...conditions));
        }

        const orderExpressions: any[] = [];
        if (options.orderBy) {
            const orderField = table[options.orderBy as keyof typeof table] as AnyPgColumn;
            if (orderField) orderExpressions.push(options.order === "desc" ? desc(orderField) : asc(orderField));
        }
        orderExpressions.push(desc(idField));
        if (orderExpressions.length > 0) query = query.orderBy(...orderExpressions);

        if (options.limit) query = query.limit(options.limit);

        const results = await query;
        const collection = collectionRegistry.getBySlug(path) ?? collectionRegistry.get(path);
        return results.map((entity: any) => {
            const values = collection ? parseDataFromServer(entity as M, collection.properties as Properties<M>) : entity;
            return {
                id: entity[idInfo.fieldName].toString(),
                path,
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
        const idField = table[idInfo.fieldName as keyof typeof table] as AnyPgColumn;
        if (!idField) throw new Error(`ID field '${idInfo.fieldName}' not found in table for path '${path}'`);
        const collection = collectionRegistry.getBySlug(path) ?? collectionRegistry.get(path);

        let processedData = values;
        if (collection) processedData = serializeDataToServer(values as M, collection.properties as Properties<M>);
        const entityData = sanitizeAndConvertDates(processedData);

        if (entityId) {
            const parsedId = this.parseIdValue(entityId, idInfo.type);
            const updateQuery = this.db.update(table).set(entityData).where(eq(idField, parsedId));
            await updateQuery;
            const updatedEntity = await this.fetchEntity<M>(path, entityId, databaseId);
            if (!updatedEntity) throw new Error("Could not fetch entity after update.");
            return updatedEntity;
        } else {
            const insertQuery = this.db.insert(table).values(entityData).returning({ id: idField });
            const result = await insertQuery as any;
            const newId = String(result[0].id);
            const newEntity = await this.fetchEntity<M>(path, newId, databaseId);
            if (!newEntity) throw new Error("Could not fetch entity after insert.");
            return newEntity;
        }
    }

    async deleteEntity(path: string, entityId: string | number, _databaseId?: string): Promise<void> {
        const table = this.getTableForPath(path);
        const idInfo = this.getIdFieldInfo(path);
        const idField = table[idInfo.fieldName as keyof typeof table] as AnyPgColumn;
        if (!idField) throw new Error(`ID field '${idInfo.fieldName}' not found in table for path '${path}'`);
        const parsedId = this.parseIdValue(entityId, idInfo.type);
        await this.db.delete(table).where(eq(idField, parsedId));
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
        const idField = table[idInfo.fieldName as keyof typeof table] as AnyPgColumn;
        if (!idField) throw new Error(`ID field '${idInfo.fieldName}' not found in table for path '${path}'`);
        const field = table[fieldName as keyof typeof table] as AnyPgColumn;
        if (!field) return true;

        const conditions: SQLWrapper[] = [eq(field, value)];
        if (excludeEntityId) {
            const parsedExcludeId = this.parseIdValue(excludeEntityId, idInfo.type);
            conditions.push(sql`${idField} != ${parsedExcludeId}`);
        }
        const result = await this.db.select({ count: sql`count(*)` }).from(table).where(and(...conditions));
        const count = Number(result[0]?.count || 0);
        return count === 0;
    }

    async countEntities(path: string, _databaseId?: string): Promise<number> {
        const table = this.getTableForPath(path);
        const result = await this.db.select({ count: sql`count(*)` }).from(table);
        return Number(result[0]?.count || 0);
    }

    generateEntityId(): string {
        // For PostgreSQL with auto-increment IDs, we don't need to pre-generate
        // The database will assign the ID on insert
        return Date.now().toString() + Math.random().toString(36).substring(2, 7);
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
        const idField = table[idInfo.fieldName as keyof typeof table] as AnyPgColumn;
        if (!idField) throw new Error(`ID field '${idInfo.fieldName}' not found in table for path '${path}'`);
        if (!collection) return [];

        const searchConditions: SQLWrapper[] = [];
        for (const [key, prop] of Object.entries(collection.properties)) {
            if ((prop as Property).type === "string") {
                const fieldColumn = table[key as keyof typeof table] as AnyPgColumn;
                if (fieldColumn) searchConditions.push(ilike(fieldColumn, `%${searchString}%`));
            }
        }
        if (searchConditions.length === 0) {
            for (const key of ["name", "title", "description"]) {
                const fieldColumn = table[key as keyof typeof table] as AnyPgColumn;
                if (fieldColumn) searchConditions.push(ilike(fieldColumn, `%${searchString}%`));
            }
        }
        if (searchConditions.length === 0) return [];

        const results = await this.db.select().from(table).where(or(...searchConditions)).orderBy(desc(idField)).limit(50);
        return results.map((entity: any) => {
            const values = collection ? parseDataFromServer(entity as M, collection.properties as Properties<M>) : entity;
            return {
                id: entity[idInfo.fieldName].toString(),
                path,
                values: values as M,
                databaseId
            };
        });
    }

    async fetchManyToManyCollection<M extends Record<string, any>>(
        parentCollectionSlug: string,
        parentEntityId: string | number,
        subcollectionSlug: string,
        options: {
            filter?: FilterValues<Extract<keyof M, string>>;
            orderBy?: string;
            order?: "desc" | "asc";
            limit?: number;
            startAfter?: any;
            databaseId?: string;
        } = {}
    ): Promise<Entity<M>[]> {
        const parentCollection = collectionRegistry.getBySlug(parentCollectionSlug);
        if (!parentCollection) throw new Error(`Parent collection not found: ${parentCollectionSlug}`);

        const relation = parentCollection.relations?.[subcollectionSlug];
        if (!relation || !("type" in relation) || relation.type !== "manyToMany" || !("target" in relation))
            throw new Error(`ManyToMany relation '${subcollectionSlug}' not found in '${parentCollectionSlug}'`);
        const typedRelation = relation as ManyToManyRelation;

        const targetCollection = typedRelation.target();
        const targetTablePath = targetCollection.slug ?? targetCollection.dbPath;
        const targetTable = this.getTableForPath(targetTablePath);

        const junctionDbPath = resolveJunctionTableName(typedRelation.through, parentCollection, targetCollection);
        const junctionTable = collectionRegistry.getTable(junctionDbPath);
        if (!junctionTable) throw new Error(`Junction table not found for dbPath: ${junctionDbPath}`);

        const parentIdInfo = this.getIdFieldInfo(parentCollection.slug ?? parentCollection.dbPath);
        const parsedParentId = this.parseIdValue(parentEntityId, parentIdInfo.type);

        const defaultSourceKey = `${toSnakeCase(getTableNameFromCollection(parentCollection))}_id`;
        const defaultTargetKey = `${toSnakeCase(getTableNameFromCollection(targetCollection))}_id`;
        const sourceJunctionKeyName = Array.isArray(typedRelation.through?.sourceJunctionKey)
            ? (typedRelation.through?.sourceJunctionKey as string[])[0]
            : (typedRelation.through?.sourceJunctionKey ?? defaultSourceKey);
        const targetJunctionKeyName = Array.isArray(typedRelation.through?.targetJunctionKey)
            ? (typedRelation.through?.targetJunctionKey as string[])[0]
            : (typedRelation.through?.targetJunctionKey ?? defaultTargetKey);

        const sourceJunctionKey = junctionTable[sourceJunctionKeyName as keyof typeof junctionTable] as AnyPgColumn;
        if (!sourceJunctionKey) throw new Error(`Source junction key '${sourceJunctionKeyName}' not found in table '${junctionDbPath}'`);
        const targetJunctionKey = junctionTable[targetJunctionKeyName as keyof typeof junctionTable] as AnyPgColumn;
        if (!targetJunctionKey) throw new Error(`Target junction key '${targetJunctionKeyName}' not found in table '${junctionDbPath}'`);

        const targetIdInfo = this.getIdFieldInfo(targetCollection.slug ?? targetCollection.dbPath);
        const targetIdField = targetTable[targetIdInfo.fieldName as keyof typeof targetTable] as AnyPgColumn;
        if (!targetIdField) throw new Error(`ID field '${targetIdInfo.fieldName}' not found in table for path '${targetCollection.slug ?? targetCollection.dbPath}'`);

        let query: any = this.db
            .select()
            .from(targetTable)
            .innerJoin(junctionTable, eq(targetIdField, targetJunctionKey));

        const allConditions: SQLWrapper[] = [eq(sourceJunctionKey, parsedParentId)];

        if (options.filter) {
            const conditions: SQLWrapper[] = [];
            for (const [field, filterParam] of Object.entries(options.filter)) {
                if (!filterParam) continue;
                const [op, value] = filterParam as [WhereFilterOp, any];
                const fieldColumn = targetTable[field as keyof typeof targetTable] as AnyPgColumn;
                if (!fieldColumn) continue;
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
                        if (Array.isArray(value) && value.length > 0) conditions.push(sql`${fieldColumn} = ANY(${value})`);
                        break;
                    case "array-contains":
                        conditions.push(sql`${fieldColumn} @> ${JSON.stringify([value])}`);
                        break;
                }
            }
            if (conditions.length > 0) allConditions.push(...conditions);
        }

        query = query.where(and(...allConditions));

        const orderExpressions: any[] = [];
        if (options.orderBy) {
            const orderField = targetTable[options.orderBy as keyof typeof targetTable] as AnyPgColumn;
            if (orderField) orderExpressions.push(options.order === "desc" ? desc(orderField) : asc(orderField));
        }
        orderExpressions.push(desc(targetIdField));
        if (orderExpressions.length > 0) query = query.orderBy(...orderExpressions);
        if (options.limit) query = query.limit(options.limit);

        const results = await query;

        function extractTarget(row: any): any {
            if (row && typeof row === "object") {
                if (targetIdInfo.fieldName in row) return row;
                for (const v of Object.values(row)) {
                    if (v && typeof v === "object" && targetIdInfo.fieldName in v) return v;
                }
            }
            return row;
        }

        return results.map((row: any) => {
            const entity = extractTarget(row);
            const values = parseDataFromServer(entity as M, targetCollection.properties as Properties<M>);
            return {
                id: String(entity[targetIdInfo.fieldName]),
                path: targetCollection.slug ?? targetCollection.dbPath,
                values: values as M,
                databaseId: options.databaseId
            };
        });
    }

    async fetchManyCollection<M extends Record<string, any>>(
        parentCollectionSlug: string,
        parentEntityId: string | number,
        subcollectionSlug: string,
        options: {
            filter?: FilterValues<Extract<keyof M, string>>;
            orderBy?: string;
            order?: "desc" | "asc";
            limit?: number;
            startAfter?: any;
            databaseId?: string;
        } = {}
    ): Promise<Entity<M>[]> {
        const parentCollection = collectionRegistry.getBySlug(parentCollectionSlug);
        if (!parentCollection) throw new Error(`Parent collection not found: ${parentCollectionSlug}`);

        const relation = parentCollection.relations?.[subcollectionSlug];
        if (!relation || !("type" in relation) || relation.type !== "many" || !("target" in relation))
            throw new Error(`One-to-many relation '${subcollectionSlug}' not found in '${parentCollectionSlug}'`);
        const typedRelation = relation as ManyRelation;

        const targetCollection = typedRelation.target();
        const targetCollectionPath = targetCollection.slug ?? targetCollection.dbPath;

        let foreignKeyField: string | undefined;
        for (const [key, prop] of Object.entries(targetCollection.properties)) {
            const property = prop as Property;
            if (property.type === "reference" && (property.path === parentCollection.slug || property.path === parentCollection.dbPath)) {
                foreignKeyField = key;
                break;
            }
        }
        if (!foreignKeyField) throw new Error(`Could not find foreign key field on ${targetCollectionPath} pointing to ${parentCollectionSlug}`);

        const existingFilter = options.filter ?? {};
        const parentIdInfo = this.getIdFieldInfo(parentCollectionSlug);
        const parsedParentId = this.parseIdValue(parentEntityId, parentIdInfo.type);
        const newFilter: FilterValues<Extract<keyof M, string>> = {
            ...existingFilter,
            [foreignKeyField as Extract<keyof M, string>]: ["==", parsedParentId]
        };

        return this.fetchCollection<M>(targetCollectionPath, {
            ...options,
            filter: newFilter
        });
    }
}
