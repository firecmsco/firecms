import { EntityCollection } from "./collections";
import { CMSType } from "./properties";

/**
 * Use to resolve the collection properties for specific path, entity id or values.
 * @category Models
 */
export type LocalEntityCollection<M extends object> = Partial<EntityCollection<M>>;

/**
 * This interface is in charge of defining the controller that persists
 * modifications to a collection or collection, and retrieves them back from
 * a data source, such as local storage or Firestore.
 */
export interface UserConfigurationPersistence {
    onCollectionModified: <M extends object>(path: string, partialCollection: LocalEntityCollection<M>) => void;
    getCollectionConfig: <M extends object>(path: string) => LocalEntityCollection<M>;
}
