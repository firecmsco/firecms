import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
    cls,
    defaultBorderMixin,
    ResizablePanels,
    Typography,
    Button,
    AddIcon,
    StorageIcon,
} from "@firecms/ui";
import { useCMSUrlController, useNavigationStateController } from "@firecms/core";
import { CollectionsConfigController } from "../../types/config_controller";
import { CollectionStudioView } from "./CollectionStudioView";

export interface CollectionsStudioViewProps {
    configController: CollectionsConfigController;
}

export function CollectionsStudioView({ configController }: CollectionsStudioViewProps) {
    const navigate = useNavigate();
    const urlController = useCMSUrlController();
    const location = useLocation();

    // Determine the active collection from the URL segment after "schema/"
    const basePath = urlController.buildCMSUrlPath("schema");
    const relativePath = location.pathname.replace(basePath, "").replace(/^\//, "");

    // The collectionId could be "new", empty (no selection), or a collection slug
    const activeCollectionId = relativePath.split("/")[0] || undefined;

    const [sidebarSize, setSidebarSize] = useState(() => {
        try {
            const saved = localStorage.getItem("firecms_collections_editor_sidebar_size");
            return saved !== null ? parseFloat(saved) : 25;
        } catch (e) {
            return 25;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem("firecms_collections_editor_sidebar_size", sidebarSize.toString());
        } catch (e) { }
    }, [sidebarSize]);

    const collections = configController.collections || [];

    return (
        <div className="flex h-full w-full bg-white dark:bg-surface-950 overflow-hidden text-text-primary dark:text-text-primary-dark">
            <ResizablePanels
                orientation="horizontal"
                panelSizePercent={sidebarSize}
                onPanelSizeChange={setSidebarSize}
                minPanelSizePx={260}
                firstPanel={
                    <div className={cls("flex flex-col h-full w-full bg-surface-50 dark:bg-surface-900 border-r", defaultBorderMixin)}>
                        <div className={cls("px-4 py-3 border-b flex justify-between items-center", defaultBorderMixin)}>
                            <div>
                                <Typography variant="subtitle1" className="flex items-center gap-2">
                                    <StorageIcon size="small" />
                                    Schema Editor
                                </Typography>
                                <Typography variant="caption" className="text-text-secondary dark:text-text-secondary-dark mt-1 block">
                                    FireCMS Collections
                                </Typography>
                            </div>
                            <Button
                                size="small"
                                variant="text"
                                onClick={() => navigate(urlController.buildCMSUrlPath("schema/new"))}
                                className={activeCollectionId === "new" ? "text-primary dark:text-primary-dark" : "text-text-secondary dark:text-text-secondary-dark"}
                            >
                                <AddIcon size="small" />
                            </Button>
                        </div>

                        <div className="flex-grow overflow-y-auto w-full no-scrollbar px-2 py-4 space-y-1">
                            {collections.length === 0 && (
                                <Typography variant="caption" className="text-text-disabled mx-2">
                                    No collections yet.
                                </Typography>
                            )}
                            {collections.map((collection) => {
                                const collectionKey = collection.slug || collection.dbPath;
                                const isSelected = activeCollectionId === collectionKey;
                                return (
                                    <button
                                        key={collectionKey}
                                        onClick={() => navigate(urlController.buildCMSUrlPath(`schema/${collectionKey}`))}
                                        className={cls(
                                            "w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between group",
                                            isSelected
                                                ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light"
                                                : "hover:bg-surface-200 dark:hover:bg-surface-800 text-text-secondary dark:text-text-secondary-dark"
                                        )}
                                    >
                                        <span className="truncate flex-1">
                                            {collection.name || collection.slug || collection.dbPath}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                }
                secondPanel={
                    <div className="flex-grow flex flex-col min-w-0 h-full w-full">
                        {/* We use key to force unmount when switching collections, preventing stale state */}
                        {activeCollectionId ? (
                            <CollectionStudioView
                                key={activeCollectionId}
                                configController={configController}
                                collectionId={activeCollectionId}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-text-disabled dark:text-text-disabled-dark">
                                <StorageIcon size="large" className="opacity-20 mb-4 h-16 w-16" />
                                <Typography variant="body1">Select a collection or create a new one to start editing.</Typography>
                            </div>
                        )}
                    </div>
                }
            />
        </div>
    );
}
