import { AuthController, SchemaRegistryController } from "../models";
import { useFireCMSContext } from "./useFireCMSContext";

/**
 * Hook to retrieve the Schema registry controller.
 *
 * Consider that in order to use this hook you need to have a parent
 * `FireCMS`
 *
 * @see AuthController
 * @category Hooks and utilities
 */
export function useSchemaRegistryController(): SchemaRegistryController {
    const context = useFireCMSContext();
    return context.schemaRegistryController;
}
