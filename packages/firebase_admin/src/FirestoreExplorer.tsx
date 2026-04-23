import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
    cls,
    Typography,
    defaultBorderMixin,
    ResizablePanels,
    FolderIcon,
    ArticleIcon,
    Select,
    SelectItem,
    Skeleton,
    Sheet,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CloseIcon,
    AddIcon,
    Tooltip,
} from "@firecms/ui";
import { useLargeLayout } from "@firecms/core";
import { CollectionTree } from "./CollectionTree";
import { DocumentTable } from "./DocumentTable";
import { DocumentPanel } from "./DocumentPanel";
import { AdminDocument } from "./api/admin_api";
import { useAdminApi } from "./api/AdminApiProvider";
import { DeleteCollectionDialog } from "./DeleteCollectionDialog";
import { AdminJobsPanel } from "./AdminJobsPanel";

// ─── LocalStorage helpers ───────────────────────────────────────────────────
const LS_SIDEBAR_SIZE = "firecms_explorer_sidebar_size";
const LS_DETAIL_SIZE = "firecms_explorer_detail_size";
const LS_TABS_PREFIX = "firecms_explorer_tabs_";

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
    try { localStorage.setItem(key, String(value)); } catch { /* ignore */ }
}

// ─── Tab types ──────────────────────────────────────────────────────────────

interface ExplorerTab {
    id: string;
    path: string;          // current collection path
    docId: string | null;  // selected document ID (null = no doc selected)
}

let _tabId = 0;
function createTab(path: string, docId?: string | null): ExplorerTab {
    return { id: `t${++_tabId}_${Date.now()}`, path, docId: docId ?? null };
}

function readStoredTabs(projectId: string): ExplorerTab[] {
    try {
        const raw = localStorage.getItem(LS_TABS_PREFIX + projectId);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                return parsed.map((item: any) => {
                    if (typeof item === "string") return createTab(item);
                    if (item && typeof item.path === "string")
                        return createTab(item.path, item.docId ?? null);
                    return null;
                }).filter(Boolean) as ExplorerTab[];
            }
        }
    } catch { /* ignore */ }
    return [];
}

function storeTabs(projectId: string, tabs: ExplorerTab[]) {
    try {
        const persistable = tabs.filter(t => t.path);
        localStorage.setItem(LS_TABS_PREFIX + projectId,
            JSON.stringify(persistable.map(t => ({ path: t.path, docId: t.docId }))));
    } catch { /* ignore */ }
}

const TAB_SEGMENT_MAX = 10;

function truncateSegment(s: string): string {
    return s.length > TAB_SEGMENT_MAX ? s.substring(0, TAB_SEGMENT_MAX) + "…" : s;
}

/**
 * Build the tab label segments from a path.
 * Each segment is truncated to TAB_SEGMENT_MAX chars.
 * For deep paths (>3 segments) the middle is collapsed to "…".
 */
interface TabSegment {
    text: string;
    isDoc: boolean; // true if this segment is a document ID (odd index in path)
}

function formatTabSegments(path: string, docId?: string | null): TabSegment[] {
    const parts = path.split("/").filter(Boolean);
    if (docId) parts.push(docId);
    if (parts.length === 0) return [{ text: path, isDoc: false }];

    const toSegment = (p: string, idx: number): TabSegment => ({
        text: truncateSegment(p),
        isDoc: idx % 2 === 1, // odd indices are doc IDs in Firestore paths
    });

    if (parts.length <= 3) return parts.map(toSegment);
    return [
        toSegment(parts[0], 0),
        { text: "…", isDoc: false },
        toSegment(parts[parts.length - 2], parts.length - 2),
        toSegment(parts[parts.length - 1], parts.length - 1),
    ];
}

// ─────────────────────────────────────────────────────────────────────────────

export function FirestoreExplorer({ projectId }: { projectId: string }) {
    const largeLayout = useLargeLayout();
    const [searchParams, setSearchParams] = useSearchParams();
    const [databaseId, setDatabaseId] = useState<string | undefined>(undefined);
    const [databases, setDatabases] = useState<string[]>([]);
    const [databasesLoading, setDatabasesLoading] = useState(true);
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
    const [pitrActive, setPitrActive] = useState(false);
    const [pitrReadTime, setPitrReadTime] = useState<Date | null>(null);
    const adminApi = useAdminApi();

    // ─── Tabs state ─────────────────────────────────────────────────────────
    const [tabs, setTabs] = useState<ExplorerTab[]>(() => readStoredTabs(projectId));
    const [activeTabId, setActiveTabId] = useState<string | null>(null);

    // Derive active tab + selectedPath from tab state (source of truth)
    const activeTab = useMemo(() => tabs.find(t => t.id === activeTabId) ?? null, [tabs, activeTabId]);
    const selectedPath = activeTab?.path ?? null;

    // Per-tab document state: each tab independently tracks its selected document & field
    const [tabDocuments, setTabDocuments] = useState<Map<string, AdminDocument | null>>(new Map());
    const [tabFields, setTabFields] = useState<Map<string, string | null>>(new Map());
    const [panelUpdatedDocument, setPanelUpdatedDocument] = useState<AdminDocument | null>(null);
    const [deletedDocumentId, setDeletedDocumentId] = useState<string | null>(null);

    // Derived: current tab's selected document & field
    const selectedDocument = activeTabId ? (tabDocuments.get(activeTabId) ?? null) : null;
    const selectedField = activeTabId ? (tabFields.get(activeTabId) ?? null) : null;

    // Ref to read current activeTabId without creating callback deps
    const activeTabIdRef = useRef(activeTabId);
    activeTabIdRef.current = activeTabId;

    // Stable helpers — read activeTabId from ref so they never change identity
    const setSelectedDocument = useCallback((doc: AdminDocument | null) => {
        const tabId = activeTabIdRef.current;
        if (!tabId) return;
        setTabDocuments(prev => {
            const next = new Map(prev);
            next.set(tabId, doc);
            return next;
        });
    }, []);

    const setSelectedField = useCallback((field: string | null) => {
        const tabId = activeTabIdRef.current;
        if (!tabId) return;
        setTabFields(prev => {
            const next = new Map(prev);
            next.set(tabId, field);
            return next;
        });
    }, []);

    // Set document for a specific tab (used during tab switch)
    const setTabDocument = useCallback((tabId: string, doc: AdminDocument | null) => {
        setTabDocuments(prev => {
            const next = new Map(prev);
            next.set(tabId, doc);
            return next;
        });
    }, []);

    const setTabField = useCallback((tabId: string, field: string | null) => {
        setTabFields(prev => {
            const next = new Map(prev);
            next.set(tabId, field);
            return next;
        });
    }, []);

    // ─── Per-tab table data cache ───────────────────────────────────────────
    // Stores the fetched AdminDocument[] for each tab so switching back is instant.
    const tabDataCacheRef = useRef<Map<string, AdminDocument[]>>(new Map());

    // Stable callback: DocumentTable notifies us whenever its documents change
    const handleDocumentsChange = useCallback((docs: AdminDocument[]) => {
        const tabId = activeTabIdRef.current;
        if (tabId) {
            tabDataCacheRef.current.set(tabId, docs);
        }
    }, []);

    // Get cached docs for the active tab (passed as initialDocuments to DocumentTable)
    const cachedDocsForActiveTab = activeTabId ? tabDataCacheRef.current.get(activeTabId) : undefined;

    // Persist tabs to localStorage
    useEffect(() => { storeTabs(projectId, tabs); }, [projectId, tabs]);

    // ─── Initialize active tab from URL on first render ─────────────────────
    const initializedRef = useRef(false);
    useEffect(() => {
        if (initializedRef.current) return;
        initializedRef.current = true;
        const urlPath = searchParams.get("path");
        const urlDoc = searchParams.get("doc");
        if (urlPath) {
            let tab = tabs.find(t => t.path === urlPath);
            if (!tab) {
                tab = createTab(urlPath);
                if (urlDoc) tab.docId = urlDoc;
                setTabs(prev => [...prev, tab!]);
            } else if (urlDoc && tab.docId !== urlDoc) {
                tab = { ...tab, docId: urlDoc };
                setTabs(prev => prev.map(t => t.id === tab!.id ? tab! : t));
            }
            setActiveTabId(tab.id);
        }
    }, []); // runs once

    // ─── Fetch missing documents for active tab ─────────────────────────────
    const lastFetchedDocRef = useRef<{ tabId: string, docId: string } | null>(null);

    useEffect(() => {
        if (!activeTabId || !databaseId) return;
        const tab = tabs.find(t => t.id === activeTabId);
        if (!tab || !tab.docId || !tab.path) return;
        
        const currentDoc = tabDocuments.get(activeTabId);
        
        // Prevent infinite fetch loops if doc.id doesn't perfectly match tab.docId
        if (lastFetchedDocRef.current?.tabId === activeTabId && lastFetchedDocRef.current?.docId === tab.docId) {
            return;
        }

        if (!currentDoc || currentDoc.id !== tab.docId) {
            lastFetchedDocRef.current = { tabId: activeTabId, docId: tab.docId };
            adminApi.getDocument(projectId, tab.path, tab.docId, databaseId)
                .then(doc => {
                    setTabDocuments(prev => {
                        const next = new Map(prev);
                        next.set(activeTabId, doc);
                        return next;
                    });
                })
                .catch(() => {
                    // Document not found or error, clear docId from tab
                    setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, docId: null } : t));
                });
        }
    }, [activeTabId, tabs, tabDocuments, adminApi, projectId, databaseId]);

    // ─── Sync URL from tab state ────────────────────────────────────────────
    const syncUrl = useCallback((path: string | null, docId: string | null, replace = true) => {
        queueMicrotask(() => {
            setSearchParams(prev => {
                const next = new URLSearchParams(prev);
                if (path) next.set("path", path); else next.delete("path");
                if (docId) next.set("doc", docId); else next.delete("doc");
                return next;
            }, { replace });
        });
    }, [setSearchParams]);

    // ─── Delete collection state ────────────────────────────────────────────
    const [deleteCollectionPath, setDeleteCollectionPath] = useState<string | null>(null);

    const handleDeleteCollection = useCallback((path: string) => {
        setDeleteCollectionPath(path);
    }, []);

    const handleCollectionDeleted = useCallback((deletedPath: string) => {
        // Close any tabs that point to the deleted collection or a sub-path
        setTabs(prev => {
            const removed = prev.filter(t => t.path.startsWith(deletedPath));
            const remaining = prev.filter(t => !t.path.startsWith(deletedPath));
            // Clean up per-tab state for removed tabs
            if (removed.length > 0) {
                setTabDocuments(prev => {
                    const next = new Map(prev);
                    removed.forEach(t => next.delete(t.id));
                    return next;
                });
                setTabFields(prev => {
                    const next = new Map(prev);
                    removed.forEach(t => next.delete(t.id));
                    return next;
                });
            }
            if (activeTabId && !remaining.find(t => t.id === activeTabId)) {
                // Active tab was closed — switch to the first remaining tab or clear
                if (remaining.length > 0) {
                    setActiveTabId(remaining[0].id);
                    syncUrl(remaining[0].path, null);
                } else {
                    setActiveTabId(null);
                    syncUrl(null, null);
                }
            }
            return remaining;
        });
        setDeleteCollectionPath(null);
    }, [activeTabId, syncUrl]);

    // ─── Unsaved changes guard ──────────────────────────────────────────────
    const [panelDirty, setPanelDirty] = useState(false);
    const [unsavedDialogOpen, setUnsavedDialogOpen] = useState(false);
    const pendingActionRef = useRef<(() => void) | null>(null);

    const handleDirtyChange = useCallback((dirty: boolean) => setPanelDirty(dirty), []);

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

    // ─── Fetch databases ────────────────────────────────────────────────────
    useEffect(() => {
        setDatabaseId(undefined);
        setDatabasesLoading(true);
        adminApi.listDatabases(projectId)
            .then(({ databases: dbs }) => {
                setDatabases(dbs);
                if (dbs.length > 0) setDatabaseId(dbs[0]);
            })
            .catch(() => {
                setDatabases(["(default)"]);
                setDatabaseId("(default)");
            })
            .finally(() => setDatabasesLoading(false));
    }, [projectId]);

    // ─── Restore document from URL on mount ─────────────────────────────────
    const selectedDocId = searchParams.get("doc") || null;
    const restoredRef = useRef(false);
    useEffect(() => {
        if (restoredRef.current || !selectedPath || !selectedDocId) return;
        restoredRef.current = true;
        adminApi
            .getDocument(projectId, selectedPath, selectedDocId, databaseId)
            .then(doc => setSelectedDocument(doc))
            .catch(() => {});
    }, [selectedPath, selectedDocId, projectId, databaseId, adminApi]);

    // ─── Browser Back Detection ───────────────────────────────────────────────
    // If the URL doc param is removed (e.g., user clicks browser Back button),
    // we need to close the document panel.
    const prevDocIdRef = useRef(selectedDocId);
    useEffect(() => {
        if (prevDocIdRef.current !== null && selectedDocId === null) {
            const tabId = activeTabIdRef.current;
            if (tabId) {
                setTabDocuments(prev => {
                    const next = new Map(prev);
                    next.set(tabId, null);
                    return next;
                });
                setTabFields(prev => {
                    const next = new Map(prev);
                    next.set(tabId, null);
                    return next;
                });
                setTabs(prev => prev.map(t => t.id === tabId ? { ...t, docId: null } : t));
            }
        }
        prevDocIdRef.current = selectedDocId;
    }, [selectedDocId]);

    // ─── Tab operations ─────────────────────────────────────────────────────

    /** Open a collection: create a new tab or activate an existing tab with that path */
    const openCollectionTab = useCallback((path: string) => {
        // If the active tab is a blank "New tab", always reuse it (even if another tab has the same path)
        const activeBlank = activeTabId ? tabs.find(t => t.id === activeTabId && !t.path) : null;
        if (activeBlank) {
            setTabs(prev => prev.map(t => t.id === activeBlank.id ? { ...t, path, docId: null } : t));
            setSelectedDocument(null);
            syncUrl(path, null);
        } else {
            // Otherwise, check if the path is already open in a tab and switch to it
            const existing = tabs.find(t => t.path === path);
            if (existing) {
                setActiveTabId(existing.id);
                // Per-tab state is already in memory — just sync the URL
                const existingDoc = tabDocuments.get(existing.id);
                syncUrl(existing.path, existingDoc?.id ?? existing.docId);
            } else {
                const tab = createTab(path);
                setTabs(prev => [...prev, tab]);
                setActiveTabId(tab.id);
                setSelectedDocument(null);
                syncUrl(path, null);
            }
        }
        setSelectedField(null);
        if (!largeLayout) setMobileDrawerOpen(false);
    }, [tabs, activeTabId, syncUrl, largeLayout, tabDocuments]);

    /** Navigate the ACTIVE tab to a new collection path (subcollection / breadcrumb) */
    const navigateActiveTab = useCallback((newPath: string) => {
        if (!activeTabId) {
            openCollectionTab(newPath);
            return;
        }
        setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, path: newPath, docId: null } : t));
        setSelectedDocument(null);
        setSelectedField(null);
        syncUrl(newPath, null);
        if (!largeLayout) setMobileDrawerOpen(false);
    }, [activeTabId, syncUrl, largeLayout, openCollectionTab]);

    /** Switch to a tab by ID — instant, no API calls. */
    const switchToTab = useCallback((tabId: string) => {
        if (tabId === activeTabId) return;
        const tab = tabs.find(t => t.id === tabId);
        if (!tab) return;
        guardUnsavedChanges(() => {
            setActiveTabId(tabId);
            // Sync URL to the target tab's state
            const targetDoc = tabDocuments.get(tabId);
            syncUrl(tab.path, targetDoc?.id ?? tab.docId);
        });
    }, [activeTabId, tabs, guardUnsavedChanges, syncUrl, tabDocuments]);

    /** Close a tab by ID */
    const closeTab = useCallback((tabId: string) => {
        const doClose = () => {
            // Clean up per-tab state
            setTabDocuments(prev => { const next = new Map(prev); next.delete(tabId); return next; });
            setTabFields(prev => { const next = new Map(prev); next.delete(tabId); return next; });
            tabDataCacheRef.current.delete(tabId);
            setTabs(prev => {
                const idx = prev.findIndex(t => t.id === tabId);
                const next = prev.filter(t => t.id !== tabId);
                if (tabId === activeTabId) {
                    if (next.length > 0) {
                        const newIdx = Math.min(idx, next.length - 1);
                        setActiveTabId(next[newIdx].id);
                        syncUrl(next[newIdx].path, null);
                    } else {
                        setActiveTabId(null);
                        syncUrl(null, null);
                    }
                }
                return next;
            });
        };
        if (tabId === activeTabId) {
            guardUnsavedChanges(doClose);
        } else {
            doClose();
        }
    }, [activeTabId, guardUnsavedChanges, syncUrl]);

    /** Create a new blank tab (no collection selected) */
    const addNewTab = useCallback(() => {
        const tab = createTab("");
        setTabs(prev => [...prev, tab]);
        setActiveTabId(tab.id);
        setSelectedDocument(null);
        setSelectedField(null);
        syncUrl(null, null);
    }, [syncUrl]);

    // ─── Wrapper used by sidebar and database change ────────────────────────
    /** Called by sidebar: opens or activates a tab */
    const setSelectedPath = useCallback((path: string | null) => {
        if (path) {
            guardUnsavedChanges(() => openCollectionTab(path));
        } else {
            guardUnsavedChanges(() => {
                setActiveTabId(null);
                setSelectedDocument(null);
                setSelectedField(null);
                syncUrl(null, null);
            });
        }
    }, [guardUnsavedChanges, openCollectionTab, syncUrl]);

    /** Called by breadcrumbs / subcollection navigation: navigates within active tab */
    const handleNavigateToSubcollection = useCallback((subPath: string) => {
        guardUnsavedChanges(() => navigateActiveTab(subPath));
    }, [guardUnsavedChanges, navigateActiveTab]);

    // ─── Document selection ─────────────────────────────────────────────────
    const doDocumentSelect = useCallback((doc: AdminDocument, field?: string) => {
        setSelectedDocument(doc);
        setSelectedField(field || null);
        // Update the active tab's docId
        if (activeTabId) {
            setTabs(prev => prev.map(t =>
                t.id === activeTabId ? { ...t, docId: doc.id } : t
            ));
        }
        syncUrl(selectedPath, doc.id, false);
    }, [syncUrl, selectedPath, activeTabId]);

    const handleDocumentSelect = useCallback((doc: AdminDocument, field?: string) => {
        if (selectedDocument?.id === doc.id) {
            doDocumentSelect(doc, field);
            return;
        }
        guardUnsavedChanges(() => doDocumentSelect(doc, field));
    }, [selectedDocument, guardUnsavedChanges, doDocumentSelect]);

    const doDocumentClose = useCallback(() => {
        setSelectedDocument(null);
        setSelectedField(null);
        // Clear the active tab's docId
        if (activeTabId) {
            setTabs(prev => prev.map(t =>
                t.id === activeTabId ? { ...t, docId: null } : t
            ));
        }
        syncUrl(selectedPath, null);
    }, [syncUrl, selectedPath, activeTabId]);

    const handleDocumentClose = useCallback(() => {
        guardUnsavedChanges(() => doDocumentClose());
    }, [guardUnsavedChanges, doDocumentClose]);

    const handleDocumentDeleted = useCallback(() => {
        if (selectedDocument) setDeletedDocumentId(selectedDocument.id);
        doDocumentClose();
    }, [selectedDocument, doDocumentClose]);

    /** Called from sidebar: find/create a tab for the collection and select the document */
    const handleNavigateToDocument = useCallback((collectionPath: string, docId: string) => {
        adminApi
            .getDocument(projectId, collectionPath, docId, databaseId)
            .then(doc => {
                let tab = tabs.find(t => t.path === collectionPath);
                if (tab) {
                    setActiveTabId(tab.id);
                    setTabs(prev => prev.map(t =>
                        t.id === tab!.id ? { ...t, docId: doc.id } : t
                    ));
                } else {
                    tab = createTab(collectionPath, doc.id);
                    setTabs(prev => [...prev, tab!]);
                    setActiveTabId(tab.id);
                }
                setTabDocument(tab.id, doc);
                syncUrl(collectionPath, doc.id, false);
                if (!largeLayout) setMobileDrawerOpen(false);
            })
            .catch(() => console.error("Could not load document", docId));
    }, [projectId, databaseId, adminApi, tabs, syncUrl, largeLayout, setTabDocument]);


    // ─── Panel sizes ────────────────────────────────────────────────────────
    const [sidebarSize, setSidebarSizeState] = useState(() => readStoredSize(LS_SIDEBAR_SIZE, 18));
    const [detailSize, setDetailSizeState] = useState(() => readStoredSize(LS_DETAIL_SIZE, 35));
    const setSidebarSize = useCallback((v: number) => { setSidebarSizeState(v); storeSize(LS_SIDEBAR_SIZE, v); }, []);
    const setDetailSize = useCallback((v: number) => { setDetailSizeState(v); storeSize(LS_DETAIL_SIZE, v); }, []);

    // ─── Breadcrumbs ────────────────────────────────────────────────────────
    const breadcrumbParts = useMemo(
        () => selectedPath?.split("/").filter(Boolean) ?? [],
        [selectedPath]
    );

    const handleBreadcrumbClick = useCallback((index: number) => {
        if (index % 2 === 0) {
            // Collection — navigate within active tab
            const newPath = breadcrumbParts.slice(0, index + 1).join("/");
            guardUnsavedChanges(() => navigateActiveTab(newPath));
        } else {
            // Document — navigate within active tab to its parent collection + select it
            const collectionPath = breadcrumbParts.slice(0, index).join("/");
            const docId = breadcrumbParts[index];
            guardUnsavedChanges(() => {
                if (activeTabId) {
                    setTabs(prev => prev.map(t =>
                        t.id === activeTabId ? { ...t, path: collectionPath, docId } : t
                    ));
                }
                adminApi.getDocument(projectId, collectionPath, docId, databaseId)
                    .then(doc => {
                        setSelectedDocument(doc);
                        syncUrl(collectionPath, doc.id, false);
                    })
                    .catch(() => {});
            });
        }
    }, [breadcrumbParts, guardUnsavedChanges, navigateActiveTab, activeTabId, adminApi, projectId, databaseId, syncUrl]);



    // ─── Keyboard shortcuts ─────────────────────────────────────────────────
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape" && selectedDocument) {
                if (unsavedDialogOpen) return;
                handleDocumentClose();
            }
            if ((e.metaKey || e.ctrlKey) && e.key === "w" && activeTabId) {
                e.preventDefault();
                closeTab(activeTabId);
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [selectedDocument, handleDocumentClose, unsavedDialogOpen, activeTabId, closeTab]);

    // ─── Sidebar ────────────────────────────────────────────────────────────
    const SIDEBAR_SKELETON_WIDTHS = useMemo(() => [65, 82, 55, 74, 90, 48], []);

    const sidebar = useMemo(() => (
        <div className={cls(
            "flex flex-col h-full overflow-hidden",
            "bg-surface-50 dark:bg-surface-900",
            "border-r", defaultBorderMixin
        )}>
            {!databasesLoading && databases.length > 1 && (
                <div className={cls("px-3 pt-3 pb-2 border-b", defaultBorderMixin)}>
                    <Select size="smallest" value={databaseId ?? ""}
                        onValueChange={(v) => { setDatabaseId(v); setTabs([]); setActiveTabId(null); syncUrl(null, null); }}
                        className="w-full">
                        {databases.map(db => (<SelectItem key={db} value={db}>{db}</SelectItem>))}
                    </Select>
                </div>
            )}
            <div className="px-4 pt-3 pb-2">
                <Typography variant="label" className="text-surface-500 dark:text-surface-400 uppercase text-xs tracking-wider">
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
                        onDeleteCollection={handleDeleteCollection}
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

    // ─── Mobile drawer ──────────────────────────────────────────────────────
    const handleOpenMobileDrawer = useCallback(() => setMobileDrawerOpen(true), []);

    // ─── Tab bar ────────────────────────────────────────────────────────────
    const tabBar = useMemo(() => {
        return (
            <div className={cls(
                "flex items-stretch overflow-x-auto no-scrollbar",
                "border-b", defaultBorderMixin,
                "bg-surface-50 dark:bg-surface-900",
                "min-h-[34px]",
            )} style={{ scrollbarWidth: "none" }}>
                {tabs.map(tab => {
                    const isActive = tab.id === activeTabId;
                    const segments = tab.path ? formatTabSegments(tab.path, tab.docId) : [{ text: "New tab", isDoc: false }];
                    const lastIsDoc = segments.length > 0 && segments[segments.length - 1].isDoc;
                    const fullPath = tab.path ? (tab.docId ? `${tab.path}/${tab.docId}` : tab.path) : "New tab";
                    return (
                        <Tooltip key={tab.id} title={fullPath} side="bottom">
                            <div
                                className={cls(
                                    "group flex items-center gap-1 pl-3 pr-1 py-1 cursor-pointer",
                                    "border-r text-xs whitespace-nowrap transition-colors select-none",
                                    defaultBorderMixin,
                                    isActive
                                        ? "bg-white dark:bg-surface-950 text-text-primary dark:text-text-primary-dark"
                                        : "text-surface-500 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800"
                                )}
                                onClick={() => switchToTab(tab.id)}
                                onAuxClick={(e) => { if (e.button === 1) { e.preventDefault(); closeTab(tab.id); } }}
                            >
                                {lastIsDoc ? (
                                    <ArticleIcon size="smallest" className={cls(
                                        isActive ? "text-primary" : "text-surface-400 dark:text-surface-500"
                                    )} />
                                ) : (
                                    <FolderIcon size="smallest" className={cls(
                                        isActive ? "text-amber-500 dark:text-amber-400" : "text-surface-400 dark:text-surface-500"
                                    )} />
                                )}
                                {segments.map((seg, i) => (
                                    <React.Fragment key={i}>
                                        {i > 0 && (
                                            <span className="text-[9px] text-surface-300 dark:text-surface-600">/</span>
                                        )}
                                        <span className={cls(
                                            i === segments.length - 1
                                                ? isActive ? "font-medium" : ""
                                                : "text-[10px] text-surface-400 dark:text-surface-500",
                                        )}>
                                            {seg.text}
                                        </span>
                                    </React.Fragment>
                                ))}
                                <button
                                    onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}
                                    className={cls(
                                        "ml-1 w-4 h-4 flex items-center justify-center rounded-sm flex-shrink-0",
                                        "opacity-0 group-hover:opacity-100",
                                        isActive && "opacity-60",
                                        "hover:bg-surface-200 dark:hover:bg-surface-700",
                                        "transition-opacity"
                                    )}
                                >
                                    <CloseIcon size="smallest" />
                                </button>
                            </div>
                        </Tooltip>
                    );
                })}
                <Tooltip title="New tab" side="bottom">
                    <button
                        onClick={addNewTab}
                        className={cls(
                            "flex items-center justify-center w-7 h-7 flex-shrink-0 mx-0.5 self-center",
                            "rounded-sm transition-colors",
                            "text-surface-400 dark:text-surface-500",
                            "hover:text-surface-700 dark:hover:text-surface-300",
                            "hover:bg-surface-100 dark:hover:bg-surface-800",
                        )}
                    >
                        <AddIcon size="smallest" />
                    </button>
                </Tooltip>
                <div className="flex-grow" />
                <div className="flex items-center pr-2">
                    <AdminJobsPanel projectId={projectId} />
                </div>
            </div>
        );
    }, [tabs, activeTabId, switchToTab, closeTab, addNewTab, projectId]);

    // ─── Main content ───────────────────────────────────────────────────────
    // Single DocumentTable — no key prop so it handles path changes internally.
    // Cached data is passed via initialDocuments to avoid re-fetching on tab switch.
    const mainContent = useMemo(() => (
        <div className="flex flex-col flex-grow min-w-0 overflow-hidden h-full">
            {tabBar}
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
                    pitrActive={pitrActive}
                    pitrReadTime={pitrReadTime}
                    onPitrActivate={() => {
                        setPitrActive(true);
                        const t = new Date(Date.now() - 60 * 60 * 1000);
                        t.setSeconds(0, 0);
                        setPitrReadTime(t);
                    }}
                    onPitrDeactivate={() => { setPitrActive(false); setPitrReadTime(null); }}
                    onPitrTimeChange={setPitrReadTime}
                    initialDocuments={cachedDocsForActiveTab}
                    onDocumentsChange={handleDocumentsChange}
                />
            ) : (
                <div className="flex-grow flex items-center justify-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                        <FolderIcon size="large" className="text-surface-300 dark:text-surface-600" />
                        <Typography variant="subtitle2" color="secondary">Select a collection</Typography>
                        {!largeLayout && (
                            <Button variant="outlined" size="small"
                                startIcon={<FolderIcon size="small" />}
                                onClick={handleOpenMobileDrawer} className="mt-2">
                                Browse collections
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </div>
    ), [tabBar, selectedPath, projectId, databaseId, breadcrumbParts, handleBreadcrumbClick,
        handleDocumentSelect, handleDocumentClose, handleNavigateToSubcollection,
        setSelectedPath, panelUpdatedDocument, deletedDocumentId, largeLayout,
        handleOpenMobileDrawer, pitrActive, pitrReadTime, cachedDocsForActiveTab,
        handleDocumentsChange]);

    // ─── Detail panel ───────────────────────────────────────────────────────
    const detailPanel = useMemo(() => (
        <div className={cls("h-full border-l", defaultBorderMixin)}>
            {selectedDocument ? (
                <DocumentPanel
                    key={selectedDocument.id}
                    projectId={projectId}
                    document={selectedDocument}
                    databaseId={databaseId}
                    onClose={handleDocumentClose}
                    onDocumentUpdated={(doc) => { setSelectedDocument(doc); setPanelUpdatedDocument(doc); }}
                    onDocumentDeleted={handleDocumentDeleted}
                    onNavigateToSubcollection={handleNavigateToSubcollection}
                    initialFocusField={selectedField}
                    onDirtyChange={handleDirtyChange}
                />
            ) : (
                <div className="flex items-center justify-center h-full">
                    <Typography variant="body2" color="disabled">Select a document</Typography>
                </div>
            )}
        </div>
    ), [selectedDocument, selectedField, projectId, databaseId, handleDocumentClose,
        handleDocumentDeleted, handleNavigateToSubcollection]);

    // ─── Layout ─────────────────────────────────────────────────────────────
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
        <div className={cls("flex h-full w-full bg-white dark:bg-surface-950")}>
            {!largeLayout && (
                <Sheet open={mobileDrawerOpen} onOpenChange={setMobileDrawerOpen} side="left" title="Collections">
                    <div className="w-[280px] h-full">{sidebar}</div>
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
            <Dialog open={unsavedDialogOpen} onOpenChange={(open) => { if (!open) handleUnsavedCancel(); }}>
                <DialogTitle variant="h6">Unsaved changes</DialogTitle>
                <DialogContent>
                    <Typography>You have unsaved changes in this document. Do you want to discard them?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button variant="text" onClick={handleUnsavedCancel} autoFocus>Keep editing</Button>
                    <Button variant="filled" color="primary" onClick={handleUnsavedDiscard}>Discard</Button>
                </DialogActions>
            </Dialog>
            {deleteCollectionPath && (
                <DeleteCollectionDialog
                    open={!!deleteCollectionPath}
                    collectionPath={deleteCollectionPath}
                    projectId={projectId}
                    databaseId={databaseId}
                    onClose={() => setDeleteCollectionPath(null)}
                    onDeleted={handleCollectionDeleted}
                />
            )}
        </div>
    );
}
