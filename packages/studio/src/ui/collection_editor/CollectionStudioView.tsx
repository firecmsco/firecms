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
    Tooltip
} from "@firecms/ui";
import { useSnackbarController } from "@firecms/core";
import { CollectionEditorDialogProps } from "./CollectionEditorDialog";
import { AIModifiedPathsProvider } from "./AIModifiedPathsContext";
import { CollectionEditor } from "./CollectionEditorDialog";
import { useNavigate } from "react-router-dom";
import { useCMSUrlController } from "@firecms/core";

export type CollectionStudioViewProps = Omit<CollectionEditorDialogProps, "open" | "isNewCollection" | "editedCollectionId" | "handleClose" | "handleCancel"> & {
    collectionId?: string | "new";
};

export function CollectionStudioView({ collectionId, ...props }: CollectionStudioViewProps) {
    const snackbarController = useSnackbarController();
    const navigate = useNavigate();
    const urlController = useCMSUrlController();

    // Form state from the editor
    const [formDirty, setFormDirty] = useState<boolean>(false);

    // Map collectionId from URL params if missing? We can pass it directly.
    const activeCollectionId = collectionId;

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
                        handleCancel={() => navigate(urlController.buildCMSUrlPath("/"))}
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
            </AIModifiedPathsProvider>
        </div>
    );
}
