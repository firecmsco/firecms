import { SchemaConfig } from "./schema_resolver";


/**
 * Props used to open a side dialog
 * @category Hooks and utilities
 */
export interface SideEntityPanelProps {
    /**
     * Absolute path of the entity
     */
    path: string;

    /**
     * Id of the entity, if not set, it means we are creating a new entity
     */
    entityId?: string;

    /**
     * Set this flag to true if you want to make a copy of an existing entity
     */
    copy?: boolean;

    /**
     * Open the entity with a selected subcollection view. If the panel for this
     * entity was already open, it is replaced.
     */
    selectedSubpath?: string;

}

/**
 * Controller to open the side dialog displaying entity forms
 * @category Hooks and utilities
 */
export interface SideEntityController {
    /**
     * Close the last panel
     */
    close: () => void;

    /**
     * List of side entity panels currently open
     */
    sidePanels: SideEntityPanelProps[];

    /**
     * Open a new entity sideDialog. By default, the schema and configuration
     * of the view is fetched from the collections you have specified in the
     * navigation.
     * At least you need to pass the path of the entity you would like
     * to edit. You can set an entityId if you would like to edit and existing one
     * (or a new one with that id).
     * If you wish, you can also override the `SchemaSidePanelProps` and choose
     * to override the FireCMS level SchemaResolver.
     * @param props
     */
    open: (props: SideEntityPanelProps & Partial<SchemaConfig> & { overrideSchemaResolver?: boolean }) => void;
}
