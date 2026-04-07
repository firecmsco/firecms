import React from "react";
import { CollectionActionsProps, EntityCollection, EntityTableController, SelectionController } from "./collections";
import { PluginFormActionProps, PluginGenericProps, PluginHomePageActionsProps, PluginHomePageAdditionalCardsProps } from "./plugins";
import { Property } from "./properties";
import { RebaseContext } from "../rebase_context";

/**
 * Registry mapping slot names to their component prop types.
 * Each key represents a UI extension point in the CMS.
 * @group Plugins
 */
export interface SlotRegistry {
    // ── Home page ─────────────────────────────────────────────────────
    "home.actions": PluginGenericProps;
    "home.cards": PluginHomePageAdditionalCardsProps;
    "home.children.start": PluginGenericProps;
    "home.children.end": PluginGenericProps;
    "home.collection.actions": PluginHomePageActionsProps;

    // ── Navigation / Drawer ───────────────────────────────────────────
    /** Rendered below the logo in the sidebar drawer. */
    "navigation.header": NavigationSlotProps;
    /** Rendered above the collapse toggle at the bottom of the drawer. */
    "navigation.footer": NavigationSlotProps;

    // ── Collection view ───────────────────────────────────────────────
    "collection.actions": CollectionActionsProps;
    "collection.actions.start": CollectionActionsProps;
    "collection.header.action": CollectionHeaderActionProps;
    "collection.add-column": CollectionAddColumnProps;
    "collection.error": CollectionErrorProps;
    /** Extra widgets rendered inside the collection toolbar row. */
    "collection.toolbar": CollectionToolbarProps;
    /** Custom empty-state component when a collection has no data. */
    "collection.empty-state": CollectionEmptyStateProps;

    // ── Entity / Form ─────────────────────────────────────────────────
    "form.actions": PluginFormActionProps;
    "form.actions.top": PluginFormActionProps;
    /** Rendered before the form title / field list. */
    "form.before": PluginFormActionProps;
    /** Rendered after the form field list. */
    "form.after": PluginFormActionProps;

    // ── Kanban ────────────────────────────────────────────────────────
    "kanban.setup": KanbanSetupProps;
    "kanban.add-column": KanbanAddColumnProps;
}

/**
 * Valid slot names for UI extension points.
 * @group Plugins
 */
export type SlotName = keyof SlotRegistry;

/**
 * A single UI component contribution to a named slot.
 * @group Plugins
 */
export interface SlotContribution<K extends SlotName = SlotName> {
    /**
     * Which slot to contribute to.
     */
    slot: K;

    /**
     * The component to render in the slot.
     * Typed loosely so mixed-slot arrays work.
     * Type safety is provided at the `useSlot` call site.
     */
    Component: React.ComponentType<any>;

    /**
     * Additional props to merge into the slot props before rendering.
     */
    props?: Record<string, any>;

    /**
     * Ordering hint. Lower values render first. Defaults to 50.
     */
    order?: number;
}

// ── Prop interfaces for slots ─────────────────────────────────────────

/**
 * Props for `navigation.header` and `navigation.footer` slots.
 * @group Plugins
 */
export interface NavigationSlotProps {
    drawerOpen: boolean;
    drawerHovered: boolean;
    context: RebaseContext;
}

/**
 * Props for the `collection.toolbar` slot.
 * @group Plugins
 */
export interface CollectionToolbarProps {
    path: string;
    collection: EntityCollection;
    parentCollectionIds: string[];
    tableController: EntityTableController;
    selectionController: SelectionController;
}

/**
 * Props for the `collection.empty-state` slot.
 * @group Plugins
 */
export interface CollectionEmptyStateProps {
    path: string;
    collection: EntityCollection;
    parentCollectionIds: string[];
    canCreate: boolean;
    onNewClick?: () => void;
}

/**
 * Props for the `collection.header.action` slot.
 * @group Plugins
 */
export interface CollectionHeaderActionProps {
    property: Property;
    propertyKey: string;
    path: string;
    parentCollectionIds: string[];
    onHover: boolean;
    collection: EntityCollection;
    tableController: EntityTableController;
}

/**
 * Props for the `collection.add-column` slot.
 * @group Plugins
 */
export interface CollectionAddColumnProps {
    path: string;
    parentCollectionIds: string[];
    collection: EntityCollection;
    tableController: EntityTableController;
}

/**
 * Props for the `collection.error` slot.
 * @group Plugins
 */
export interface CollectionErrorProps {
    path: string;
    collection: EntityCollection;
    parentCollectionIds?: string[];
    error: Error;
}

/**
 * Props for the `kanban.setup` slot.
 * @group Plugins
 */
export interface KanbanSetupProps {
    collection: EntityCollection;
    fullPath: string;
    parentCollectionIds: string[];
}

/**
 * Props for the `kanban.add-column` slot.
 * @group Plugins
 */
export interface KanbanAddColumnProps {
    collection: EntityCollection;
    fullPath: string;
    parentCollectionIds: string[];
    columnProperty: string;
}
