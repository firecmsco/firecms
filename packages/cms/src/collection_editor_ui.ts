// Collection Editor UI — separate entry point for dynamic import / code splitting.
// This file is the target of dynamic import() calls from CollectionEditorDialogs.tsx
// so that the heavy collection editor UI code is split into its own chunk.

export { CollectionEditorDialog } from "./collection_editor/ui/collection_editor/CollectionEditorDialog";
export type { CollectionEditorDialogProps } from "./collection_editor/ui/collection_editor/CollectionEditorDialog";

export { PropertyFormDialog, PropertyForm } from "./collection_editor/ui/collection_editor/PropertyEditView";
export type { PropertyFormProps, OnPropertyChangedParams } from "./collection_editor/ui/collection_editor/PropertyEditView";

export { CollectionStudioView } from "./collection_editor/ui/collection_editor/CollectionStudioView";
export type { CollectionStudioViewProps } from "./collection_editor/ui/collection_editor/CollectionStudioView";

export { CollectionsStudioView } from "./collection_editor/ui/collection_editor/CollectionsStudioView";
export type { CollectionsStudioViewProps } from "./collection_editor/ui/collection_editor/CollectionsStudioView";
