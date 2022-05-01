import { EntityCollection } from "./collections";
import { AuthController } from "./auth";

/**
 * Use this controller to access the configuration that is stored externally,
 * and not defined in code
 */
export interface CollectionsController {

    loading: boolean;

    getCollections: ((params: { authController: AuthController }) => Promise<EntityCollection[]>);

    getCollection: <M>(path: string) => Promise<EntityCollection<M>>;

    saveCollection: <M>(path: string, collection: EntityCollection<M>) => Promise<void>;

    deleteCollection: (path: string) => Promise<void>;

}
