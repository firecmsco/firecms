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
    const [databaseId, setDatabaseId] = useState<string | undefined>(undefined);
    const [databases, setDatabases] = useState<string[]>([]);
    const [databasesLoading, setDatabasesLoading] = useState(true);
    const adminApi = useAdminApi();

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
    }, [selectedPath, selectedDocId]);

    // Sync selectedDocument when URL changes (e.g. browser back button)
    useEffect(() => {
        if (!selectedDocId && selectedDocument) {
            setSelectedDocument(null);
        }
    }, [selectedDocId]);

    const setSelectedPath = useCallback((path: string | null) => {
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
    }, [setSearchParams]);

    const handleDocumentSelect = useCallback((doc: AdminDocument) => {
        setSelectedDocument(doc);
        // Push a new history entry so back button closes the doc
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            next.set("doc", doc.id);
            return next;
        }); // no { replace: true } → pushes new entry
    }, [setSearchParams]);

    const handleDocumentClose = useCallback(() => {
        setSelectedDocument(null);
        // Replace current entry to remove doc param
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            next.delete("doc");
            return next;
        }, { replace: true });
    }, [setSearchParams]);

    const handleNavigateToSubcollection = useCallback((subPath: string) => {
        setSelectedPath(subPath);
    }, [setSelectedPath]);

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
        const newPath = breadcrumbParts.slice(0, index + 1).join("/");
        if (index % 2 === 0) {
            setSelectedPath(newPath);
        }
    }, [breadcrumbParts, setSelectedPath]);

    // ─── Keyboard shortcuts ─────────────────────────────────────────────────
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape" && selectedDocument) {
                handleDocumentClose();
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [selectedDocument, handleDocumentClose]);

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
                        onSelectCollection={setSelectedPath}
                    />
                ) : (
                    <div className="space-y-1 p-2">
                        {SIDEBAR_SKELETON_WIDTHS.map((w, i) => (
                            <div key={i} className="flex items-center gap-2 py-1.5 px-3">
                                <Skeleton className="h-4 w-4 rounded flex-shrink-0" />
                                <Skeleton className="h-4" style={{ width: `${w}%` }} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    ), [projectId, databaseId, databases, databasesLoading, selectedPath, setSelectedPath, SIDEBAR_SKELETON_WIDTHS]);

    // ─── Main content (breadcrumbs + table) ─────────────────────────────────
    const mainContent = useMemo(() => (
        <div className="flex flex-col flex-grow min-w-0 overflow-hidden h-full">
            {/* Content area */}
            {selectedPath ? (
                <DocumentTable
                    projectId={projectId}
                    path={selectedPath}
                    databaseId={databaseId}
                    onDocumentSelect={handleDocumentSelect}
                    onNavigateToSubcollection={handleNavigateToSubcollection}
                    breadcrumbParts={breadcrumbParts}
                    onBreadcrumbClick={handleBreadcrumbClick}
                    onRootClick={() => setSelectedPath(null)}
                />
            ) : (
                <div className="flex-grow flex items-center justify-center">
                    <div className="text-center space-y-3">
                        <FolderIcon
                            size="large"
                            className="text-surface-300 dark:text-surface-600 mx-auto"
                        />
                        <Typography variant="subtitle1" color="secondary">
                            Select a collection
                        </Typography>
                        <Typography variant="body2" color="disabled" className="text-sm">
                            Choose a collection from the sidebar to browse documents
                        </Typography>
                    </div>
                </div>
            )}
        </div>
    ), [selectedPath, projectId, databaseId, breadcrumbParts, handleBreadcrumbClick, handleDocumentSelect, handleNavigateToSubcollection, setSelectedPath]);

    // ─── Document detail panel (always rendered, visibility toggled) ─────────
    const detailPanel = useMemo(() => (
        <div className={cls("h-full border-l", defaultBorderMixin)}>
            {selectedDocument ? (
                <DocumentPanel
                    projectId={projectId}
                    document={selectedDocument}
                    databaseId={databaseId}
                    onClose={handleDocumentClose}
                    onDocumentUpdated={(doc) => setSelectedDocument(doc)}
                    onDocumentDeleted={handleDocumentClose}
                    onNavigateToSubcollection={handleNavigateToSubcollection}
                />
            ) : (
                <div className="flex items-center justify-center h-full">
                    <Typography variant="body2" color="disabled">
                        Select a document
                    </Typography>
                </div>
            )}
        </div>
    ), [selectedDocument, projectId, databaseId, handleDocumentClose, handleNavigateToSubcollection]);

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
            <ResizablePanels
                firstPanel={sidebar}
                secondPanel={innerContent}
                showFirstPanel={largeLayout}
                panelSizePercent={sidebarSize}
                onPanelSizeChange={setSidebarSize}
                minPanelSizePx={180}
                orientation="horizontal"
            />
        </div>
    );
}
