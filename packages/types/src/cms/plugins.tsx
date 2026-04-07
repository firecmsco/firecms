import React, { PropsWithChildren } from "react";

import { EntityCollection } from "./collections";
import { CollectionActionsProps, EntityTableController, Property, EntityStatus } from "../types";
import { FieldProps, FormContext } from "./fields";
import { RebaseContext } from "../rebase_context";
import { NavigationGroupMapping, CMSView } from "./controllers";
import { UserManagementDelegate } from "../types/user_management_delegate";
import { User } from "../users";
import { SlotContribution } from "./slots";

// ── Plugin ────────────────────────────────────────────────────────────

/**
 * Interface used to define plugins for Rebase.
 * Plugins contribute UI via **slots**, wrap subtrees with **providers**,
 * and inject behavioral logic via **hooks**.
 * @group Core
 */
export interface RebasePlugin {
    /**
     * Unique key identifying this plugin.
     */
    key: string;

    /**
     * If true, no CMS content is shown until this plugin finishes loading.
     */
    loading?: boolean;

    /**
     * UI slot contributions rendered at the matching extension points.
     */
    slots?: SlotContribution[];

    /**
     * HOC providers wrapping root or form content.
     * Providers with `scope: "root"` wrap the entire CMS below RebaseContext.
     * Providers with `scope: "form"` wrap each entity form/edit view.
     */
    providers?: PluginProvider[];

    /**
     * Behavioral hooks (non-UI) — collection modification, search blocking,
     * column reordering, navigation entries, etc.
     */
    hooks?: PluginHooks;

    /**
     * Field wrapping for custom field rendering (e.g. data enhancement).
     */
    fieldBuilder?: FieldBuilderConfig;

    /**
     * Views to be automatically added to the navigation.
     */
    views?: CMSView[];

    /**
     * User management delegate from this plugin.
     */
    userManagement?: UserManagementDelegate;
}

// ── Provider ──────────────────────────────────────────────────────────

/**
 * A HOC provider that wraps a subtree of the CMS.
 * @group Plugins
 */
export interface PluginProvider {
    /**
     * `"root"` — wraps the entire CMS below RebaseContext.
     * `"form"` — wraps each entity form / edit view.
     */
    scope: "root" | "form";

    /**
     * The provider component. Must accept `children`.
     * Typed loosely because extra props are passed via the `props` field;
     * strict signatures cause contravariance issues.
     */
    Component: React.ComponentType<any>;

    /**
     * Additional props passed to the Component.
     */
    props?: Record<string, any>;
}

// ── Hooks ─────────────────────────────────────────────────────────────

/**
 * Behavioral hooks that a plugin can provide.
 * These are non-UI extension points for modifying CMS behavior.
 * @group Plugins
 */
export interface PluginHooks {
    /**
     * Modify a single collection before it is rendered.
     */
    modifyCollection?: (collection: EntityCollection) => EntityCollection;

    /**
     * Modify, add or remove collections.
     */
    injectCollections?: (collections: EntityCollection[]) => EntityCollection[];

    /**
     * Block text search for a collection.
     */
    blockSearch?: (props: {
        context: RebaseContext;
        path: string;
        collection: EntityCollection;
        parentCollectionIds?: string[];
    }) => boolean;

    /**
     * Callback when the text search button is clicked.
     */
    onTextSearchClick?: (props: {
        context: RebaseContext;
        path: string;
        collection: EntityCollection;
        parentCollectionIds?: string[];
    }) => Promise<boolean>;

    /**
     * Callback called when columns are reordered via drag and drop.
     */
    onColumnsReorder?: (props: {
        fullPath: string;
        parentCollectionIds: string[];
        collection: EntityCollection;
        newPropertiesOrder: string[];
    }) => void;

    /**
     * Callback called when Kanban board columns are reordered.
     */
    onKanbanColumnsReorder?: (props: {
        fullPath: string;
        parentCollectionIds: string[];
        collection: EntityCollection;
        kanbanColumnProperty: string;
        newColumnsOrder: string[];
    }) => void;

    /**
     * Navigation entries contributed by this plugin.
     */
    navigationEntries?: NavigationGroupMapping[];

    /**
     * Callback when navigation entry order changes (e.g. drag-and-drop).
     */
    onNavigationEntriesUpdate?: (entries: NavigationGroupMapping[]) => void;

    /**
     * Allow reordering collections in the home page via drag and drop.
     */
    allowDragAndDrop?: boolean;
}

// ── Field Builder ─────────────────────────────────────────────────────

/**
 * Configuration for wrapping form field components.
 * @group Plugins
 */
export interface FieldBuilderConfig {
    /**
     * Returns a wrapped field component, or null to skip wrapping.
     */
    wrap: <T>(params: PluginFieldBuilderParams) => React.ComponentType<FieldProps<any>> | null;

    /**
     * Optional guard — return false to skip wrapping for this field.
     */
    enabled?: (params: PluginFieldBuilderParams) => boolean;
}

// ── Prop interfaces ───────────────────────────────────────────────────

/**
 * Props passed to home page collection card action components.
 * @group Models
 */
export interface PluginHomePageActionsProps<EP extends object = object, M extends Record<string, any> = any, USER extends User = User, EC extends EntityCollection<M> = EntityCollection<M>> {
    slug: string;
    collection: EC;
    context: RebaseContext<USER>;
}

/**
 * Props passed to form action components in entity edit/form views.
 * @group Models
 */
export interface PluginFormActionProps<USER extends User = User, EC extends EntityCollection = EntityCollection> {
    entityId?: string | number;
    path: string;
    parentCollectionIds: string[];
    status: EntityStatus;
    collection: EC;
    disabled: boolean;
    formContext?: FormContext;
    context: RebaseContext<USER>;
    openEntityMode: "side_panel" | "full_screen";
}

/**
 * Parameters passed to the field builder wrap function.
 * @group Models
 */
export type PluginFieldBuilderParams<M extends Record<string, any> = any, EC extends EntityCollection<M> = EntityCollection<M>> = {
    fieldConfigId: string;
    propertyKey: string;
    property: Property;
    Field: React.ComponentType<FieldProps<Property, unknown, M>>;
    plugin: RebasePlugin;
    path?: string;
    collection?: EC;
};

/**
 * Generic props passed to plugin components that just need CMS context.
 * @group Models
 */
export interface PluginGenericProps<USER extends User = User> {
    context: RebaseContext<USER>;
}

/**
 * Props for additional card components in the home page.
 * @group Models
 */
export interface PluginHomePageAdditionalCardsProps<USER extends User = User> {
    group?: string;
    context: RebaseContext<USER>;
}
