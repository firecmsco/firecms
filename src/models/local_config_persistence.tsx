import { AnyProperty } from "./properties";
import { EntitySchema } from "./entities";
import { EntityCollection } from "./collections";

/**
 * Use to resolve the schema properties for specific path, entity id or values.
 * @category Models
 */
export type LocalEntitySchema<M> =
    Omit<Partial<EntitySchema<M>>, "properties"> &
    {
        properties: Record<keyof M, Partial<AnyProperty>>
    };

/**
 * Use to resolve the schema properties for specific path, entity id or values.
 * @category Models
 */
export type LocalEntityCollection<M> =
    Omit<Partial<EntityCollection<M>>, "schema"> &
    {
        schema?: LocalEntitySchema<M>
    };

/**
 * This interface is in charge of defining the controller that persists
 * modifications to a collection or schema, and retrieves them back from
 * a data source, such as local storage or Firestore.
 */
export interface LocalConfigurationPersistence {
    onCollectionModified: <M>(path: string, partialCollection: LocalEntityCollection<M>) => void;
    getCollectionConfig: <M>(path: string) => LocalEntityCollection<M>;
}
