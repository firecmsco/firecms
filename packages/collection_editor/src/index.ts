export {
    useCollectionEditorPlugin
} from "./useCollectionEditorPlugin.js";

export {
    useCollectionEditorController
} from "./useCollectionEditorController.js";
export {
    useCollectionsConfigController
} from "./useCollectionsConfigController.js";

export {
    editableProperty, removeNonEditableProperties
} from "./utils/entities.js";
export * from "./utils/collections.js";
export {
    validateCollectionJson,
    type CollectionValidationError,
    type CollectionValidationResult
} from "./utils/validateCollectionJson.js";

export type {
    CollectionsConfigController, DeleteCollectionParams, SaveCollectionParams, UpdateCollectionParams, CollectionsSetupInfo, UpdatePropertiesOrderParams, UpdateKanbanColumnsOrderParams
} from "./types/config_controller.js";
export type {
    CollectionEditorController
} from "./types/collection_editor_controller.js";
export type {
    CollectionEditorPermissions, CollectionEditorPermissionsBuilder
} from "./types/config_permissions.js";
export type {
    PersistedCollection
} from "./types/persisted_collection.js";

export type {
    CollectionInference
} from "./types/collection_inference.js";

export {
    buildCollectionGenerationCallback,
    CollectionGenerationApiError,
    DEFAULT_COLLECTION_GENERATION_ENDPOINT
} from "./api/generateCollectionApi.js";

export type {
    CollectionGenerationCallback,
    GenerateCollectionRequest,
    GenerateCollectionResult,
    CollectionOperation,
    CollectionOperationType,
    BuildCollectionGenerationCallbackProps
} from "./api/generateCollectionApi.js";

export { MissingReferenceWidget } from "./ui/MissingReferenceWidget.js";

export * from "./ui/collection_editor/util.js";

export {
    PropertyForm,
    PropertyFormDialog,
    type PropertyFormProps,
    type OnPropertyChangedParams
} from "./ui/collection_editor/PropertyEditView.js";
