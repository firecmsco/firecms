import React from "react";
import {
    AdditionalFieldDelegate,
    CollectionSize,
    Entity,
    EntityTableController,
    FilterValues,
    ResolvedProperties,
    ResolvedProperty,
    SelectionController,
    User
} from "../../types";
import { OnCellValueChange, OnColumnResizeParams, UniqueFieldValidator } from "../common/types";

/**
 * @group Collection components
 */
export type EntityCollectionTableProps<M extends Record<string, any>,
    USER extends User = User> = {

    className?: string;

    style?: React.CSSProperties;

    /**
     * Display these entities as selected
     */
    selectionController: SelectionController<M>;

    /**
     * List of entities that will be displayed as selected;
     */
    highlightedEntities?: Entity<M>[];

    /**
     * Override the title in the toolbar
     */
    title?: React.ReactNode;

    /**
     * Additional component that renders actions such as buttons in the
     * collection toolbar, displayed on the left side
     */
    actionsStart?: React.ReactNode;

    /**
     * Callback when a cell value changes.
     */
    onValueChange?: OnCellValueChange<any, M>;

    uniqueFieldValidator?: UniqueFieldValidator;

    /**
     * Builder for creating the buttons in each row
     * @param entity
     * @param size
     */
    tableRowActionsBuilder?: (params: {
        entity: Entity<M>,
        size: CollectionSize,
        width: number,
        frozen?: boolean
    }) => React.ReactNode;

    /**
     * Callback when anywhere on the table is clicked
     */
    onEntityClick?(entity: Entity<M>): void;

    /**
     * Callback when a column is resized
     */
    onColumnResize?(params: OnColumnResizeParams): void;

    /**
     * Initial scroll position
     */
    initialScroll?: number;

    /**
     * Callback when the table is scrolled
     * @param props
     */
    onScroll?: (props: {
        scrollDirection: "forward" | "backward",
        scrollOffset: number,
        scrollUpdateWasRequested: boolean
    }) => void;

    /**
     * Callback when the selected size of the table is changed
     */
    onSizeChanged?(size: CollectionSize): void;

    /**
     * Should apply a different style to a row when hovering
     */
    hoverRow?: boolean;

    /**
     * Additional component that renders actions such as buttons in the
     * collection toolbar, displayed on the right side
     */
    actions?: React.ReactNode;

    /**
     * Controller holding the logic for the table
     * {@link useDataSourceTableController}
     * {@link EntityTableController}
     */
    tableController: EntityTableController<M>;

    displayedColumnIds?: PropertyColumnConfig[];

    forceFilter?: FilterValues<Extract<keyof M, string>>;

    textSearchEnabled?: boolean;

    inlineEditing?: boolean;

    additionalFields?: AdditionalFieldDelegate<M, USER>[];

    defaultSize?: CollectionSize;

    properties: ResolvedProperties<M>;

    getPropertyFor?: (props: GetPropertyForProps<M>) => ResolvedProperties<M>[string];

    filterable?: boolean;

    sortable?: boolean;

    endAdornment?: React.ReactNode;

    AdditionalHeaderWidget?: React.ComponentType<{
        property: ResolvedProperty,
        propertyKey: string,
        onHover: boolean,
    }>;

    AddColumnComponent?: React.ComponentType;

    additionalIDHeaderWidget?: React.ReactNode;

    emptyComponent?: React.ReactNode;

    getIdColumnWidth?: () => number;

    onTextSearchClick?: () => void;

    textSearchLoading?: boolean;

    enablePopupIcon: boolean;

    openEntityMode?: "side_panel" | "full_screen";
};

export type GetPropertyForProps<M extends Record<string, any>> = {
    propertyKey: string,
    entity: Entity<M>
};

export type PropertyColumnConfig = {
    key: string,
    disabled?: boolean,
};
