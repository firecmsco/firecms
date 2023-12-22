import { CollectionEditorPermissionsBuilder } from "./config_permissions";
import { Property } from "@firecms/core";
import { PersistedCollection } from "./persisted_collection";

/**
 * Controller to open the collection editor dialog.
 * @group Hooks and utilities
 */
export interface CollectionEditorController {

    editCollection: (props: {
        path?: string,
        fullPath?: string,
        parentCollectionIds: string[],
        parentCollection?: PersistedCollection
    }) => void;

    createCollection: (props: {
        initialValues?: {
            group?: string,
            path?: string,
            name?: string
        },
        parentCollectionIds: string[],
        parentCollection?: PersistedCollection,
        redirect: boolean
    }) => void;

    editProperty: (props: {
        propertyKey?: string,
        property?: Property,
        currentPropertiesOrder?: string[],
        editedCollectionPath: string,
        parentCollectionIds: string[],
        collection: PersistedCollection
    }) => void;

    configPermissions: CollectionEditorPermissionsBuilder;

    rootPathSuggestions?: string[];

}
