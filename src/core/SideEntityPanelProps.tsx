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


