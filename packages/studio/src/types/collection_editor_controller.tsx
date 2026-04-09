import { CollectionEditorPermissionsBuilder } from "./config_permissions";
import { CollectionsConfigController } from "./config_controller";
import { Entity, EntityCollection, Property } from "@rebasepro/types";

/**
 * Controller to open the collection editor dialog.
 * @group Hooks and utilities
 */
export interface CollectionEditorController {

    editCollection: (props: {
        id?: string,
        path?: string,
        parentCollectionIds: string[],
        parentCollection?: EntityCollection,
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
            name?: string,
            databaseId?: string
        },
        /**
         * A collection to duplicate from. If provided, the new collection will be
         * pre-populated with the same properties (but with empty name, path, and id).
         */
        copyFrom?: EntityCollection,
        parentCollectionIds: string[],
        parentCollection?: EntityCollection,
        redirect: boolean,
        sourceClick?: string
    }) => void;

    editProperty: (props: {
        propertyKey?: string,
        property?: Property,
        currentPropertiesOrder?: string[],
        editedCollectionId: string,
        parentCollectionIds: string[],
        collection: EntityCollection,
        existingEntities: Entity<any>[]
    }) => void;

    /**
     * The config controller that this editor represents.
     */
    configController: CollectionsConfigController;

    configPermissions: CollectionEditorPermissionsBuilder;

    pathSuggestions: string[] | undefined;

}
