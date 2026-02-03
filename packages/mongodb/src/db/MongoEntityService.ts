/**
 * MongoDB Entity Service
 *
 * Implements EntityRepository interface for MongoDB.
 * Provides all CRUD operations for entities.
 */

import { Db, ObjectId, Collection, Document, FindOptions, Filter } from "mongodb";
import { Entity, FilterValues } from "@firecms/types";
import { MongoConditionBuilder } from "./MongoConditionBuilder";

/**
 * Entity repository interface (from @firecms/backend).
 * Copied here to avoid requiring @firecms/backend as a runtime dependency.
 */
export interface EntityRepository {
    fetchEntity<M extends Record<string, any>>(
        collectionPath: string,
        entityId: string | number,
        databaseId?: string
    ): Promise<Entity<M> | undefined>;

    fetchCollection<M extends Record<string, any>>(
        collectionPath: string,
        options?: {
            filter?: FilterValues<Extract<keyof M, string>>;
            orderBy?: string;
            order?: "desc" | "asc";
            limit?: number;
            startAfter?: any;
            searchString?: string;
            databaseId?: string;
        }
    ): Promise<Entity<M>[]>;

    searchEntities<M extends Record<string, any>>(
        collectionPath: string,
        searchString: string,
        options?: {
            filter?: FilterValues<Extract<keyof M, string>>;
            orderBy?: string;
            order?: "desc" | "asc";
            limit?: number;
            databaseId?: string;
        }
    ): Promise<Entity<M>[]>;

    countEntities<M extends Record<string, any>>(
        collectionPath: string,
        options?: {
            filter?: FilterValues<Extract<keyof M, string>>;
            databaseId?: string;
        }
    ): Promise<number>;

    saveEntity<M extends Record<string, any>>(
        collectionPath: string,
        values: Partial<M>,
        entityId?: string | number,
        databaseId?: string
    ): Promise<Entity<M>>;

    deleteEntity(
        collectionPath: string,
        entityId: string | number,
        databaseId?: string
    ): Promise<void>;

    checkUniqueField(
        collectionPath: string,
        fieldName: string,
        value: any,
        excludeEntityId?: string,
        databaseId?: string
    ): Promise<boolean>;

    generateEntityId(): string;
}

/**
 * MongoDB Entity Service
 *
 * Implements the EntityRepository interface for MongoDB.
 * Provides all CRUD operations for entities stored in MongoDB collections.
 */
export class MongoEntityService implements EntityRepository {
    constructor(private db: Db) { }

    /**
     * Get a MongoDB collection by its path
     */
    private getCollection(collectionPath: string): Collection<Document> {
        // Handle nested paths (e.g., "posts/123/comments" -> "posts_123_comments")
        const collectionName = collectionPath.replace(/\//g, "_");
        return this.db.collection(collectionName);
    }

    /**
     * Convert a string ID to ObjectId if it's a valid ObjectId string
     */
    private toObjectId(id: string | number): ObjectId | string | number {
        if (typeof id === "string" && ObjectId.isValid(id) && id.length === 24) {
            return new ObjectId(id);
        }
        return id;
    }

    /**
     * Convert a MongoDB document to a FireCMS Entity
     */
    private documentToEntity<M extends Record<string, any>>(
        doc: Document,
        path: string
    ): Entity<M> {
        const { _id, ...values } = doc;
        return {
            id: _id.toString(),
            path,
            values: this.convertFromMongoValues(values) as M
        };
    }

    /**
     * Convert values from MongoDB format to FireCMS format
     */
    private convertFromMongoValues(values: Record<string, any>): Record<string, any> {
        const result: Record<string, any> = {};

        for (const [key, value] of Object.entries(values)) {
            result[key] = this.convertFromMongoValue(value);
        }

        return result;
    }

    /**
     * Convert a single value from MongoDB format
     */
    private convertFromMongoValue(value: any): any {
        if (value === null || value === undefined) return value;

        // Handle ObjectId
        if (value instanceof ObjectId) {
            return value.toString();
        }

        // Handle Date
        if (value instanceof Date) {
            return value;
        }

        // Handle arrays
        if (Array.isArray(value)) {
            return value.map(v => this.convertFromMongoValue(v));
        }

        // Handle EntityReference-like objects
        if (typeof value === "object" && "path" in value && "id" in value) {
            return {
                path: value.path,
                id: value.id instanceof ObjectId ? value.id.toString() : value.id
            };
        }

        // Handle nested objects
        if (typeof value === "object") {
            return this.convertFromMongoValues(value);
        }

        return value;
    }

    /**
     * Convert values to MongoDB format for storage
     */
    private convertToMongoValues(values: Record<string, any>): Record<string, any> {
        const result: Record<string, any> = {};

        for (const [key, value] of Object.entries(values)) {
            result[key] = this.convertToMongoValue(value);
        }

        return result;
    }

    /**
     * Convert a single value to MongoDB format
     */
    private convertToMongoValue(value: any): any {
        if (value === null || value === undefined) return value;

        // Handle EntityReference
        if (typeof value === "object" && value.isEntityReference?.()) {
            return {
                id: ObjectId.isValid(value.id) ? new ObjectId(value.id) : value.id,
                path: value.path
            };
        }

        // Handle Date
        if (value instanceof Date) {
            return value;
        }

        // Handle arrays
        if (Array.isArray(value)) {
            return value.map(v => this.convertToMongoValue(v));
        }

        // Handle nested objects
        if (typeof value === "object") {
            return this.convertToMongoValues(value);
        }

        return value;
    }

    // =============================================================
    // EntityRepository Implementation
    // =============================================================

    /**
     * Fetch a single entity by ID
     */
    async fetchEntity<M extends Record<string, any>>(
        collectionPath: string,
        entityId: string | number,
        _databaseId?: string
    ): Promise<Entity<M> | undefined> {
        const collection = this.getCollection(collectionPath);
        const id = this.toObjectId(entityId);

        const doc = await collection.findOne({ _id: id as any });

        if (!doc) return undefined;

        return this.documentToEntity<M>(doc, collectionPath);
    }

    /**
     * Fetch a collection of entities with optional filtering, ordering, and pagination
     */
    async fetchCollection<M extends Record<string, any>>(
        collectionPath: string,
        options: {
            filter?: FilterValues<Extract<keyof M, string>>;
            orderBy?: string;
            order?: "desc" | "asc";
            limit?: number;
            startAfter?: any;
            searchString?: string;
            databaseId?: string;
        } = {}
    ): Promise<Entity<M>[]> {
        const collection = this.getCollection(collectionPath);

        // Build query
        const query = MongoConditionBuilder.buildQuery<M>({
            filter: options.filter,
            searchString: options.searchString,
            properties: {} // TODO: Pass actual properties for better search
        });

        // Build find options
        const findOptions: FindOptions<Document> = {};

        // Apply sorting
        const sort = MongoConditionBuilder.buildSort(options.orderBy, options.order);
        if (sort) {
            findOptions.sort = sort;
        }

        // Apply limit
        if (options.limit) {
            findOptions.limit = options.limit;
        }

        // Apply pagination (skip-based for now, cursor-based would be better)
        if (options.startAfter !== undefined) {
            findOptions.skip = Number(options.startAfter);
        }

        const docs = await collection.find(query, findOptions).toArray();

        return docs.map((doc: Document) => this.documentToEntity<M>(doc, collectionPath));
    }

    /**
     * Search entities by text
     */
    async searchEntities<M extends Record<string, any>>(
        collectionPath: string,
        searchString: string,
        options: {
            filter?: FilterValues<Extract<keyof M, string>>;
            orderBy?: string;
            order?: "desc" | "asc";
            limit?: number;
            databaseId?: string;
        } = {}
    ): Promise<Entity<M>[]> {
        return this.fetchCollection<M>(collectionPath, {
            ...options,
            searchString
        });
    }

    /**
     * Count entities in a collection
     */
    async countEntities<M extends Record<string, any>>(
        collectionPath: string,
        options: {
            filter?: FilterValues<Extract<keyof M, string>>;
            databaseId?: string;
        } = {}
    ): Promise<number> {
        const collection = this.getCollection(collectionPath);

        const query = options.filter
            ? MongoConditionBuilder.buildQuery<M>({ filter: options.filter })
            : {};

        return collection.countDocuments(query);
    }

    /**
     * Save an entity (create or update)
     */
    async saveEntity<M extends Record<string, any>>(
        collectionPath: string,
        values: Partial<M>,
        entityId?: string | number,
        _databaseId?: string
    ): Promise<Entity<M>> {
        const collection = this.getCollection(collectionPath);
        const mongoValues = this.convertToMongoValues(values as Record<string, any>);

        if (entityId) {
            // Update existing entity
            const id = this.toObjectId(entityId);
            await collection.updateOne(
                { _id: id as any },
                { $set: mongoValues },
                { upsert: true }
            );

            return {
                id: entityId.toString(),
                path: collectionPath,
                values: values as M
            };
        } else {
            // Create new entity
            const newId = new ObjectId();
            await collection.insertOne({
                _id: newId,
                ...mongoValues
            });

            return {
                id: newId.toString(),
                path: collectionPath,
                values: values as M
            };
        }
    }

    /**
     * Delete an entity by ID
     */
    async deleteEntity(
        collectionPath: string,
        entityId: string | number,
        _databaseId?: string
    ): Promise<void> {
        const collection = this.getCollection(collectionPath);
        const id = this.toObjectId(entityId);

        const result = await collection.deleteOne({ _id: id as any });

        if (result.deletedCount === 0) {
            console.warn(`Entity ${entityId} not found in collection ${collectionPath}`);
        }
    }

    /**
     * Check if a field value is unique in a collection
     */
    async checkUniqueField(
        collectionPath: string,
        fieldName: string,
        value: any,
        excludeEntityId?: string,
        _databaseId?: string
    ): Promise<boolean> {
        const collection = this.getCollection(collectionPath);

        const query: Filter<Document> = { [fieldName]: value };

        if (excludeEntityId) {
            const id = this.toObjectId(excludeEntityId);
            query._id = { $ne: id as any };
        }

        const count = await collection.countDocuments(query);
        return count === 0;
    }

    /**
     * Generate a new entity ID
     */
    generateEntityId(): string {
        return new ObjectId().toString();
    }
}
