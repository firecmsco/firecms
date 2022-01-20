import { EntitySchema, EntitySchemaResolver } from "./entities";

/**
 * Used to get the schemas used by the CMS
 * @see useSchemaRegistry
 * @category Models
 */
export type SchemaRegistry = {
    initialised: boolean;
    schemas: EntitySchema[];
    findSchema: (id: string) => EntitySchema | undefined;
    buildSchemaResolver: <M>({
                                 schema,
                                 path
                             }: { schema: EntitySchema<M>, path: string }) => EntitySchemaResolver<M>;
}
