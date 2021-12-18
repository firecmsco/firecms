import { Properties } from "./properties";
import { EntitySchema } from "./entities";
import { EntityCollection } from "./collections";

/**
 * @category Models
 */
export type StoredEntitySchema<M = any> =
    Omit<EntitySchema<M>, "properties" | "views"> &
    {
        properties: Properties<M>
    };

/**
 * @category Models
 */
export type StoredEntityCollection<M = any> =
    Omit<EntityCollection<M>, "schema" | "extraActions" | "selectionController" | "callbacks">
    &
    {
        schemaId?: string
    };

/**
 * Use this controller to access the configuration that is stored extenally,
 * and not defined in code
 */
export interface ConfigurationPersistence {

    collections: StoredEntityCollection[] | undefined;

    getCollection: <M>(path: string) => Promise<StoredEntityCollection<M>>;

    saveCollection: <M>(path: string, collection: StoredEntityCollection<M>) => Promise<void>;

    getSchema: <M>(schemaId: string) => Promise<StoredEntitySchema<M>>;

    saveSchema: <M>(schemaId: string, schema: StoredEntitySchema<M>) => Promise<void>;

}
