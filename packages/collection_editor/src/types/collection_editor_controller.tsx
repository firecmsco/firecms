import { CollectionEditorPermissionsBuilder } from "./config_permissions";
import { EntityCollection, Property } from "@firecms/core";
import { PersistedCollection } from "./persisted_collection";

/**
 * Controller to open the collection editor dialog.
 * @category Hooks and utilities
 */
export interface CollectionEditorController {

    editCollection: (props: {
        path?: string,
        fullPath?: string,
        parentPathSegments: string[],
        parentCollection?: EntityCollection
    }) => void;

    createCollection: (props: {
        initialValues?: {
            group?: string,
            path?: string,
            name?: string
        },
        parentPathSegments: string[],
        parentCollection?: PersistedCollection,
        redirect: boolean
    }) => void;

    editProperty: (props: {
        propertyKey?: string,
        property?: Property,
        currentPropertiesOrder?: string[],
        editedCollectionPath: string,
        parentPathSegments: string[],
        collection: PersistedCollection
    }) => void;

    configPermissions: CollectionEditorPermissionsBuilder;

    rootPathSuggestions?: string[];

}
