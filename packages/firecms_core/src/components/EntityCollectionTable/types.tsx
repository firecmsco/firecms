import { CollectionSize, Entity, FireCMSContext, ResolvedProperty, SelectedCellProps } from "../../types";

export type EntityCollectionTableController<M extends Record<string, any>> = {

    selectedCell?: SelectedCellProps<any>;
    select: (cell?: SelectedCellProps<M>) => void;
    setPopupCell?: (cell?: SelectedCellProps<M>) => void;
    onValueChange?: (params: OnCellValueChangeParams<any, M>) => void;
    selectedEntityIds?: string[];
    /**
     * Size of the elements in the collection
     */
    size: CollectionSize;
}

/**
 * Props passed in a callback when the content of a cell in a table has been edited
 * @group Collection components
 */
export interface OnCellValueChangeParams<T, M extends Record<string, any>> {
    value: T,
    propertyKey: string,
    entity: Entity<M>,
    onValueUpdated: () => void
    setError: (e: Error) => void
    fullPath: string
    context: FireCMSContext
}

/**
 * @group Collection components
 */
export type UniqueFieldValidator = (props: {
    name: string,
    value: any,
    property: ResolvedProperty,
    entityId?: string
}) => Promise<boolean>;

/**
 * Callback when a cell has changed in a table
 * @group Collection components
 */
export type OnCellValueChange<T, M extends Record<string, any>> = (params: OnCellValueChangeParams<T, M>) => Promise<void>;
