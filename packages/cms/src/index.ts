// CMS-specific types take priority over base types when names conflict
export * from "./types";
export * from "./editor";
export * from "./form";
export * from "./preview";
export * from "./routes";

// Components — explicitly listed to avoid conflicts with ./types re-exports
export {
    EntityView,
    EntitySelectionTable,
    SelectableTable,
    SelectableTableContext,
    EntityCollectionView,
    EntityCollectionViewActions,
    EntityCollectionCardView,
    EntityCard,
    useSelectionController,
    PropertyConfigBadge,
    PropertyIdCopyTooltip,
    EntityCollectionTable,
    EntityCollectionRowActions,
    VirtualTableInput,
    ArrayContainer,
    type ArrayEntryParams,
    ReferenceWidget,
    SearchIconsView,
    FieldCaption,
    EntityPreview,
    getFieldConfig,
    getFieldId,
    getDefaultFieldConfig,
    getDefaultFieldId,
    DEFAULT_FIELD_CONFIGS,
    editEntityAction,
    copyEntityAction,
    deleteEntityAction,
    SideEntityProvider,
    Scaffold,
    AppBar,
    Drawer,
    AdminModeSyncer,
    ContentHomePage,
    UsersView,
    RolesView,
    RebaseCMS,
    RebaseShell,
    SideDialogs,
    useApp,
} from "./components";
export type {
    EntityViewProps,
    EntitySelectionProps,
    SelectableTableProps,
} from "./components";

export * from "./hooks";
// Util
export {
    addInitialSlash,
    removeInitialSlash,
    removeTrailingSlash,
    removeInitialAndTrailingSlashes,
    getLastSegment,
    getCollectionBySlugWithin,
    getCollectionPathsCombinations,
    resolveCollectionPathIds,
    mergeEntityActions,
    resolveEntityAction,
    resolveEntityView,
    // Property utilities (moved from @rebasepro/core — property-aware logic belongs in CMS)
    isReferenceProperty,
    isRelationProperty,
    getIconForWidget,
    getIconForProperty,
    getPropertyInPath,
    getResolvedPropertyInPath,
    getBracketNotation,
    getPropertiesWithPropertiesOrder,
    getDefaultPropertiesOrder,
    // Preview utilities (moved from @rebasepro/core — property-aware logic belongs in CMS)
    getEntityPreviewKeys,
    getEntityTitlePropertyKey,
} from "./util";

// Data import/export — merged from former standalone packages
export * from "./data_import";
export * from "./data_export";
