import { EntityCollection } from "./collections";

/**
 * Use this controller to access the configuration that is stored externally,
 * and not defined in code
 */
export interface ConfigurationPersistence {

    loading: boolean;

    collections?: EntityCollection[];

    getCollection: <M>(path: string) => Promise<EntityCollection<M>>;

    saveCollection: <M>(path: string, collection: EntityCollection<M>) => Promise<void>;

    deleteCollection: <M>(path: string) => Promise<void>;

}
