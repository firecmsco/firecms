import { EntityCollection, Role } from "@camberi/firecms";
import { SassUser } from "./sass_user";

/**
 * Use this controller to access the configuration that is stored externally,
 * and not defined in code
 */
export interface ConfigController {

    loading: boolean;

    collections?: EntityCollection[];

    saveCollection: <M>(path: string, collection: EntityCollection<M>) => Promise<void>;

    deleteCollection: (path: string) => Promise<void>;

    users: SassUser[];

    roles: Role[];

}
