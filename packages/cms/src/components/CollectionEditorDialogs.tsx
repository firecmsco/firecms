import React from "react";
import { useCollectionEditorDialogsState } from "../collection_editor/CollectionEditorDialogsContext";
import { CollectionEditorDialog } from "../collection_editor/ui/collection_editor/CollectionEditorDialog";
import { PropertyFormDialog } from "../collection_editor/ui/collection_editor/PropertyEditView";

/**
 * Renders the CollectionEditorDialog and PropertyFormDialog inside
 * the RebaseShell tree where CMS-internal contexts
 * (CollectionRegistryContext, NavigationStateContext, UrlContext)
 * are available.
 *
 * The dialog state (open/close, props) is managed by ConfigControllerProvider
 * (a root-scope plugin provider that wraps the shell) and exposed via
 * CollectionEditorDialogsContext.
 */
export function CollectionEditorDialogs() {
    const state = useCollectionEditorDialogsState();

    if (!state) return null;

    const { collectionDialogProps, propertyDialogProps } = state;

    return (
        <>
            <CollectionEditorDialog
                open={false}
                isNewCollection={false}
                configController={{} as any}
                handleClose={() => {}}
                {...collectionDialogProps}
            />
            <PropertyFormDialog
                open={false}
                existingProperty={false}
                autoOpenTypeSelect={false}
                inArray={false}
                allowDataInference={false}
                propertyConfigs={{}}
                {...propertyDialogProps}
            />
        </>
    );
}
