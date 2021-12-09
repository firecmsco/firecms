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
export type PartialEntitySchema<M> =
    Omit<Partial<EntitySchema<M>>, "properties"> &
    {
        properties: PartialProperties<M>
    };

/**
 * Use to resolve the schema properties for specific path, entity id or values.
 * @category Models
 */
export type PartialEntityCollection<M> =
    Omit<Partial<EntityCollection<M>>, "schema"> &
    {
        schema?: PartialEntitySchema<M>
    };

/**
 * This interface is in charge of defining the controller that persists
 * modifications to a collection or schema, and retrieves them back from
 * a data source, such as local storage or Firestore.
 */
export interface ConfigurationPersistence {
    onCollectionModified: <M extends any>(path: string, partialCollection: PartialEntityCollection<M>) => void;
    getCollectionConfig: <M>(path: string) => PartialEntityCollection<M>;
}
