import { CollectionSize, Entity, FireCMSContext, ResolvedProperty, SelectedCellProps } from "../../types";

export type EntityCollectionTableController<M extends Record<string, any>> = {

    /**
     * This cell is displayed as selected
     */
    selectedCell?: SelectedCellProps<any>;
    /**
     * Select a table cell
     * @param cell
     */
    select: (cell?: SelectedCellProps<M>) => void;
    /**
     * The cell that is displayed as a popup view.
     * @param cell
     */
    setPopupCell?: (cell?: SelectedCellProps<M>) => void;
    /**
     * Callback used when the value of a cell has changed.
     * @param params
     */
    onValueChange?: (params: OnCellValueChangeParams<any, M>) => void;
    /**
     * Size of the elements in the collection
     */
    size: CollectionSize;
}

/**
 * Props passed in a callback when the content of a cell in a table has been edited
 * @group Collection components
 */
export interface OnCellValueChangeParams<T = any, M extends Record<string, any> = any> {
    value: T,
    propertyKey: string,
    entity: Entity<M>,
    onValueUpdated: () => void
    setError: (e: Error | undefined) => void
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
export type OnCellValueChange<T, M extends Record<string, any>> = (params: OnCellValueChangeParams<T, M>) => Promise<void> | void;

/**
 * @group Collection components
 */
export type OnColumnResizeParams = { width: number, key: string };
