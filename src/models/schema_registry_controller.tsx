import { EntityCollection } from "./collections";
import { SchemaConfig } from "./schema_resolver";

/**
 * This controller is in charge of resolving the entity schemas from a given
 * path. It takes into account the `navigation` prop set in the main level of the
 * `FireCMS` app as well as the `schemaResolver` in case you want to override schemas
 * to specific entities.
 *
 * @category Hooks and utilities
 */
export interface SchemaRegistryController {

    /**
     * Is the registry ready to be used
     */
    initialised: boolean;
    /**
     * Get props for path
     */
    getSchemaConfig: (path: string, entityId?: string) => SchemaConfig | undefined;

    /**
     * Get props for path
     */
    getCollectionConfig: (path: string, entityId?: string) => EntityCollection | undefined;

    /**
     * Set props for path
     * @return used key
     */
    setOverride: (
        entityPath: string,
        schemaConfig: Partial<SchemaConfig> | null,
        overrideSchemaResolver?: boolean
    ) => string | undefined;

    /**
     * Remove all keys not used
     * @param used keys
     */
    removeAllOverridesExcept: (
        keys: string[]
    ) => void;
}
