import { EntityCollection } from "./collections";
import { ResolvedEntitySchema } from "./resolved_entities";

/**
 * Use to resolve the schema properties for specific path, entity id or values.
 * @category Models
 */
export type LocalEntitySchema<M> = Partial<ResolvedEntitySchema<M>>;

/**
 * Use to resolve the schema properties for specific path, entity id or values.
 * @category Models
 */
export type LocalEntityCollection<M> = Partial<EntityCollection<M>>;

/**
 * This interface is in charge of defining the controller that persists
 * modifications to a collection or schema, and retrieves them back from
 * a data source, such as local storage or Firestore.
 */
export interface UserConfigurationPersistence {
    onCollectionModified: <M>(path: string, partialCollection: LocalEntityCollection<M>) => void;
    getCollectionConfig: <M>(path: string) => LocalEntityCollection<M>;
    onPartialSchemaModified: <M>(id: string, partialCollection: LocalEntitySchema<M>) => void;
    getSchemaConfig: <M>(id: string) => LocalEntitySchema<M>;
}
