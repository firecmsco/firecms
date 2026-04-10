import React, { createContext, useContext } from "react";

/**
 * Holds the dialog state + rendering props that ConfigControllerProvider
 * sets and CollectionEditorDialogs reads.
 *
 * This indirection exists because ConfigControllerProvider is a root-scope
 * plugin provider that wraps <RebaseShell>, therefore living ABOVE the CMS
 * context providers (CollectionRegistryContext, NavigationStateContext,
 * UrlContext).  The actual dialog components need those contexts, so they
 * must render inside the shell tree.
 */
export interface CollectionEditorDialogsState {
    /** Props for the active CollectionEditorDialog, or undefined when closed. */
    collectionDialogProps: Record<string, any> | undefined;
    /** Props for the active PropertyFormDialog, or undefined when closed. */
    propertyDialogProps: Record<string, any> | undefined;
}

export const CollectionEditorDialogsContext =
    createContext<CollectionEditorDialogsState | undefined>(undefined);

export function useCollectionEditorDialogsState(): CollectionEditorDialogsState | undefined {
    return useContext(CollectionEditorDialogsContext);
}
