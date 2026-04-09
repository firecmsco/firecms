import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    cls,
    defaultBorderMixin,
    ResizablePanels,
    Typography,
    IconButton,
    AddIcon,
    StorageIcon,
} from "@rebasepro/ui";
import { useUrlController, IconForView } from "@rebasepro/core";
import { CollectionsConfigController } from "../../types/config_controller";
import { CollectionStudioView } from "./CollectionStudioView";

export interface CollectionsStudioViewProps {
    configController: CollectionsConfigController;
}

export function CollectionsStudioView({ configController }: CollectionsStudioViewProps) {
    const navigate = useNavigate();
    const urlController = useUrlController();
    const location = useLocation();

    // Determine the active collection from the URL segment after "schema/"
    const basePath = urlController.buildAppUrlPath("schema");
    const relativePath = location.pathname.replace(basePath, "").replace(/^\//, "");

    // The collectionId could be "new", empty (no selection), or a collection slug
    const activeCollectionId = relativePath.split("/")[0] || undefined;

    const [sidebarSize, setSidebarSize] = useState(() => {
        try {
            const saved = localStorage.getItem("rebase_collections_editor_sidebar_size");
            return saved !== null ? parseFloat(saved) : 25;
        } catch (e) {
            return 25;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem("rebase_collections_editor_sidebar_size", sidebarSize.toString());
        } catch (e) { }
    }, [sidebarSize]);

    const collections = configController.collections || [];

    return (
        <div className="flex h-full w-full bg-white dark:bg-surface-950 overflow-hidden text-text-primary dark:text-text-primary-dark">
            <ResizablePanels
                orientation="horizontal"
                panelSizePercent={sidebarSize}
                onPanelSizeChange={setSidebarSize}
                minPanelSizePx={220}
                firstPanel={
                    <div className={cls("flex flex-col h-full w-full bg-white dark:bg-surface-950 border-r", defaultBorderMixin)}>
                        <div className={cls("flex items-center justify-between px-3 py-2 border-b bg-surface-50 dark:bg-surface-900 min-h-[48px]", defaultBorderMixin)}>
                            <Typography variant="caption" className="font-bold uppercase tracking-wider text-text-disabled dark:text-text-disabled-dark">
                                Collections
                            </Typography>
                            <IconButton
                                size="small"
                                onClick={() => navigate(urlController.buildAppUrlPath("schema/new"))}
                                className={activeCollectionId === "new" ? "text-primary dark:text-primary-dark" : "text-text-secondary dark:text-text-secondary-dark"}
                            >
                                <AddIcon size="small" />
                            </IconButton>
                        </div>

                        <div className="flex-grow overflow-y-auto w-full no-scrollbar p-2 space-y-0.5">
                            {collections.length === 0 && (
                                <div className="p-4 text-center">
                                    <Typography variant="caption" className="text-text-disabled dark:text-text-disabled-dark italic">
                                        No collections yet.
                                    </Typography>
                                </div>
                            )}
                            {collections.map((collection) => {
                                const collectionKey = collection.slug || collection.dbPath;
                                const isSelected = activeCollectionId === collectionKey;
                                return (
                                    <div
                                        key={collectionKey}
                                        onClick={() => navigate(urlController.buildAppUrlPath(`schema/${collectionKey}`))}
                                        className={cls(
                                            "flex items-center gap-3 px-3 py-2 cursor-pointer rounded-md text-sm transition-colors",
                                            isSelected
                                                ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light"
                                                : "hover:bg-surface-100 dark:hover:bg-surface-800 text-text-secondary dark:text-text-secondary-dark"
                                        )}
                                    >
                                        <IconForView collectionOrView={collection} size={18} className={cls(
                                            isSelected
                                                ? "text-primary dark:text-primary-light"
                                                : "text-text-secondary dark:text-text-secondary-dark"
                                        )} />
                                        <span className="truncate flex-1">
                                            {collection.name || collection.slug || collection.dbPath}
                                        </span>
                                    </div>
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
                                <StorageIcon className="opacity-20 mb-4 h-16 w-16" />
                                <Typography variant="body1">Select a collection or create a new one to start editing.</Typography>
                            </div>
                        )}
                    </div>
                }
            />
        </div>
    );
}
