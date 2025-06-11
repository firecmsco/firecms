import { CMSType, NavigationGroupEntry, Property } from "@firecms/core";
import { PersistedCollection } from "./persisted_collection";

/**
 * Use this controller to access the configuration that is stored externally,
 * and not defined in code.
 */
export interface CollectionsConfigController {

    loading: boolean;

    collections?: PersistedCollection[];

    getCollection: (id: string) => PersistedCollection;

    saveCollection: <M extends { [Key: string]: CMSType }>(params: SaveCollectionParams<M>) => Promise<void>;
    updateCollection: <M extends { [Key: string]: CMSType }>(params: UpdateCollectionParams<M>) => Promise<void>;

    saveProperty: (params: SavePropertyParams) => Promise<void>;
    deleteProperty: (params: DeletePropertyParams) => Promise<void>;

    deleteCollection: (props: DeleteCollectionParams) => Promise<void>;

    navigationEntries: NavigationGroupEntry[];
    saveNavigationEntries: (entries: NavigationGroupEntry[]) => Promise<void>;

}

export type UpdateCollectionParams<M extends Record<string, any>> = {
    id: string,
    collectionData: Partial<PersistedCollection<M>>,
    previousId?: string,
    parentCollectionIds?: string[]
}

export type SaveCollectionParams<M extends Record<string, any>> = {
    id: string,
    collectionData: PersistedCollection<M>,
    previousId?: string,
    parentCollectionIds?: string[]
}

export type SavePropertyParams = {
    path: string,
    propertyKey: string,
    namespace?: string,
    newPropertiesOrder?: string[],
    property: Property,
    parentCollectionIds?: string[]
}

export type DeletePropertyParams = {
    path: string,
    propertyKey: string,
    namespace?: string,
    newPropertiesOrder?: string[],
    parentCollectionIds?: string[]
}

export type DeleteCollectionParams = {
    id: string,
    parentCollectionIds?: string[]
}
