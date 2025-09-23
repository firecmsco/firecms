import {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLFloat,
    GraphQLBoolean,
    GraphQLList,
    GraphQLNonNull,
    GraphQLFieldConfig,
    GraphQLInputObjectType,
} from "graphql";
import { EntityCollection, Property } from "@firecms/types";
import { PostgresDataSourceDelegate } from "../../services/dataSourceDelegate";

/**
 * Lightweight GraphQL schema generator that leverages existing PostgresDataSourceDelegate
 * No duplication - uses your existing data layer and services
 */
export class GraphQLSchemaGenerator {
    private collections: EntityCollection[];
    private dataSource: PostgresDataSourceDelegate;
    private typeRegistry = new Map<string, GraphQLObjectType>();
    private inputTypeRegistry = new Map<string, GraphQLInputObjectType>();

    constructor(collections: EntityCollection[], dataSource: PostgresDataSourceDelegate) {
        this.collections = collections;
        this.dataSource = dataSource;
    }

    /**
     * Generate complete GraphQL schema using existing DataSourceDelegate
     */
    generateSchema(): GraphQLSchema {
        // Create all types first
        this.collections.forEach(collection => {
            this.createEntityType(collection);
            this.createInputType(collection);
        });

        const queryType = this.createQueryType();
        const mutationType = this.createMutationType();

        return new GraphQLSchema({
            query: queryType,
            mutation: mutationType,
        });
    }

    /**
     * Create GraphQL type for an entity collection
     */
    private createEntityType(collection: EntityCollection): GraphQLObjectType {
        const typeName = this.getTypeName(collection);

        if (this.typeRegistry.has(typeName)) {
            return this.typeRegistry.get(typeName)!;
        }

        const fields: Record<string, GraphQLFieldConfig<any, any>> = {};

        // Add ID field
        fields.id = {
            type: new GraphQLNonNull(GraphQLString),
            description: "Unique identifier"
        };

        // Convert properties to GraphQL fields
        Object.entries(collection.properties).forEach(([key, property]) => {
            if (property.type !== "relation") {
                fields[key] = this.convertPropertyToField(property);
            }
        });

        const entityType = new GraphQLObjectType({
            name: typeName,
            description: collection.description || `${collection.singularName} entity`,
            fields: () => fields
        });

        this.typeRegistry.set(typeName, entityType);
        return entityType;
    }

    private convertPropertyToField(property: Property): GraphQLFieldConfig<any, any> {
        let type;

        switch (property.type) {
            case "string":
                type = GraphQLString;
                break;
            case "number":
                type = GraphQLFloat;
                break;
            case "boolean":
                type = GraphQLBoolean;
                break;
            case "date":
                type = GraphQLString;
                break;
            case "array":
                type = new GraphQLList(GraphQLString);
                break;
            default:
                type = GraphQLString;
        }

        return {
            type: property.validation?.required ? new GraphQLNonNull(type) : type,
            description: property.name || property.description
        };
    }

    private createInputType(collection: EntityCollection): GraphQLInputObjectType {
        const typeName = `${this.getTypeName(collection)}Input`;

        if (this.inputTypeRegistry.has(typeName)) {
            return this.inputTypeRegistry.get(typeName)!;
        }

        const fields: Record<string, any> = {};

        Object.entries(collection.properties).forEach(([key, property]) => {
            if (property.type !== "relation") {
                fields[key] = {
                    type: this.convertPropertyToInputType(property)
                };
            }
        });

        const inputType = new GraphQLInputObjectType({
            name: typeName,
            description: `Input for creating/updating ${collection.singularName}`,
            fields
        });

        this.inputTypeRegistry.set(typeName, inputType);
        return inputType;
    }

    private convertPropertyToInputType(property: Property) {
        switch (property.type) {
            case "string":
                return GraphQLString;
            case "number":
                return GraphQLFloat;
            case "boolean":
                return GraphQLBoolean;
            case "date":
                return GraphQLString;
            case "array":
                return new GraphQLList(GraphQLString);
            default:
                return GraphQLString;
        }
    }

    /**
     * Create Query type using existing DataSourceDelegate methods
     */
    private createQueryType(): GraphQLObjectType {
        const fields: Record<string, GraphQLFieldConfig<any, any>> = {};

        this.collections.forEach(collection => {
            const typeName = this.getTypeName(collection);
            const entityType = this.typeRegistry.get(typeName);

            if (!entityType) return;

            // Single entity query - uses existing fetchEntity
            fields[this.getSingleQueryName(collection)] = {
                type: entityType,
                args: {
                    id: { type: new GraphQLNonNull(GraphQLString) }
                },
                resolve: async (_, args) => {
                    const entity = await this.dataSource.fetchEntity({
                        path: collection.dbPath || collection.slug,
                        entityId: args.id,
                        collection
                    });
                    return entity;
                }
            };

            // List query - uses existing fetchCollection
            fields[this.getListQueryName(collection)] = {
                type: new GraphQLList(entityType),
                args: {
                    limit: { type: GraphQLInt, defaultValue: 20 },
                    offset: { type: GraphQLInt, defaultValue: 0 },
                    where: { type: GraphQLString },
                    orderBy: { type: GraphQLString }
                },
                resolve: async (_, args) => {
                    const filter = args.where ? JSON.parse(args.where) : undefined;
                    const entities = await this.dataSource.fetchCollection({
                        path: collection.dbPath || collection.slug,
                        collection,
                        filter,
                        limit: args.limit,
                        startAfter: args.offset ? String(args.offset) : undefined
                    });
                    return entities;
                }
            };
        });

        return new GraphQLObjectType({
            name: "Query",
            fields
        });
    }

    /**
     * Create Mutation type using existing DataSourceDelegate methods
     */
    private createMutationType(): GraphQLObjectType {
        const fields: Record<string, GraphQLFieldConfig<any, any>> = {};

        this.collections.forEach(collection => {
            const typeName = this.getTypeName(collection);
            const entityType = this.typeRegistry.get(typeName);
            const inputType = this.inputTypeRegistry.get(`${typeName}Input`);

            if (!entityType || !inputType) return;

            // Create mutation - uses existing saveEntity
            fields[`create${typeName}`] = {
                type: entityType,
                args: {
                    input: { type: new GraphQLNonNull(inputType) }
                },
                resolve: async (_, args) => {
                    const entity = await this.dataSource.saveEntity({
                        path: collection.dbPath || collection.slug,
                        entityId: this.dataSource.generateEntityId(collection.dbPath || collection.slug, collection),
                        values: args.input,
                        collection,
                        status: "new"
                    });
                    return entity;
                }
            };

            // Update mutation - uses existing saveEntity
            fields[`update${typeName}`] = {
                type: entityType,
                args: {
                    id: { type: new GraphQLNonNull(GraphQLString) },
                    input: { type: new GraphQLNonNull(inputType) }
                },
                resolve: async (_, args) => {
                    const entity = await this.dataSource.saveEntity({
                        path: collection.dbPath || collection.slug,
                        entityId: args.id,
                        values: args.input,
                        collection,
                        status: "existing"
                    });
                    return entity;
                }
            };

            // Delete mutation - uses existing deleteEntity
            fields[`delete${typeName}`] = {
                type: GraphQLBoolean,
                args: {
                    id: { type: new GraphQLNonNull(GraphQLString) }
                },
                resolve: async (_, args) => {
                    try {
                        const existingEntity = await this.dataSource.fetchEntity({
                            path: collection.dbPath || collection.slug,
                            entityId: args.id,
                            collection
                        });
                        if (!existingEntity) return false;
                        await this.dataSource.deleteEntity({
                            entity: existingEntity,
                            collection
                        });
                        return true;
                    } catch {
                        return false;
                    }
                }
            };
        });

        return new GraphQLObjectType({
            name: "Mutation",
            fields
        });
    }

    // Helper methods
    private getTypeName(collection: EntityCollection): string {
        return collection.singularName?.replace(/\s+/g, "") ||
            collection.name.slice(0, -1).replace(/\s+/g, "");
    }

    private getSingleQueryName(collection: EntityCollection): string {
        return this.getTypeName(collection).toLowerCase();
    }

    private getListQueryName(collection: EntityCollection): string {
        return collection.slug;
    }
}
