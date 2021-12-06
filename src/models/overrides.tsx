import { AnyProperty } from "./properties";
import { EntitySchema } from "./entities";
import { EntityCollection } from "./collections";

/**
 * Use to resolve the schema properties for specific path, entity id or values.
 * @category Models
 */
export type PartialProperties<M> = Record<keyof M, Partial<AnyProperty>>;

/**
 * Use to resolve the schema properties for specific path, entity id or values.
 * @category Models
 */
export type PartialSchema<M> = Omit<Partial<EntitySchema<M>>, "properties"> &
    {
        properties: PartialProperties<M>
    };


/**
 * Use to resolve the schema properties for specific path, entity id or values.
 * @category Models
 */
export type PartialEntityCollection<M> =
    Omit<Partial<EntityCollection<M>>, "schema"> & {
    schema?: PartialSchema<M>
};