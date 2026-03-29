import React, { createContext } from "react";
import { CollectionRegistryController, EntityCollection, EntityReference } from "@rebasepro/types";

export const CollectionRegistryContext = createContext<CollectionRegistryController>({
    getCollection: () => undefined,
    getRawCollection: () => undefined,
    getParentReferencesFromPath: () => [],
    getParentCollectionIds: () => [],
    convertIdsToPaths: () => [],
    initialised: false
});

export function useCollectionRegistryController<EC extends EntityCollection = EntityCollection<any>>(): CollectionRegistryController<EC> {
    const context = React.useContext(CollectionRegistryContext);
    if (context === undefined) {
        throw new Error("useCollectionRegistryController must be used within a CollectionRegistryContext.Provider");
    }
    return context as CollectionRegistryController<EC>;
}
