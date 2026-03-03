export {
    useCollectionEditorPlugin
} from "./useCollectionEditorPlugin";

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
    editableProperty, removeNonEditableProperties
} from "./utils/entities";

export {
    validateCollectionJson,
    type CollectionValidationError,
    type CollectionValidationResult
} from "./utils/validateCollectionJson";

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
    PersistedCollection
} from "./types/persisted_collection";

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

export { CollectionEditorDialog, type CollectionEditorDialogProps } from "./ui/collection_editor/CollectionEditorDialog";
export { CollectionStudioView, type CollectionStudioViewProps } from "./ui/collection_editor/CollectionStudioView";

export {
    PropertyForm,
    PropertyFormDialog,
    type PropertyFormProps,
    type OnPropertyChangedParams
} from "./ui/collection_editor/PropertyEditView";

export * from "./components/SQLEditor/SQLEditor";
export * from "./components/RLSEditor/RLSEditor";
export * from "./components/RLSEditor/PolicyEditor";
export * from "./utils/sql_utils";
export { StudioLayout, type StudioLayoutProps, type StudioView } from "./components/StudioLayout";
