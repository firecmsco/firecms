import React, { lazy, Suspense } from "react";
import { useCollectionEditorDialogsState } from "../collection_editor/CollectionEditorDialogsContext";

// Dynamic imports targeting the separate collection_editor_ui entry point.
// This ensures the heavy editor UI lands in its own chunk and is only fetched
// when a dialog is actually opened.
const CollectionEditorDialog = lazy(() =>
    import("../collection_editor/ui/collection_editor/CollectionEditorDialog")
        .then(m => ({ default: m.CollectionEditorDialog }))
);

const PropertyFormDialog = lazy(() =>
    import("../collection_editor/ui/collection_editor/PropertyEditView")
        .then(m => ({ default: m.PropertyFormDialog }))
);

/**
 * Renders the CollectionEditorDialog and PropertyFormDialog inside
 * the RebaseShell tree where CMS-internal contexts
 * (CollectionRegistryContext, NavigationStateContext, UrlContext)
 * are available.
 *
 * Both dialog components are loaded dynamically via React.lazy so that
 * production CMS bundles that never open the collection editor don't pay
 * the download/parse cost up-front.
 *
 * The dialog state (open/close, props) is managed by ConfigControllerProvider
 * (a root-scope plugin provider that wraps the shell) and exposed via
 * CollectionEditorDialogsContext.
 */
export function CollectionEditorDialogs() {
    const state = useCollectionEditorDialogsState();

    if (!state) return null;

    const { collectionDialogProps, propertyDialogProps } = state;

    // Don't even mount the Suspense boundary until a dialog is actually open.
    const hasOpenDialog =
        collectionDialogProps?.open || propertyDialogProps?.open;

    if (!hasOpenDialog) return null;

    return (
        <Suspense fallback={null}>
            {collectionDialogProps?.open && (
                <CollectionEditorDialog
                    open={false}
                    isNewCollection={false}
                    configController={{} as any}
                    handleClose={() => {}}
                    {...collectionDialogProps}
                />
            )}
            {propertyDialogProps?.open && (
                <PropertyFormDialog
                    open={false}
                    existingProperty={false}
                    autoOpenTypeSelect={false}
                    inArray={false}
                    allowDataInference={false}
                    propertyConfigs={{}}
                    {...propertyDialogProps}
                />
            )}
        </Suspense>
    );
}
