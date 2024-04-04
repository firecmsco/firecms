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
    editableProperty, removeNonEditableProperties
} from "./utils/entities";
export * from "./utils/collections";

export type {
    CollectionsConfigController, DeleteCollectionParams, SaveCollectionParams, UpdateCollectionParams
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

export { MissingReferenceWidget } from "./ui/MissingReferenceWidget";

export * from "./ui/collection_editor/util";
