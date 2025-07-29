import React from "react";
import { CollectionEditorPermissionsBuilder } from "./config_permissions";
import { Entity, Property } from "@firecms/core";
import { PersistedCollection } from "./persisted_collection";

/**
 * Controller to open the collection editor dialog.
 * @group Hooks and utilities
 */
export interface CollectionEditorController {

    editCollection: (props: {
        id?: string,
        path?: string,
        parentCollectionIds: string[],
        parentCollection?: PersistedCollection,
        existingEntities?: Entity<any>[]
    }) => void;

    createCollection: (props: {
        initialValues?: {
            group?: string,
            path?: string,
            name?: string
        },
        parentCollectionIds: string[],
        parentCollection?: PersistedCollection,
        redirect: boolean,
        sourceClick?: string
    }) => void;

    editProperty: (props: {
        propertyKey?: string,
        property?: Property,
        currentPropertiesOrder?: string[],
        editedCollectionId: string,
        parentCollectionIds: string[],
        collection: PersistedCollection,
        existingEntities: Entity<any>[]
    }) => void;

    configPermissions: CollectionEditorPermissionsBuilder;

}
