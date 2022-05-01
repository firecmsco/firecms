import { useFireCMSContext } from "./useFireCMSContext";
import { CollectionsController } from "../models/collections_controller";

/**
 * Use this controller to access the configuration that is stored extenally,
 * and not defined in code
 *
 * @category Hooks and utilities
 */
export function useCollectionsController(): CollectionsController | undefined {
    const context = useFireCMSContext();
    return context.collectionsController;
}
