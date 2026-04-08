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
} from "./components";
export type {
    EntityViewProps,
    EntitySelectionProps,
    SelectableTableProps,
} from "./components";

// Hooks
export { useSideEntityController } from "./hooks";
export { useEntitySelectionDialog } from "./hooks";
export { useBuildSideEntityController } from "./hooks";

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
} from "./util";
