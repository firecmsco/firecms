import {
    AdditionalColumnDelegate,
    CollectionSize,
    Entity,
    EntityCollection,
    FilterCombination,
    FilterValues,
    ResolvedProperty,
    User
} from "../../../models";
import { CellRendererParams, TableColumn, TableFilterValues } from "../Table";
import { OnCellChangeParams } from "./internal/PropertyTableCell";

export type EntityCollectionTableProviderProps<M, AdditionalKey extends string, UserType extends User> = {

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

export type EntityCollectionTableController<M, E> = {
    collection: EntityCollection<any>;
    path: string;
    inlineEditing: ((entity: Entity<any>) => boolean) | boolean;
    selectedCell?: SelectedCellProps<any>;
    focused: boolean;
    additionalColumnsMap: Record<string, AdditionalColumnDelegate<any, string, any>>;
    select: (cell?: SelectedCellProps<M>) => void;
    setPopupCell: (cell?: SelectedCellProps<M>) => void;
    onValueChange?: (params: OnCellChangeParams<any, M>) => void;
    /**
     * Size of the elements in the collection
     */
    size: CollectionSize;

    updateSize: (size: CollectionSize) => void;

    /**
     * Use this callback to validate if an entity field should be unique
     */
    uniqueFieldValidator?: UniqueFieldValidator;

    /**
     * Callback when the value of a cell has been edited
     * @param params
     */
    onCellValueChange?: OnCellValueChange<unknown, M>;
    columns: TableColumn<Entity<M>, any>[],
    popupFormField: React.ReactElement,
    cellRenderer: (params: CellRendererParams<any, E>) => React.ReactNode;
    filterIsSet: boolean;
    textSearchEnabled: boolean;

    /**
     * If you need to filter/sort by multiple properties in this
     * collection, you can define the supported filter combinations here.
     * In the case of Firestore, you need to create special indexes in the console to
     * support filtering/sorting by more than one property. You can then
     * specify here the indexes created.
     */
    filterCombinations?: FilterCombination<Extract<keyof M, string>>[];
    data: Entity<M>[]
    dataLoading: boolean,
    noMoreToLoad: boolean,
    dataLoadingError?: Error;
    onTextSearch?: (searchString?: string) => void;
    onSizeChanged?: (size: CollectionSize) => void;
    clearFilter: () => void;
    onRowClick?: (props: { rowData: any; rowIndex: number; rowKey: string; event: React.SyntheticEvent }) => void;
    loadNextPage: () => void,
    resetPagination: () => void,
    paginationEnabled: boolean,
    setFilterValues: (filter?: TableFilterValues<any> | undefined) => void;
    filterValues?: FilterValues<Extract<keyof M, string>>,
    sortBy?: [Extract<keyof M, string>, "asc" | "desc"],
    setSortBy: (sortBy: [Extract<keyof M, string>, "asc" | "desc"] | undefined) => void,

}

/**
 * Props passed in a callback when the content of a cell in a table has been edited
 * @category Collection components
 */
export interface OnCellValueChangeParams<T, M extends { [Key: string]: any }> {
    value: T,
    propertyKey: string,
    entity: Entity<M>,
    setSaved: (saved: boolean) => void
    setError: (e: Error) => void
}

export type SelectedCellProps<M> =
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
export type OnCellValueChange<T, M extends { [Key: string]: any }> = (params: OnCellValueChangeParams<T, M>) => Promise<void>;
