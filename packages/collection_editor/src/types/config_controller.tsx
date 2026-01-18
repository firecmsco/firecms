import { CMSType, EntityCollection, NavigationGroupMapping, Property } from "@firecms/core";
import { PersistedCollection } from "./persisted_collection";

export interface CollectionsSetupInfo {
    status: "ongoing" | "complete";
    error: string | null;
}

/**
 * Use this controller to access the configuration that is stored externally,
 * and not defined in code.
 */
export interface CollectionsConfigController {

    loading: boolean;

    collections?: PersistedCollection[];

    /**
     * Status information about the automatic collections setup process.
     * Stored in the project config document at `collectionsSetup`.
     */
    collectionsSetup?: CollectionsSetupInfo;

    getCollection: (id: string) => PersistedCollection;

    saveCollection: <M extends { [Key: string]: CMSType }>(params: SaveCollectionParams<M>) => Promise<void>;
    updateCollection: <M extends { [Key: string]: CMSType }>(params: UpdateCollectionParams<M>) => Promise<void>;

    saveProperty: (params: SavePropertyParams) => Promise<void>;
    deleteProperty: (params: DeletePropertyParams) => Promise<void>;

    deleteCollection: (props: DeleteCollectionParams) => Promise<void>;

    /**
     * Update the properties order of a collection (used for column reordering).
     */
    updatePropertiesOrder: (params: UpdatePropertiesOrderParams) => Promise<void>;

    /**
     * Update the Kanban columns order for a collection.
     */
    updateKanbanColumnsOrder: (params: UpdateKanbanColumnsOrderParams) => Promise<void>;

    navigationEntries: NavigationGroupMapping[];
    saveNavigationEntries: (entries: NavigationGroupMapping[]) => Promise<void>;

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

export type UpdatePropertiesOrderParams = {
    fullPath: string;
    parentCollectionIds: string[];
    collection: EntityCollection<any>;
    newPropertiesOrder: string[];
}

export type UpdateKanbanColumnsOrderParams = {
    fullPath: string;
    parentCollectionIds: string[];
    collection: EntityCollection<any>;
    kanbanColumnProperty: string;
    newColumnsOrder: string[];
}
