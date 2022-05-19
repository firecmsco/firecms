import { EntityCollection } from "@camberi/firecms";
import { SassUser } from "./sass_user";
import { Role } from "./roles";

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

    saveUser: (user: SassUser) => Promise<void>;

    roles: Role[];

    saveRole: (id: string, role: Role) => Promise<void>;

}
