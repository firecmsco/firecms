import React from "react";
import {
    AdditionalFieldDelegate,
    CollectionSize,
    Entity,
    FilterValues,
    ResolvedProperties,
    SelectionController, TableController,
    User
} from "../../../types";
import { OnCellValueChange, UniqueFieldValidator } from "./types";

/**
 * @category Collection components
 */
export type OnColumnResizeParams = { width: number, key: string };

/**
 * @category Collection components
 */
export type EntityCollectionTableProps<M extends Record<string, any>,
    AdditionalKey extends string = string,
    UserType extends User = User> = {

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
     * {@link useEntityCollectionTableController}
     * {@link TableController}
     */
    tableController: TableController<M>;

    displayedColumnIds: PropertyColumnConfig[];

    forceFilter?: FilterValues<Extract<keyof M, string>>;

    textSearchEnabled?: boolean;

    inlineEditing?: boolean | ((entity: Entity<M>) => boolean);

    additionalFields?: AdditionalFieldDelegate<M, AdditionalKey, UserType>[];

    defaultSize?: CollectionSize;

    properties: ResolvedProperties<M>;

    getPropertyFor?: (props: GetPropertyForProps<M>) => ResolvedProperties<M>[string];

    filterable?: boolean;

    sortable?: boolean;

    endAdornment?: React.ReactNode;

}

export type GetPropertyForProps<M extends Record<string, any>> = {
    propertyKey: string,
    propertyValue: any,
    entity: Entity<M>
};

export type PropertyColumnConfig = {
    key: string,
    disabled: boolean,
};
