import { EntityCollectionResolver } from "./collections";
import { SchemaConfig, SchemaConfigOverride } from "./schema_override";
import { PartialEntityCollection } from "./overrides";

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
     * Set props for path
     * @return used key
     */
    setOverride: <M>(props: {
                         path: string,
                         entityId?: string,
                         schemaConfig?: SchemaConfigOverride
                         overrideSchemaRegistry?: boolean
                     }
    ) => string | undefined;

    /**
     * Get the schema configuration for a given path
     */
    getSchemaConfig: (path: string, entityId?: string) => SchemaConfig | undefined;

    /**
     * Get the entity collection for a given path
     */
    getCollectionResolver: <M>(path: string) => EntityCollectionResolver<M> | undefined;

    /**
     * Remove all keys not used
     * @param used keys
     */
    removeAllOverridesExcept: (entityRefs: {
        path: string, entityId?: string
    }[]) => void;

    /**
     * Use this callback when a collection has been modified so it is persisted.
     */
    onCollectionModifiedForUser: <M>(path:string, partialCollection: PartialEntityCollection<M>) => void;
}
