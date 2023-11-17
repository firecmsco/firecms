import { CollectionEditorPermissionsBuilder } from "./config_permissions";
import { EntityCollection, Property } from "@firecms/core";

/**
 * Controller to open the collection editor dialog.
 * @category Hooks and utilities
 */
export interface CollectionEditorController {

    editCollection: (props: {
        path?: string,
        fullPath?: string,
        parentPathSegments: string[],
        parentCollection?: EntityCollection<any, any, any>
    }) => void;

    createCollection: (props: {
        initialValues?: {
            group?: string,
            path?: string,
            name?: string
        },
        parentPathSegments: string[],
        parentCollection?: EntityCollection<any, any, any>,
        redirect: boolean
    }) => void;

    editProperty: (props: {
        propertyKey?: string,
        property?: Property,
        currentPropertiesOrder?: string[],
        editedCollectionPath: string,
        parentPathSegments: string[],
    }) => void;

    configPermissions: CollectionEditorPermissionsBuilder;

    rootPathSuggestions?: string[];

}
