import { EntitySchema } from "./entities";
import { EntityCollection } from "./collections";
import { EnumConfig } from "./properties";

/**
 * Use this controller to access the configuration that is stored extenally,
 * and not defined in code
 */
export interface ConfigurationPersistence {

    loading: boolean;

    collections?: EntityCollection[];
    /**
     * Entity schemas
     * Should be undefined when loading and empty if there are no results
     */
    schemas?: EntitySchema[];

    enumConfigs?: EnumConfig[];

    getCollection: <M>(path: string) => Promise<EntityCollection<M>>;

    getSchema: <M>(schemaId: string) => Promise<EntitySchema<M>>;

    saveCollection: <M>(path: string, collection: EntityCollection<M>) => Promise<void>;

    saveSchema: <M>(schema: EntitySchema<M>) => Promise<void>;

    saveEnum: (schema: EnumConfig) => Promise<void>;

}
