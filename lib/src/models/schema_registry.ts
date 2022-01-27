import { EntitySchema } from "./entities";
import { EnumConfig } from "./properties";
import { EntitySchemaResolver } from "./resolved_entities";

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
    buildSchemaResolver: <M>({
                                 schema,
                                 path
                             }: { schema: EntitySchema<M> | EntitySchemaResolver<M>, path: string }) => EntitySchemaResolver<M>;
}
