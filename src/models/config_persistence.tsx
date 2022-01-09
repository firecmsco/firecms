import { EntitySchema } from "./entities";
import { EntityCollection } from "./collections";


/**
 * Use this controller to access the configuration that is stored extenally,
 * and not defined in code
 */
export interface ConfigurationPersistence {

    loading: boolean;

    collections: EntityCollection[] | undefined;

    schemas: EntitySchema[] | undefined;

    getCollection: <M>(path: string) => Promise<EntityCollection<M>>;

    saveCollection: <M>(path: string, collection: EntityCollection<M>) => Promise<void>;

    getSchema: <M>(schemaId: string) => Promise<EntitySchema<M>>;

    saveSchema: <M>(schema: EntitySchema<M>) => Promise<void>;

}
