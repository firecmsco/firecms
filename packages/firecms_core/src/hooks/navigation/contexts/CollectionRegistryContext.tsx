import React, { createContext } from "react";
import { EntityCollection, EntityReference } from "@firecms/types";

export type CollectionRegistryController<EC extends EntityCollection = EntityCollection<any>> = {
    getCollection: (slugOrPath: string, includeUserOverride?: boolean) => EC | undefined;
    getRawCollection: (slugOrPath: string) => EC | undefined;
    getParentReferencesFromPath: (path: string) => EntityReference[];
    getParentCollectionIds: (path: string) => string[];
    convertIdsToPaths: (ids: string[]) => string[];
    initialised: boolean;
    collections?: EntityCollection[];
};

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
