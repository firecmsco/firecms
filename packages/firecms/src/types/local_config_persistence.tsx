import { EntityCollection } from "./collections";

/**
 * Use to resolve the collection properties for specific path, entity id or values.
 * @category Models
 */
export type PartialEntityCollection<M extends Record<string, any> = any> = Partial<EntityCollection<M>>;

/**
 * This interface is in charge of defining the controller that persists
 * modifications to a collection or collection, and retrieves them back from
 * a data source, such as local storage or Firestore.
 */
export interface UserConfigurationPersistence {
    onCollectionModified: <M extends Record<string, any> = any>(path: string, partialCollection: PartialEntityCollection<M>) => void;
    getCollectionConfig: <M extends Record<string, any> = any>(path: string) => PartialEntityCollection<M>;
    recentlyVisitedPaths: string[];
    setRecentlyVisitedPaths: (paths: string[]) => void;
    favouritePaths: string[];
    setFavouritePaths: (paths: string[]) => void;
    collapsedGroups: string[];
    setCollapsedGroups: (paths: string[]) => void;
}
