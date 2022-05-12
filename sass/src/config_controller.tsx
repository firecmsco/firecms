import { EntityCollection, Role } from "@camberi/firecms";

/**
 * Use this controller to access the configuration that is stored externally,
 * and not defined in code
 */
export interface ConfigController {

    loading: boolean;

    collections?: EntityCollection[];

    saveCollection: <M>(path: string, collection: EntityCollection<M>) => Promise<void>;

    deleteCollection: (path: string) => Promise<void>;

    roles: Role[];

}
