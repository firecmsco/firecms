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
import { useCollectionRegistryController, useSnackbarController } from "@firecms/core";
import { CollectionEditorDialogProps } from "./CollectionEditorDialog";
import { AIModifiedPathsProvider } from "./AIModifiedPathsContext";
import { CollectionEditor } from "./CollectionEditorDialog";
import { UnsavedChangesDialog } from "./UnsavedChangesDialog";

export type CollectionStudioViewProps = Omit<CollectionEditorDialogProps, "open" | "isNewCollection" | "editedCollectionId">;

export function CollectionStudioView(props: CollectionStudioViewProps) {
    const collectionRegistry = useCollectionRegistryController();
    const snackbarController = useSnackbarController();

    const [sidebarSize, setSidebarSize] = useState(() => {
        try {
            const saved = localStorage.getItem("firecms_collection_editor_sidebar_size");
            return saved !== null ? parseFloat(saved) : 20;
        } catch (e) {
            return 20;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem("firecms_collection_editor_sidebar_size", sidebarSize.toString());
        } catch (e) { }
    }, [sidebarSize]);

    const collections = collectionRegistry.collections ?? [];
    const sortedCollections = useMemo(() => {
        return [...collections].sort((a, b) => (a.name || a.slug || a.dbPath || "").localeCompare(b.name || b.slug || b.dbPath || ""));
    }, [collections]);

    // Track the currently selected collection id, or "new" if creating one
    const [selectedCollectionId, setSelectedCollectionId] = useState<string | "new" | null>(null);

    // Form state from the editor
    const [formDirty, setFormDirty] = useState<boolean>(false);
    const [unsavedChangesDialogOpen, setUnsavedChangesDialogOpen] = useState<boolean>(false);
    const [pendingSelection, setPendingSelection] = useState<string | "new" | null>(null);

    // Initial selection
    useEffect(() => {
        if (!selectedCollectionId && sortedCollections.length > 0) {
            setSelectedCollectionId(sortedCollections[0].slug || sortedCollections[0].dbPath);
        }
    }, [sortedCollections, selectedCollectionId]);

    const requestSelectionChange = (newSelection: string | "new" | null) => {
        if (selectedCollectionId === newSelection) return;

        if (formDirty) {
            setPendingSelection(newSelection);
            setUnsavedChangesDialogOpen(true);
        } else {
            setSelectedCollectionId(newSelection);
        }
    };

    const handleCancelUnsaved = () => {
        setUnsavedChangesDialogOpen(false);
        setPendingSelection(null);
    };

    const handleDiscardUnsaved = () => {
        setFormDirty(false);
        setUnsavedChangesDialogOpen(false);
        setSelectedCollectionId(pendingSelection);
        setPendingSelection(null);
    };

    return (
        <div className="flex h-full w-full bg-white dark:bg-surface-950 overflow-hidden text-text-primary dark:text-text-primary-dark">
            <AIModifiedPathsProvider>
                <ResizablePanels
                    orientation="horizontal"
                    panelSizePercent={sidebarSize}
                    onPanelSizeChange={setSidebarSize}
                    minPanelSizePx={220}
                    firstPanel={
                        <div className={cls("flex flex-col h-full w-full bg-surface-50 dark:bg-surface-900 border-r", defaultBorderMixin)}>
                            <div className={cls("px-4 py-3 border-b flex flex-col gap-2", defaultBorderMixin)}>
                                <div className="flex items-center justify-between">
                                    <Typography variant="subtitle1" className="flex items-center gap-2">
                                        <StorageIcon size="small" />
                                        Collections
                                    </Typography>
                                    <Tooltip title="Create new collection">
                                        <Button
                                            size="small"
                                            variant="text"
                                            onClick={() => requestSelectionChange("new")}
                                            className={cls(
                                                selectedCollectionId === "new" ? "text-primary" : "text-text-secondary"
                                            )}
                                        >
                                            <AddIcon size="small" />
                                        </Button>
                                    </Tooltip>
                                </div>
                            </div>

                            <div className="flex-grow overflow-y-auto w-full no-scrollbar px-2 py-4 space-y-1">
                                {sortedCollections.length === 0 ? (
                                    <div className="p-4 text-center text-text-disabled">
                                        <Typography variant="body2">No collections found</Typography>
                                    </div>
                                ) : (
                                    sortedCollections.map((col) => {
                                        const key = col.slug || col.dbPath;
                                        const isSelected = selectedCollectionId === key;
                                        return (
                                            <div
                                                key={key}
                                                className={cls(
                                                    "w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between group cursor-pointer",
                                                    isSelected
                                                        ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light font-medium"
                                                        : "hover:bg-surface-200 dark:hover:bg-surface-800 text-text-primary dark:text-text-primary-dark"
                                                )}
                                                onClick={() => requestSelectionChange(key)}
                                            >
                                                <span className="truncate">{col.name || col.slug || col.dbPath}</span>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    }
                    secondPanel={
                        <div className="flex-grow flex flex-col min-w-0 h-full w-full bg-white dark:bg-surface-950 relative">
                            {selectedCollectionId ? (
                                <CollectionEditor
                                    {...props}
                                    open={true}
                                    isNewCollection={selectedCollectionId === "new"}
                                    editedCollectionId={selectedCollectionId !== "new" ? selectedCollectionId : undefined}
                                    handleCancel={() => requestSelectionChange(null)}
                                    handleClose={(savedCollection) => {
                                        setFormDirty(false);
                                        if (savedCollection) {
                                            snackbarController.open({
                                                type: "success",
                                                message: `Collection ${savedCollection.name || savedCollection.slug || savedCollection.dbPath} saved`
                                            });
                                            if (selectedCollectionId === "new") {
                                                setSelectedCollectionId(savedCollection.slug || savedCollection.dbPath);
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
                        </div>
                    }
                />

                <UnsavedChangesDialog
                    open={unsavedChangesDialogOpen}
                    handleOk={handleDiscardUnsaved}
                    handleCancel={handleCancelUnsaved}
                    body={"You have unsaved changes. Are you sure you want to discard them and switch views?"}
                />
            </AIModifiedPathsProvider>
        </div>
    );
}
