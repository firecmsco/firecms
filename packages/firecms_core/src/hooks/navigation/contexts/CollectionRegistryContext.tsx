import React, { createContext } from "react";
import { EntityCollection, EntityReference } from "@firecms/types";

export type CollectionRegistryController<EC extends EntityCollection = EntityCollection<any>> = {
    getCollection: (slugOrPath: string, includeUserOverride?: boolean) => EC | undefined;
    getRawCollection: (slugOrPath: string) => EC | undefined;
    getCollectionBySlug: (slug: string) => EC | undefined;
    getCollectionById: (id: string) => EC | undefined;
    getCollectionFromIds: (ids: string[]) => EC | undefined;
    getCollectionFromPaths: (pathSegments: string[]) => EC | undefined;
    getParentReferencesFromPath: (path: string) => EntityReference[];
    getParentCollectionIds: (path: string) => string[];
    convertIdsToPaths: (ids: string[]) => string[];
    initialised: boolean;
};

export const CollectionRegistryContext = createContext<CollectionRegistryController>({
    getCollection: () => undefined,
    getRawCollection: () => undefined,
    getCollectionBySlug: () => undefined,
    getCollectionById: () => undefined,
    getCollectionFromIds: () => undefined,
    getCollectionFromPaths: () => undefined,
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
