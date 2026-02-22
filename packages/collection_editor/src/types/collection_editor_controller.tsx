import { CollectionEditorPermissionsBuilder } from "./config_permissions";
import { CollectionsConfigController } from "./config_controller";
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
        existingEntities?: Entity<any>[],
        /**
         * Initial view to open: "general", "display", or "properties"
         */
        initialView?: "general" | "display" | "properties",
        /**
         * If true, expand the Kanban configuration section
         */
        expandKanban?: boolean
    }) => void;

    createCollection: (props: {
        initialValues?: {
            group?: string,
            path?: string,
            name?: string
        },
        /**
         * A collection to duplicate from. If provided, the new collection will be
         * pre-populated with the same properties (but with empty name, path, and id).
         */
        copyFrom?: PersistedCollection,
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

    /**
     * The config controller that this editor represents.
     */
    configController: CollectionsConfigController;

    configPermissions: CollectionEditorPermissionsBuilder;

    pathSuggestions: string[] | undefined;

}
