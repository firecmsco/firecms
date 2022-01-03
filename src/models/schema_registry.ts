import { EntitySchema, EntitySchemaResolver } from "./entities";


/**
 * Used to get the schemas used by the CMS
 * @category Models
 */
export type SchemaRegistry  = {
    loading: boolean;
    schemas: EntitySchema[];
    buildSchemaResolver: <M>({
                              schema,
                              path
                          }: { schema: EntitySchema<M>, path: string }) => EntitySchemaResolver<M>;
}
