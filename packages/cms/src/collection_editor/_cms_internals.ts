/**
 * Internal re-exports for the collection editor module.
 * This avoids circular imports by pointing directly at source files
 * rather than going through the CMS barrel (index.ts).
 */

// Hooks
export { useCollectionRegistryController } from "../hooks/navigation/contexts/CollectionRegistryContext";
export { useNavigationStateController } from "../hooks/navigation/contexts/NavigationStateContext";
export { useUrlController } from "../hooks/navigation/contexts/UrlContext";
export { useSideEntityController } from "../hooks/useSideEntityController";
export { useBreadcrumbsController } from "../hooks/useBreadcrumbsController";

// Components
export { FieldCaption } from "../components/FieldCaption";
export { SearchIconsView } from "../components/SearchIconsView";
export { PropertyConfigBadge } from "../components/PropertyConfigBadge";
export { EntityCollectionTable } from "../components/EntityCollectionTable";
export { VirtualTableInput } from "../components/EntityCollectionTable/fields/VirtualTableInput";
export { ArrayContainer } from "../components/ArrayContainer";
export type { ArrayEntryParams } from "../components/ArrayContainer";
export { useSelectionController } from "../components/EntityCollectionView/useSelectionController";

// Data import
export { ImportFileUpload } from "../data_import/components/ImportFileUpload";
export { ImportSaveInProgress } from "../data_import/components/ImportSaveInProgress";
export { useImportConfig } from "../data_import/hooks/useImportConfig";
export { getInferenceType } from "../data_import/utils/get_import_inference_type";
export { convertDataToEntity } from "../data_import/utils/data";
export type { ImportConfig } from "../data_import/types";

// Data import components
export { DataNewPropertiesMapping } from "../data_import/components/DataNewPropertiesMapping";
export { ImportNewPropertyFieldPreview } from "../data_import/components/ImportNewPropertyFieldPreview";

// Field config utilities
export { getFieldConfig, getFieldId, getDefaultFieldConfig, getDefaultFieldId, DEFAULT_FIELD_CONFIGS } from "../components/field_configs";

// Property & resolution utilities
export { getPropertyInPath, getResolvedPropertyInPath, getDefaultPropertiesOrder, getPropertiesWithPropertiesOrder } from "../util/property_utils";
export { resolveEntityAction, resolveEntityView } from "../util/resolutions";
