// Collection Editor — moved from @rebasepro/studio
// This module provides the visual schema/collection editor for the CMS.
//
// IMPORTANT: Heavy UI components (CollectionEditorDialog, CollectionStudioView,
// CollectionsStudioView, PropertyForm, PropertyFormDialog) are NOT re-exported
// here to keep the main CMS bundle lean. Import them from
// "@rebasepro/cms/collection_editor_ui" instead — they live in a separate chunk
// that is loaded on demand.


export {
    useCollectionEditorController
} from "./useCollectionEditorController";
export {
    useCollectionsConfigController
} from "./useCollectionsConfigController";
export {
    useLocalCollectionsConfigController
} from "./useLocalCollectionsConfigController";

export {
    validateCollectionJson,
    type CollectionValidationError,
    type CollectionValidationResult
} from "./validateCollectionJson";

export type {
    CollectionsConfigController, DeleteCollectionParams, SaveCollectionParams, UpdateCollectionParams, CollectionsSetupInfo, UpdatePropertiesOrderParams, UpdateKanbanColumnsOrderParams
} from "./types/config_controller";
export type {
    CollectionEditorController
} from "./types/collection_editor_controller";
export type {
    CollectionEditorPermissions, CollectionEditorPermissionsBuilder
} from "./types/config_permissions";
export type {
    CollectionInference
} from "./types/collection_inference";

export {
    buildCollectionGenerationCallback,
    CollectionGenerationApiError,
    DEFAULT_COLLECTION_GENERATION_ENDPOINT
} from "./api/generateCollectionApi";

export type {
    CollectionGenerationCallback,
    GenerateCollectionRequest,
    GenerateCollectionResult,
    CollectionOperation,
    CollectionOperationType,
    BuildCollectionGenerationCallbackProps
} from "./api/generateCollectionApi";

export { MissingReferenceWidget } from "./ui/MissingReferenceWidget";

export * from "./ui/collection_editor/util";

// Re-export types only from heavy UI components (runtime code is in the separate chunk)
export type { CollectionEditorDialogProps } from "./ui/collection_editor/CollectionEditorDialog";
export type { CollectionStudioViewProps } from "./ui/collection_editor/CollectionStudioView";
export type { CollectionsStudioViewProps } from "./ui/collection_editor/CollectionsStudioView";
export type { PropertyFormProps, OnPropertyChangedParams } from "./ui/collection_editor/PropertyEditView";
