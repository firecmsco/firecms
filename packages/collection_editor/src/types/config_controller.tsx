import { CMSType, Property } from "@firecms/core";
import { PersistedCollection } from "./persisted_collection";

/**
 * Use this controller to access the configuration that is stored externally,
 * and not defined in code.
 */
export interface CollectionsConfigController {

    loading: boolean;

    collections?: PersistedCollection[];

    saveCollection: <M extends { [Key: string]: CMSType }>(params: SaveCollectionParams<M>) => Promise<void>;

    saveProperty: (params: SavePropertyParams) => Promise<void>;
    deleteProperty: (params: DeletePropertyParams) => Promise<void>;

    deleteCollection: (props: DeleteCollectionParams) => Promise<void>;

}

export type SaveCollectionParams<M extends Record<string, any>> = {
    path: string,
    collectionData: PersistedCollection<M>,
    previousPath?: string,
    parentPathSegments?: string[]
}

export type SavePropertyParams = {
    path: string,
    propertyKey: string,
    namespace?: string,
    newPropertiesOrder?: string[],
    property: Property,
    parentPathSegments?: string[]
}

export type DeletePropertyParams = {
    path: string,
    propertyKey: string,
    namespace?: string,
    newPropertiesOrder?: string[],
    parentPathSegments?: string[]
}

export type DeleteCollectionParams = {
    path: string,
    parentPathSegments?: string[]
}
