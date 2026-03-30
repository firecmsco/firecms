import * as React from "react";
import { useState, useMemo, useEffect } from "react";
import {
    cls,
    defaultBorderMixin,
    ResizablePanels,
    Typography,
    Button,
    AddIcon,
    StorageIcon,
} from "@rebasepro/ui";
import { useSnackbarController, useCMSUrlController, useUnsavedChangesDialog, UnsavedChangesDialog } from "@rebasepro/core";
import { CollectionEditorDialogProps } from "./CollectionEditorDialog";
import { AIModifiedPathsProvider } from "./AIModifiedPathsContext";
import { CollectionEditor } from "./CollectionEditorDialog";
import { useNavigate } from "react-router-dom";

export type CollectionStudioViewProps = Omit<CollectionEditorDialogProps, "open" | "isNewCollection" | "editedCollectionId" | "handleClose" | "handleCancel"> & {
    collectionId?: string | "new";
};

export function CollectionStudioView({ collectionId, ...props }: CollectionStudioViewProps) {
    const snackbarController = useSnackbarController();
    const navigate = useNavigate();
    const urlController = useCMSUrlController();

    // Form state from the editor
    const [formDirty, setFormDirty] = useState<boolean>(false);
    const [cancelRequested, setCancelRequested] = useState<boolean>(false);

    const { dialogProps, triggerDialog } = useUnsavedChangesDialog(
        formDirty,
        () => setFormDirty(false)
    );

    // Map collectionId from URL params if missing? We can pass it directly.
    const activeCollectionId = collectionId;

    const handleCancelClick = () => {
        if (!formDirty) {
            navigate(urlController.buildCMSUrlPath("/"));
        } else {
            setCancelRequested(true);
            triggerDialog();
        }
    };

    return (
        <div className="flex-grow flex flex-col h-full w-full bg-white dark:bg-surface-950">
            <AIModifiedPathsProvider>
                {activeCollectionId ? (
                    <CollectionEditor
                        key={activeCollectionId}
                        {...props}
                        fullScreen={true}
                        open={true}
                        isNewCollection={activeCollectionId === "new"}
                        editedCollectionId={activeCollectionId !== "new" ? activeCollectionId : undefined}
                        handleCancel={handleCancelClick}
                        handleClose={(savedCollection) => {
                            setFormDirty(false);
                            if (savedCollection) {
                                snackbarController.open({
                                    type: "success",
                                    message: `Collection ${savedCollection.name || savedCollection.slug || savedCollection.dbPath} saved`
                                });
                                if (activeCollectionId === "new") {
                                    navigate(urlController.buildCMSUrlPath(`s/schema/${savedCollection.slug || savedCollection.dbPath}`));
                                }
                            }
                        }}
                        setFormDirty={setFormDirty}
                    />
                ) : (
                    <div className="flex-grow flex items-center justify-center text-text-disabled h-full">
                        <Typography variant="body2">Select a collection or create a new one</Typography>
                    </div>
                )}
                
                <UnsavedChangesDialog
                    {...dialogProps}
                    handleOk={() => {
                        dialogProps.handleOk();
                        if (cancelRequested) {
                            navigate(urlController.buildCMSUrlPath("/"));
                            setCancelRequested(false);
                        }
                    }}
                    handleCancel={() => {
                        dialogProps.handleCancel();
                        setCancelRequested(false);
                    }}
                />
            </AIModifiedPathsProvider>
        </div>
    );
}
