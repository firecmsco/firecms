import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
    cls,
    Typography,
    Chip,
    ChevronRightIcon,
    defaultBorderMixin,
    ResizablePanels,
    FolderIcon,
    Select,
    SelectItem,
    Skeleton,
    Sheet,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@firecms/ui";
import { useLargeLayout } from "@firecms/core";
import { CollectionTree } from "./CollectionTree";
import { DocumentTable } from "./DocumentTable";
import { DocumentPanel } from "./DocumentPanel";
import { AdminDocument } from "./api/admin_api";
import { useAdminApi } from "./api/AdminApiProvider";

// ─── LocalStorage keys for panel sizes ──────────────────────────────────────
const LS_SIDEBAR_SIZE = "firecms_explorer_sidebar_size";
const LS_DETAIL_SIZE = "firecms_explorer_detail_size";

function readStoredSize(key: string, fallback: number): number {
    try {
        const v = localStorage.getItem(key);
        if (v !== null) {
            const n = parseFloat(v);
            if (!isNaN(n) && n > 0 && n < 100) return n;
        }
    } catch { /* ignore */ }
    return fallback;
}

function storeSize(key: string, value: number) {
    try {
        localStorage.setItem(key, String(value));
    } catch { /* ignore */ }
}

// ─────────────────────────────────────────────────────────────────────────────

export function FirestoreExplorer({
    projectId
}: {
    projectId: string;
}) {
    const largeLayout = useLargeLayout();
    const [searchParams, setSearchParams] = useSearchParams();
    const [selectedDocument, setSelectedDocument] = useState<AdminDocument | null>(null);
    const [selectedField, setSelectedField] = useState<string | null>(null);
    const [panelUpdatedDocument, setPanelUpdatedDocument] = useState<AdminDocument | null>(null);
    const [deletedDocumentId, setDeletedDocumentId] = useState<string | null>(null);
    const [databaseId, setDatabaseId] = useState<string | undefined>(undefined);
    const [databases, setDatabases] = useState<string[]>([]);
    const [databasesLoading, setDatabasesLoading] = useState(true);
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
    const adminApi = useAdminApi();

    // ─── Unsaved changes guard ──────────────────────────────────────────────
    const [panelDirty, setPanelDirty] = useState(false);
    const [unsavedDialogOpen, setUnsavedDialogOpen] = useState(false);
    const pendingActionRef = useRef<(() => void) | null>(null);

    const handleDirtyChange = useCallback((dirty: boolean) => {
        setPanelDirty(dirty);
    }, []);

    /**
     * If the panel has unsaved changes, show a confirmation dialog and stash
     * the action. Otherwise execute the action immediately.
     */
    const guardUnsavedChanges = useCallback((action: () => void) => {
        if (panelDirty) {
            pendingActionRef.current = action;
            setUnsavedDialogOpen(true);
        } else {
            action();
        }
    }, [panelDirty]);

    const handleUnsavedDiscard = useCallback(() => {
        setUnsavedDialogOpen(false);
        setPanelDirty(false);
        const action = pendingActionRef.current;
        pendingActionRef.current = null;
        action?.();
    }, []);

    const handleUnsavedCancel = useCallback(() => {
        setUnsavedDialogOpen(false);
        pendingActionRef.current = null;
    }, []);

    // Fetch available databases, then pick the first one
    useEffect(() => {
        setDatabaseId(undefined);
        setDatabasesLoading(true);
        adminApi.listDatabases(projectId)
            .then(({ databases: dbs }) => {
                setDatabases(dbs);
                if (dbs.length > 0) {
                    setDatabaseId(dbs[0]);
                }
            })
            .catch(() => {
                setDatabases(["(default)"]);
                setDatabaseId("(default)");
            })
            .finally(() => {
                setDatabasesLoading(false);
            });
    }, [projectId]);

    // ─── URL-synced state ────────────────────────────────────────────────────
    const selectedPath = searchParams.get("path") || null;
    const selectedDocId = searchParams.get("doc") || null;

    // Restore document from URL on mount
    const restoredRef = useRef(false);
    useEffect(() => {
        if (restoredRef.current || !selectedPath || !selectedDocId) return;
        restoredRef.current = true;
        adminApi
            .getDocument(projectId, selectedPath, selectedDocId, databaseId)
            .then(doc => setSelectedDocument(doc))
            .catch(() => {
                // Document not found or error, just ignore
            });
    }, [selectedPath, selectedDocId, projectId, databaseId, adminApi]);

    // Sync selectedDocument when URL changes (e.g. browser back button)
    useEffect(() => {
        if (!selectedDocId && selectedDocument) {
            setSelectedDocument(null);
            setSelectedField(null);
        }
    }, [selectedDocId, selectedDocument]);

    const doSetSelectedPath = useCallback((path: string | null) => {
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            if (path) {
                next.set("path", path);
            } else {
                next.delete("path");
            }
            next.delete("doc");
            return next;
        }, { replace: true });
        setSelectedDocument(null);
        setSelectedField(null);
        // Auto-close the mobile drawer when a path is selected
        if (!largeLayout) {
            setMobileDrawerOpen(false);
        }
    }, [setSearchParams, largeLayout]);

    const setSelectedPath = useCallback((path: string | null) => {
        guardUnsavedChanges(() => doSetSelectedPath(path));
    }, [guardUnsavedChanges, doSetSelectedPath]);

    const doDocumentSelect = useCallback((doc: AdminDocument, field?: string) => {
        setSelectedDocument(doc);
        setSelectedField(field || null);
        // Push a new history entry so back button closes the doc
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            next.set("doc", doc.id);
            return next;
        }); // no { replace: true } → pushes new entry
    }, [setSearchParams]);

    const handleDocumentSelect = useCallback((doc: AdminDocument, field?: string) => {
        // Don't re-guard if selecting the same document
        if (selectedDocument?.id === doc.id) {
            doDocumentSelect(doc, field);
            return;
        }
        guardUnsavedChanges(() => doDocumentSelect(doc, field));
    }, [selectedDocument, guardUnsavedChanges, doDocumentSelect]);

    const doDocumentClose = useCallback(() => {
        setSelectedDocument(null);
        setSelectedField(null);
        // Replace current entry to remove doc param
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            next.delete("doc");
            return next;
        }, { replace: true });
    }, [setSearchParams]);

    const handleDocumentClose = useCallback(() => {
        guardUnsavedChanges(() => doDocumentClose());
    }, [guardUnsavedChanges, doDocumentClose]);

    const handleDocumentDeleted = useCallback(() => {
        if (selectedDocument) {
            setDeletedDocumentId(selectedDocument.id);
        }
        // Bypass the unsaved-changes guard — the document is gone
        doDocumentClose();
    }, [selectedDocument, doDocumentClose]);

    const handleNavigateToSubcollection = useCallback((subPath: string) => {
        setSelectedPath(subPath);
    }, [setSelectedPath]);

    const handleNavigateToDocument = useCallback((collectionPath: string, docId: string) => {
        adminApi
            .getDocument(projectId, collectionPath, docId, databaseId)
            .then(doc => {
                setSelectedDocument(doc);
                setSearchParams(prev => {
                    const next = new URLSearchParams(prev);
                    next.set("path", collectionPath);
                    next.set("doc", doc.id);
                    return next;
                });
                // Close mobile drawer after navigation
                if (!largeLayout) {
                    setMobileDrawerOpen(false);
                }
            })
            .catch(() => {
                console.error("Could not load document", docId);
            });
    }, [projectId, databaseId, adminApi, setSearchParams, largeLayout]);

    // Panel sizes persisted in localStorage
    const [sidebarSize, setSidebarSizeState] = useState(() => readStoredSize(LS_SIDEBAR_SIZE, 18));
    const [detailSize, setDetailSizeState] = useState(() => readStoredSize(LS_DETAIL_SIZE, 35));

    const setSidebarSize = useCallback((v: number) => {
        setSidebarSizeState(v);
        storeSize(LS_SIDEBAR_SIZE, v);
    }, []);

    const setDetailSize = useCallback((v: number) => {
        setDetailSizeState(v);
        storeSize(LS_DETAIL_SIZE, v);
    }, []);

    const breadcrumbParts = useMemo(
        () => selectedPath?.split("/").filter(Boolean) ?? [],
        [selectedPath]
    );

    const handleBreadcrumbClick = useCallback((index: number) => {
        if (index % 2 === 0) {
            const newPath = breadcrumbParts.slice(0, index + 1).join("/");
            setSelectedPath(newPath);
        } else {
            const collectionPath = breadcrumbParts.slice(0, index).join("/");
            const docId = breadcrumbParts[index];
            handleNavigateToDocument(collectionPath, docId);
        }
    }, [breadcrumbParts, setSelectedPath, handleNavigateToDocument]);

    // ─── Keyboard shortcuts ─────────────────────────────────────────────────
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape" && selectedDocument) {
                // If the unsaved dialog is open, don't close the doc
                if (unsavedDialogOpen) return;
                handleDocumentClose();
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [selectedDocument, handleDocumentClose, unsavedDialogOpen]);

    // ─── Sidebar panel ──────────────────────────────────────────────────────
    // Deterministic skeleton widths for sidebar loading state
    const SIDEBAR_SKELETON_WIDTHS = useMemo(() => [65, 82, 55, 74, 90, 48], []);

    const sidebar = useMemo(() => (
        <div className={cls(
            "flex flex-col h-full overflow-hidden",
            "bg-surface-50 dark:bg-surface-900",
            "border-r",
            defaultBorderMixin
        )}>
            {/* Database selector — only shown when multiple DBs exist (no skeleton to avoid layout shift) */}
            {!databasesLoading && databases.length > 1 && (
                <div className={cls("px-3 pt-3 pb-2 border-b", defaultBorderMixin)}>
                    <Select
                        size="smallest"
                        value={databaseId ?? ""}
                        onValueChange={(v) => {
                            setDatabaseId(v);
                            setSelectedPath(null);
                        }}
                        className="w-full"
                    >
                        {databases.map(db => (
                            <SelectItem key={db} value={db}>{db}</SelectItem>
                        ))}
                    </Select>
                </div>
            )}
            <div className="px-4 pt-3 pb-2">
                <Typography variant="label"
                    className="text-surface-500 dark:text-surface-400 uppercase text-xs tracking-wider">
                    Collections
                </Typography>
            </div>
            <div className="flex-grow overflow-y-auto no-scrollbar px-2 pb-4">
                {databaseId ? (
                    <CollectionTree
                        key={databaseId}
                        projectId={projectId}
                        databaseId={databaseId}
                        selectedPath={selectedPath}
                        selectedDocId={selectedDocId}
                        onSelectCollection={setSelectedPath}
                        onSelectDocument={handleNavigateToDocument}
                    />
                ) : (
                    <div className="space-y-1 p-2">
                        {SIDEBAR_SKELETON_WIDTHS.map((w, i) => (
                            <div key={i} className="flex items-center gap-2 py-1.5 px-3">
                                <Skeleton className="h-4 w-4 rounded flex-shrink-0" />
                                <div style={{ width: `${w}%` }}><Skeleton className="h-4 w-full" /></div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    ), [projectId, databaseId, databases, databasesLoading, selectedPath, setSelectedPath, SIDEBAR_SKELETON_WIDTHS]);

    // ─── Mobile drawer toggle ────────────────────────────────────────────────
    const handleOpenMobileDrawer = useCallback(() => {
        setMobileDrawerOpen(true);
    }, []);

    // ─── Main content (breadcrumbs + table) ─────────────────────────────────
    const mainContent = useMemo(() => (
        <div className="flex flex-col flex-grow min-w-0 overflow-hidden h-full">
            {/* Content area */}
        {selectedPath && databaseId ? (
                <DocumentTable
                    projectId={projectId}
                    path={selectedPath}
                    databaseId={databaseId}
                    onDocumentSelect={handleDocumentSelect}
                    onDocumentDeselect={handleDocumentClose}
                    onNavigateToSubcollection={handleNavigateToSubcollection}
                    breadcrumbParts={breadcrumbParts}
                    onBreadcrumbClick={handleBreadcrumbClick}
                    onRootClick={() => setSelectedPath(null)}
                    updatedDocument={panelUpdatedDocument}
                    deletedDocumentId={deletedDocumentId}
                    onOpenCollectionDrawer={!largeLayout ? handleOpenMobileDrawer : undefined}
                />
            ) : (
                <div className="flex-grow flex items-center justify-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                        <FolderIcon
                            size="large"
                            className="text-surface-300 dark:text-surface-600"
                        />
                        <Typography variant="subtitle2" color="secondary">
                            Select a collection
                        </Typography>
                        {!largeLayout && (
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<FolderIcon size="small" />}
                                onClick={handleOpenMobileDrawer}
                                className="mt-2"
                            >
                                Browse collections
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </div>
    ), [selectedPath, projectId, databaseId, breadcrumbParts, handleBreadcrumbClick, handleDocumentSelect, handleDocumentClose, handleNavigateToSubcollection, setSelectedPath, panelUpdatedDocument, deletedDocumentId, largeLayout, handleOpenMobileDrawer]);

    // ─── Document detail panel (always rendered, visibility toggled) ─────────
    const detailPanel = useMemo(() => (
        <div className={cls("h-full border-l", defaultBorderMixin)}>
            {selectedDocument ? (
                <DocumentPanel
                    key={selectedDocument.id}
                    projectId={projectId}
                    document={selectedDocument}
                    databaseId={databaseId}
                    onClose={handleDocumentClose}
                    onDocumentUpdated={(doc) => {
                        setSelectedDocument(doc);
                        setPanelUpdatedDocument(doc);
                    }}
                    onDocumentDeleted={handleDocumentDeleted}
                    onNavigateToSubcollection={handleNavigateToSubcollection}
                    initialFocusField={selectedField}
                    onDirtyChange={handleDirtyChange}
                />
            ) : (
                <div className="flex items-center justify-center h-full">
                    <Typography variant="body2" color="disabled">
                        Select a document
                    </Typography>
                </div>
            )}
        </div>
    ), [selectedDocument, selectedField, projectId, databaseId, handleDocumentClose, handleDocumentDeleted, handleNavigateToSubcollection]);

    // ─── Layout ─────────────────────────────────────────────────────────────
    // Always render ResizablePanels for the inner content so that toggling
    // the document panel does NOT unmount/remount the DocumentTable.
    const innerContent = useMemo(() => (
        <ResizablePanels
            firstPanel={mainContent}
            secondPanel={detailPanel}
            showSecondPanel={!!selectedDocument}
            panelSizePercent={100 - detailSize}
            onPanelSizeChange={(v) => setDetailSize(100 - v)}
            minPanelSizePx={300}
            orientation="horizontal"
        />
    ), [mainContent, detailPanel, selectedDocument, detailSize, setDetailSize]);

    return (
        <div className={cls(
            "flex h-full w-full bg-white dark:bg-surface-950"
        )}>
            {/* Mobile sidebar drawer */}
            {!largeLayout && (
                <Sheet
                    open={mobileDrawerOpen}
                    onOpenChange={setMobileDrawerOpen}
                    side="left"
                    title="Collections"
                >
                    <div className="w-[280px] h-full">
                        {sidebar}
                    </div>
                </Sheet>
            )}

            <ResizablePanels
                firstPanel={sidebar}
                secondPanel={innerContent}
                showFirstPanel={largeLayout}
                panelSizePercent={sidebarSize}
                onPanelSizeChange={setSidebarSize}
                minPanelSizePx={180}
                orientation="horizontal"
            />

            {/* Unsaved changes confirmation dialog */}
            <Dialog
                open={unsavedDialogOpen}
                onOpenChange={(open) => { if (!open) handleUnsavedCancel(); }}
            >
                <DialogTitle variant="h6">Unsaved changes</DialogTitle>
                <DialogContent>
                    <Typography>
                        You have unsaved changes in this document. Do you want to discard them?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button variant="text" onClick={handleUnsavedCancel} autoFocus>
                        Keep editing
                    </Button>
                    <Button
                        variant="filled"
                        color="primary"
                        onClick={handleUnsavedDiscard}
                    >
                        Discard
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
