import {
    CollectionSize,
    DataSource,
    Entity,
    EntityCollection,
    FireCMSContext,
    ResolvedProperty,
    User
} from "../../../types";

export type EntityCollectionTableProviderProps<M extends Record<string, any>, AdditionalKey extends string, UserType extends User> = {

    /**
     * Absolute collection path
     */
    path: string;

    /**
     * Use to resolve the collection properties for specific path, entity id or values
     */
    collection: EntityCollection<M>

    /**
     * List of entities that will be displayed on top, no matter the ordering.
     * This is used for reference fields selection
     */
    entitiesDisplayedFirst?: Entity<M>[];

    /**
     * Callback when anywhere on the table is clicked
     */
    onEntityClick?(entity: Entity<M>): void;

    /**
     * Callback when the selected size of the table is changed
     */
    onSizeChanged?(size: CollectionSize): void;

    /**
     * Can the table be edited inline
     */
    inlineEditing: ((entity: Entity<any>) => boolean) | boolean;

    /**
     * Builder for creating the buttons in each row
     * @param entity
     * @param size
     */
    tableRowActionsBuilder?: ({
                                  entity,
                                  size
                              }: { entity: Entity<M>, size: CollectionSize }) => React.ReactNode;
};

export type EntityCollectionTableController<M extends Record<string, any>> = {

    selectedCell?: SelectedCellProps<any>;
    focused: boolean;
    setFocused: (focused: boolean) => void;
    select: (cell?: SelectedCellProps<M>) => void;
    setPopupCell: (cell?: SelectedCellProps<M>) => void;
    onValueChange?: (params: OnCellValueChangeParams<any, M>) => void;
    selectedEntityIds?: string[];
    /**
     * Size of the elements in the collection
     */
    size: CollectionSize;
}

/**
 * Props passed in a callback when the content of a cell in a table has been edited
 * @category Collection components
 */
export interface OnCellValueChangeParams<T, M extends Record<string, any>> {
    value: T,
    propertyKey: string,
    entity: Entity<M>,
    onValueUpdated: () => void
    setError: (e: Error) => void
    fullPath: string
    collection: EntityCollection<M>
    dataSource: DataSource,
    context: FireCMSContext
}

export type SelectedCellProps<M extends Record<string, any>> =
    {
        propertyKey: keyof M,
        columnIndex: number,
        cellRect: DOMRect;
        width: number,
        height: number,
        collection: EntityCollection<M>,
        entity: Entity<M>
    };

/**
 * @category Collection components
 */
export type UniqueFieldValidator = (props: { name: string, value: any, property: ResolvedProperty, entityId?: string }) => Promise<boolean>;

/**
 * Callback when a cell has changed in a table
 * @category Collection components
 */
export type OnCellValueChange<T, M extends Record<string, any>> = (params: OnCellValueChangeParams<T, M>) => Promise<void>;
