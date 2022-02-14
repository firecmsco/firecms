import { EntitySchema, EntityValues } from "./entities";
import { EnumConfig } from "./properties";
import { ResolvedEntitySchema, ResolvedProperty } from "./resolved_entities";

/**
 * Used to get the schemas used by the CMS
 * @see useSchemaRegistry
 * @category Models
 */
export type SchemaRegistry = {
    initialised: boolean;
    schemas: EntitySchema[];
    enumConfigs: EnumConfig[];
    findSchema: (id: string) => EntitySchema | undefined;
    findEnum: (id: string) => EnumConfig | undefined;
    getResolvedSchema: <M extends { [Key: string]: any } = any>(params: {
        schema: string | EntitySchema<M> | ResolvedEntitySchema<M>;
        path: string,
        entityId?: string,
        values?: Partial<EntityValues<M>>,
        previousValues?: Partial<EntityValues<M>>,
    }) => ResolvedEntitySchema<M>;
    getResolvedProperty: <M extends { [Key: string]: any } = any>(params: {
        schema: string | EntitySchema<M> | ResolvedEntitySchema<M>;
        path: string,
        propertyKey: string,
        entityId?: string,
        values?: Partial<EntityValues<M>>,
        previousValues?: Partial<EntityValues<M>>,
    }) => ResolvedProperty | null;
}
