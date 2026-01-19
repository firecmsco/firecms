import { CSSProperties } from "react";
import { Entity } from "../../types";

/**
 * Item wrapper for entities in the Board component
 */
export interface BoardItem<M extends Record<string, any> = any> {
    id: string;
    entity: Entity<M>;
}

/**
 * Map of column keys to arrays of board items
 */
export interface BoardItemMap<M extends Record<string, any> = any> {
    [columnKey: string]: BoardItem<M>[];
}

/**
 * Props passed to custom item render components
 */
export interface BoardItemViewProps<M extends Record<string, any> = any> {
    item: BoardItem<M>;
    isDragging: boolean;
    isClone?: boolean;
    isGroupedOver?: boolean;
    style?: CSSProperties;
    index?: number;
}

/**
 * Per-column loading state
 */
export interface ColumnLoadingState {
    [columnKey: string]: {
        loading: boolean;
        hasMore: boolean;
        itemCount: number;
        /** Total count of entities in column (may differ from itemCount if some lack orderProperty) */
        totalCount?: number;
    };
}

/**
 * Props for the Board component
 */
export interface BoardProps<M extends Record<string, any>, COLUMN extends string> {
    /**
     * Array of board items (entities wrapped with id)
     */
    data: BoardItem<M>[];
    /**
     * Array of column keys/identifiers
     */
    columns: COLUMN[];
    /**
     * Labels for each column (optional, uses column key if not provided)
     */
    columnLabels?: Record<COLUMN, string>;
    /**
     * CSS class name for the board container
     */
    className?: string;
    /**
     * Function to determine which column an item belongs to
     */
    assignColumn: (item: BoardItem<M>) => COLUMN;
    /**
     * Whether column reordering is allowed.
     * Set to true only when a plugin provides persistence for column order.
     */
    allowColumnReorder?: boolean;
    /**
     * Callback when columns are reordered
     */
    onColumnReorder?: (columns: COLUMN[]) => void;
    /**
     * Callback when items are reordered or moved between columns
     */
    onItemsReorder?: (
        items: BoardItem<M>[],
        moveInfo?: {
            itemId: string;
            sourceColumn: COLUMN;
            targetColumn: COLUMN;
        }
    ) => void;
    /**
     * Component to render individual items
     */
    ItemComponent: React.ComponentType<BoardItemViewProps<M>>;
    /**
     * Per-column loading state for pagination
     */
    columnLoadingState?: ColumnLoadingState;
    /**
     * Callback to load more items for a column
     */
    onLoadMoreColumn?: (column: COLUMN) => void;
    /**
     * Callback to add a new item to a specific column
     */
    onAddItemToColumn?: (column: COLUMN) => void;
    /**
     * Optional component to render at the end of the board for adding new columns
     */
    AddColumnComponent?: React.ReactNode;
}
