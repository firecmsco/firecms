import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    cls,
    Typography,
    Skeleton,
    Chip,
    IconButton,
    Tooltip,
    Checkbox,
    Button,
    Select,
    SelectItem,
    defaultBorderMixin,
    DeleteIcon,
    RefreshIcon,
    KeyboardTabIcon,
    AddIcon,
    ContentCopyIcon,
    ArrowBackIcon,
    ArrowForwardIcon,
    FilterListIcon,
    ChevronRightIcon,
    MenuIcon,
    EditIcon,
    HistoryIcon,
    Popover,
} from "@firecms/ui";
import {
    useNavigationController,
    useSnackbarController,
    useSideEntityController,
    VirtualTable,
    VirtualTableColumn,
    CellRendererParams,
    OnVirtualTableColumnResizeParams,
    ConfirmationDialog,
    jsonStringifyReplacer,
} from "@firecms/core";
import { useAdminApi } from "./api/AdminApiProvider";
import { AdminDocument } from "./api/admin_api";
import { AddDocumentDialog } from "./AddDocumentDialog";
import { ExportButton } from "./ExportButton";
import { PopoverCellEditor } from "./PopoverCellEditor";
import { FilterBar } from "./FilterBar";
import { PITRToolbar } from "./PITRPanel";
import {
    FilterDef,
    FieldType,
    inferFieldTypes,
    parseFilterValueForApi,
    readPersistedFilters,
    persistFilters,
    getOperatorsForType,
    FILTERABLE_VALUE_TYPES,
} from "./filter_utils";
import { ReferencePreview } from "./ReferenceEditor";
import { isReference, getRefPath } from "./FieldEditor";

// Row shape fed to VirtualTable: the document values plus _doc metadata
type AdminRow = Record<string, any> & {
    _doc: AdminDocument;
    _skeleton?: boolean;
    _skeletonWidths?: number[];
    _selected?: boolean;
};

const PAGE_SIZE_OPTIONS = [25, 50, 100, 200];

// ─── LocalStorage helpers for column config ─────────────────────────────────

const LS_COL_PREFIX = "firecms_admin_cols_";

type ColumnConfig = {
    order: string[];
    widths: Record<string, number>;
};

function readColumnConfig(path: string): ColumnConfig | null {
    try {
        const raw = localStorage.getItem(LS_COL_PREFIX + path);
        if (raw) return JSON.parse(raw);
    } catch { /* ignore */ }
    return null;
}

function storeColumnConfig(path: string, config: ColumnConfig) {
    try {
        localStorage.setItem(LS_COL_PREFIX + path, JSON.stringify(config));
    } catch { /* ignore */ }
}

// ─── Default column widths ──────────────────────────────────────────────────

const ID_COL_WIDTH = 220;
const DEFAULT_COL_WIDTH = 200;

// Pre-computed skeleton widths: [idWidth, ...dataColumnWidths]
// Fixed values avoid Math.random() during render (which causes hydration/re-render issues)
const SKELETON_ROW_WIDTHS: number[][] = [
    [140, 140, 100, 160, 80, 120, 110],
    [120, 120, 80, 140, 100, 90, 130],
    [160, 160, 110, 120, 60, 140, 100],
    [110, 100, 130, 100, 120, 80, 90],
    [150, 130, 90, 150, 70, 110, 120],
    [130, 150, 100, 80, 110, 130, 100],
    [140, 110, 120, 130, 90, 100, 140],
    [120, 140, 80, 110, 100, 120, 80],
    [160, 100, 140, 90, 130, 80, 110],
    [110, 120, 110, 140, 80, 100, 130],
    [150, 80, 130, 120, 110, 140, 90],
    [130, 130, 90, 100, 140, 110, 100],
];

// ─── Type colors ────────────────────────────────────────────────────────────

const TYPE_COLOR_NUMBER = "#0891b2";
const TYPE_COLOR_DATE = "#0d9488";
const TYPE_COLOR_ARRAY = "#c2724a";
const TYPE_COLOR_MAP = "#7c3aed";
const TYPE_COLOR_REF = "#6366f1";

// ─── Cell value rendering ───────────────────────────────────────────────────

function compactPreview(val: any): string {
    if (val === null || val === undefined) return "null";
    if (typeof val === "boolean") return String(val);
    if (typeof val === "number") return String(val);
    if (typeof val === "string") return val.length > 32 ? `"${val.substring(0, 32)}…"` : `"${val}"`;
    if (val instanceof Date || (val && val._seconds !== undefined)) {
        const d = val._seconds ? new Date(val._seconds * 1000) : val;
        return d.toLocaleDateString();
    }
    if (isReference(val)) {
        const p = getRefPath(val);
        return p ? `ref› ${p}` : "ref› (empty)";
    }
    if (Array.isArray(val)) return `[${val.length}]`;
    if (typeof val === "object") return `{${Object.keys(val).length}}`;
    return String(val);
}

/**
 * Returns a colored React node for a value inside an array or map preview.
 * `parentColor` is applied to plain text (strings, nulls); typed values
 * (numbers, dates, refs) get their own specific color.
 */
function coloredCompactPreview(val: any, parentColor: string, key?: number): React.ReactNode {
    if (val === null || val === undefined)
        return <span key={key} style={{ color: parentColor, opacity: 0.6, fontStyle: "italic" }}>null</span>;
    if (typeof val === "boolean")
        return <span key={key} style={{ color: parentColor }}>{String(val)}</span>;
    if (typeof val === "number")
        return <span key={key} style={{ color: TYPE_COLOR_NUMBER, fontFamily: "var(--font-mono, monospace)" }}>{String(val)}</span>;
    if (typeof val === "string") {
        const display = val.length > 32 ? `"${val.substring(0, 32)}…"` : `"${val}"`;
        return <span key={key} className="text-slate-500 dark:text-slate-400">{display}</span>;
    }
    if (val instanceof Date || (val && val._seconds !== undefined)) {
        const d = val._seconds ? new Date(val._seconds * 1000) : val;
        return <span key={key} style={{ color: TYPE_COLOR_DATE }}>{d.toLocaleDateString()}</span>;
    }
    if (isReference(val)) {
        const p = getRefPath(val);
        return <span key={key} style={{ color: TYPE_COLOR_REF }}>{p ? `ref› ${p}` : "ref› (empty)"}</span>;
    }
    if (Array.isArray(val))
        return <span key={key} style={{ color: TYPE_COLOR_ARRAY }}>[{val.length}]</span>;
    if (typeof val === "object")
        return <span key={key} style={{ color: TYPE_COLOR_MAP }}>{`{${Object.keys(val).length}}`}</span>;
    return <span key={key} style={{ color: parentColor }}>{String(val)}</span>;
}

function renderCellValue(value: any): React.ReactNode {
    if (value === null || value === undefined) {
        return <span className="text-surface-400 dark:text-surface-500 italic">null</span>;
    }
    if (typeof value === "boolean") {
        return (
            <Chip size="small" colorScheme={value ? "greenLighter" : "grayLighter"}>
                {String(value)}
            </Chip>
        );
    }
    if (typeof value === "number") {
        return (
            <span style={{ color: TYPE_COLOR_NUMBER, fontFamily: "var(--font-mono, monospace)" }}>
                {String(value)}
            </span>
        );
    }
    
    // We use a high safe limit (1000) so CSS `text-truncate` can handle dynamic sizing 
    // based on column width without crashing the browser on multi-megabyte string payloads.
    if (typeof value === "string") return (
        <span className="text-slate-500 dark:text-slate-400">
            {value.length > 1000 ? value.substring(0, 1000) + "…" : value}
        </span>
    );
    
    if (value instanceof Date || (value && value._seconds !== undefined)) {
        const date = value._seconds ? new Date(value._seconds * 1000) : value;
        return (
            <span style={{ color: "#0d9488" }}>
                {date.toLocaleString()}
            </span>
        );
    }
    // Reference: show rich preview with collection + document ID
    if (isReference(value)) {
        return <ReferencePreview path={getRefPath(value)} />;
    }
    if (Array.isArray(value)) {
        // Build colored React nodes for each array item
        const nodes: React.ReactNode[] = [];
        let charLen = 0;
        let itemCount = 0;
        for (let i = 0; i < value.length; i++) {
            const preview = compactPreview(value[i]);
            charLen += preview.length + 2;
            if (charLen > 120 && nodes.length > 0) break;
            if (nodes.length > 0) nodes.push(<span key={`sep-${i}`} style={{ color: TYPE_COLOR_ARRAY, opacity: 0.5 }}>, </span>);
            nodes.push(coloredCompactPreview(value[i], TYPE_COLOR_ARRAY, i));
            itemCount++;
        }
        const truncated = itemCount < value.length;
        return (
            <span>
                <span style={{ color: TYPE_COLOR_ARRAY, fontWeight: 600 }}>[</span>
                {nodes}{truncated && <span style={{ color: TYPE_COLOR_ARRAY, opacity: 0.5 }}>, …</span>}
                <span style={{ color: TYPE_COLOR_ARRAY, fontWeight: 600 }}>]</span>
            </span>
        );
    }
    if (typeof value === "object") {
        const entries = Object.entries(value);
        // Build colored React nodes for each map entry
        const nodes: React.ReactNode[] = [];
        let charLen = 0;
        let entryCount = 0;
        for (let i = 0; i < entries.length; i++) {
            const [k, v] = entries[i];
            const preview = `${k}: ${compactPreview(v)}`;
            charLen += preview.length + 2;
            if (charLen > 120 && nodes.length > 0) break;
            if (nodes.length > 0) nodes.push(<span key={`sep-${i}`} style={{ color: TYPE_COLOR_MAP, opacity: 0.5 }}>, </span>);
            nodes.push(
                <span key={i}>
                    <span style={{ color: TYPE_COLOR_MAP }}>{k}: </span>
                    {coloredCompactPreview(v, TYPE_COLOR_MAP)}
                </span>
            );
            entryCount++;
        }
        const truncated = entryCount < entries.length;
        return (
            <span>
                <span style={{ color: TYPE_COLOR_MAP, fontWeight: 600 }}>{"{"}</span>
                {nodes}{truncated && <span style={{ color: TYPE_COLOR_MAP, opacity: 0.5 }}>, …</span>}
                <span style={{ color: TYPE_COLOR_MAP, fontWeight: 600 }}>{"}"}</span>
            </span>
        );
    }
    return String(value);
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function DocumentTable({
    projectId,
    path,
    databaseId,
    onDocumentSelect,
    onDocumentDeselect,
    onNavigateToSubcollection,
    breadcrumbParts,
    onBreadcrumbClick,
    onRootClick,
    updatedDocument,
    deletedDocumentId,
    onOpenCollectionDrawer,
    pitrActive,
    pitrReadTime,
    onPitrActivate,
    onPitrDeactivate,
    onPitrTimeChange,
    initialDocuments,
    onDocumentsChange,
}: {
    projectId: string;
    path: string;
    databaseId?: string;
    onDocumentSelect: (doc: AdminDocument, field?: string) => void;
    onDocumentDeselect: () => void;
    onNavigateToSubcollection: (subPath: string) => void;
    breadcrumbParts: string[];
    onBreadcrumbClick: (index: number) => void;
    onRootClick: () => void;
    /** When set, the table patches this document in its local state (used by DocumentPanel save). */
    updatedDocument?: AdminDocument | null;
    /** When set, the table removes this document from its local state (used by DocumentPanel delete). */
    deletedDocumentId?: string | null;
    /** When provided, renders a menu button to open the mobile collection drawer. */
    onOpenCollectionDrawer?: () => void;
    /** PITR: whether time-travel mode is active */
    pitrActive?: boolean;
    /** PITR: the read time for time-travel mode */
    pitrReadTime?: Date | null;
    /** PITR: activate time-travel mode */
    onPitrActivate?: () => void;
    /** PITR: deactivate time-travel mode */
    onPitrDeactivate?: () => void;
    /** PITR: change the read time */
    onPitrTimeChange?: (time: Date) => void;
    /** Pre-cached documents to use instead of fetching on mount */
    initialDocuments?: AdminDocument[];
    /** Called whenever the documents array changes (for external caching) */
    onDocumentsChange?: (docs: AdminDocument[]) => void;
}) {
    const adminApi = useAdminApi();
    const [documents, setDocumentsRaw] = useState<AdminDocument[]>(initialDocuments ?? []);
    const onDocumentsChangeRef = useRef(onDocumentsChange);
    onDocumentsChangeRef.current = onDocumentsChange;
    // Wrapper that notifies parent whenever docs change
    const setDocuments = useCallback((update: AdminDocument[] | ((prev: AdminDocument[]) => AdminDocument[])) => {
        setDocumentsRaw(prev => {
            const next = typeof update === "function" ? update(prev) : update;
            // Notify parent asynchronously to avoid setState-during-render
            if (onDocumentsChangeRef.current) {
                queueMicrotask(() => onDocumentsChangeRef.current?.(next));
            }
            return next;
        });
    }, []);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [count, setCount] = useState<number | undefined>(undefined);
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [duplicateData, setDuplicateData] = useState<Record<string, any> | undefined>(undefined);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [pitrError, setPitrError] = useState<string | null>(null);

    // Track whether we're loading a new page (to show skeletons)
    const [pageLoading, setPageLoading] = useState(false);

    // Ref to the VirtualTable wrapper for scroll control
    const tableWrapperRef = useRef<HTMLDivElement>(null);

    // Inline editing state
    const [editingCell, setEditingCell] = useState<{ id: string; key: string } | null>(null);

    // Timer ref to distinguish single-click from double-click.
    // On click we delay the single-click action; if a dblclick fires before the
    // timer expires we cancel the single-click and run the double-click action.
    const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Refs for volatile state read by cellRenderer so the function stays stable
    const selectedIdsRef = useRef(selectedIds);
    selectedIdsRef.current = selectedIds;
    const copiedIdRef = useRef(copiedId);
    copiedIdRef.current = copiedId;
    const editingCellRef = useRef(editingCell);
    editingCellRef.current = editingCell;
    const onDocumentSelectRef = useRef(onDocumentSelect);
    onDocumentSelectRef.current = onDocumentSelect;
    const onDocumentDeselectRef = useRef(onDocumentDeselect);
    onDocumentDeselectRef.current = onDocumentDeselect;

    // Pagination
    const [pageSize, setPageSize] = useState(50);
    const [cursorStack, setCursorStack] = useState<string[]>([]);
    const [hasMore, setHasMore] = useState(false);
    const currentPage = cursorStack.length;

    // Sorting
    const [orderBy, setOrderBy] = useState<string | undefined>(undefined);
    const [orderDirection, setOrderDirection] = useState<"asc" | "desc">("asc");

    // Filtering
    const [filters, setFilters] = useState<FilterDef[]>([]);
    const [showFilterBar, setShowFilterBar] = useState(false);

    // Infer field types from loaded documents
    const fieldTypes = useMemo(() => inferFieldTypes(documents), [documents]);

    // Track loaded path for smart loading
    const loadedPathRef = useRef<string | null>(null);

    // CMS bridge
    const navigationController = useNavigationController();
    const sideEntityController = useSideEntityController();
    const snackbar = useSnackbarController();

    const cmsCollection = useMemo(() => {
        try {
            return navigationController.getCollection(path);
        } catch {
            return undefined;
        }
    }, [path, navigationController]);

    // Clean up click timer on unmount
    useEffect(() => {
        return () => {
            if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
        };
    }, []);

    // Patch internal documents when a document is updated externally (e.g. from DocumentPanel)
    useEffect(() => {
        if (updatedDocument) {
            setDocuments(prev => prev.map(d =>
                d.id === updatedDocument.id ? updatedDocument : d
            ));
        }
    }, [updatedDocument]);

    // Remove document from local state when it is deleted externally (e.g. from DocumentPanel)
    useEffect(() => {
        if (deletedDocumentId) {
            setDocuments(prev => prev.filter(d => d.id !== deletedDocumentId));
            setSelectedIds(prev => {
                const next = new Set(prev);
                next.delete(deletedDocumentId);
                return next;
            });
            setCount(prev => (prev !== undefined && prev > 0) ? prev - 1 : prev);
        }
    }, [deletedDocumentId]);

    // ─── Column config (persisted) ──────────────────────────────────────────
    const [columnConfig, setColumnConfig] = useState<ColumnConfig | null>(null);

    // Load persisted column config when path changes
    useEffect(() => {
        setColumnConfig(readColumnConfig(path));
    }, [path]);

    // Derive field keys from document data, ordered by CMS properties when available
    const fieldKeys: string[] = useMemo(() => {
        // Collect all field keys present in the actual document data
        const fieldSet = new Set<string>();
        for (const doc of documents) {
            if (doc.values) {
                Object.keys(doc.values).forEach(k => fieldSet.add(k));
            }
        }
        const documentFields = Array.from(fieldSet);

        // If a CMS collection is available, use its property ordering as the base
        if (cmsCollection) {
            const cmsOrder: string[] = cmsCollection.propertiesOrder
                ?? Object.keys(cmsCollection.properties ?? {});
            // Filter CMS order to only fields present in documents, then append extra document fields
            const cmsSet = new Set(cmsOrder);
            const orderedFromCms = cmsOrder.filter(k => fieldSet.has(k));
            const extraFields = documentFields.filter(k => !cmsSet.has(k)).sort();
            return [...orderedFromCms, ...extraFields];
        }

        return documentFields.sort();
    }, [documents, cmsCollection]);

    // ─── Filter handlers (must be before vtColumns so AdditionalHeaderWidget can reference) ──

    // Track which filter row's value input should be auto-focused
    const [focusValueIndex, setFocusValueIndex] = useState<number | undefined>(undefined);

    const handleFiltersChange = useCallback((newFilters: FilterDef[]) => {
        setFilters(newFilters);
        // Clear focus index when filters change from user interaction
        setFocusValueIndex(undefined);
    }, []);

    /** Add a filter for a specific field (triggered from column header icon) */
    const handleAddFilterForField = useCallback((fieldKey: string) => {
        const inferredType = fieldTypes[fieldKey] ?? "unknown";
        const valueType = FILTERABLE_VALUE_TYPES.includes(inferredType) ? inferredType : "string";
        const ops = getOperatorsForType(valueType);
        const newFilter: FilterDef = {
            field: fieldKey,
            op: ops[0],
            value: valueType === "boolean" ? true : "",
            valueType,
        };
        setFilters(prev => {
            const newFilters = [...prev, newFilter];
            setFocusValueIndex(newFilters.length - 1);
            return newFilters;
        });
        setShowFilterBar(true);
    }, [fieldTypes]);

    // Ref to break cascading deps: vtColumns → handleAddFilterForField → fieldTypes → documents
    const handleAddFilterForFieldRef = useRef(handleAddFilterForField);
    handleAddFilterForFieldRef.current = handleAddFilterForField;

    // Build VirtualTable columns
    const vtColumns: VirtualTableColumn[] = useMemo(() => {
        const savedOrder = columnConfig?.order;
        const savedWidths = columnConfig?.widths ?? {};

        // Build a map of CMS property names for column header tooltips
        const cmsPropertyNames: Record<string, string> = {};
        if (cmsCollection?.properties) {
            for (const [key, prop] of Object.entries(cmsCollection.properties)) {
                if (prop && typeof prop === "object" && "name" in prop && prop.name) {
                    cmsPropertyNames[key] = prop.name as string;
                }
            }
        }

        // ID column (frozen)
        const idCol: VirtualTableColumn = {
            key: "__id",
            title: "ID",
            width: savedWidths["__id"] ?? ID_COL_WIDTH,
            frozen: false,
            sortable: true,
            resizable: true,
            align: "left",
            headerAlign: "left",
        };

        // Determine field column ordering
        let orderedFields: string[];
        if (savedOrder) {
            // Use saved order, appending any new fields found
            const savedSet = new Set(savedOrder);
            const newFields = fieldKeys.filter(k => !savedSet.has(k));
            orderedFields = [...savedOrder.filter(k => fieldKeys.includes(k)), ...newFields];
        } else {
            orderedFields = fieldKeys;
        }

        const fieldCols: VirtualTableColumn[] = orderedFields.map(key => {
            const cmsName = cmsPropertyNames[key];
            return {
                key,
                title: cmsName
                    ? <Tooltip title={cmsName} side="bottom"><span className="inline-flex items-center cursor-default">{key}<span className="ml-1 text-surface-400 dark:text-surface-500 font-normal normal-case">·</span></span></Tooltip>
                    : key,
                width: savedWidths[key] ?? DEFAULT_COL_WIDTH,
                sortable: true,
                resizable: true,
                align: "left" as const,
                headerAlign: "left" as const,
                AdditionalHeaderWidget: ({ onHover }: { onHover: boolean }) => onHover ? (
                    <Tooltip title={`Filter by ${key}`}>
                        <IconButton
                            size="smallest"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleAddFilterForFieldRef.current(key);
                            }}
                        >
                            <FilterListIcon size="smallest" />
                        </IconButton>
                    </Tooltip>
                ) : null,
            };
        });

        return [idCol, ...fieldCols];
    }, [fieldKeys, columnConfig, cmsCollection]);

    // ─── Persist column changes ─────────────────────────────────────────────

    const handleColumnResize = useCallback((params: OnVirtualTableColumnResizeParams) => {
        setColumnConfig(prev => {
            const next: ColumnConfig = {
                order: prev?.order ?? fieldKeys,
                widths: { ...(prev?.widths ?? {}), [params.key]: params.width },
            };
            storeColumnConfig(path, next);
            return next;
        });
    }, [path, fieldKeys]);

    const handleColumnsOrderChange = useCallback((newColumns: VirtualTableColumn[]) => {
        const fieldOrder = newColumns
            .filter(c => c.key !== "__id")
            .map(c => c.key);
        setColumnConfig(prev => {
            const next: ColumnConfig = {
                order: fieldOrder,
                widths: prev?.widths ?? {},
            };
            storeColumnConfig(path, next);
            return next;
        });
    }, [path]);

    // ─── Convert filters to API format ────────────────────────────────────────

    // A filter is "complete" if it has a field and either is-null or has a meaningful value.
    const isFilterComplete = useCallback((f: FilterDef): boolean => {
        if (!f.field) return false;
        if (f.op === "is-null") return true;
        if (Array.isArray(f.value)) return f.value.length > 0;
        if (f.value === null || f.value === undefined) return false;
        if (typeof f.value === "string" && f.value.trim() === "") return false;
        return true;
    }, []);

    // ─── Data fetching ──────────────────────────────────────────────────────

    // Helper to scroll the VirtualTable to top
    const scrollTableToTop = useCallback(() => {
        if (tableWrapperRef.current) {
            const scrollContainer = tableWrapperRef.current.querySelector('[style*="overflow"]') as HTMLElement
                ?? tableWrapperRef.current.firstElementChild as HTMLElement;
            if (scrollContainer) {
                scrollContainer.scrollTo({ top: 0 });
            }
        }
    }, []);

    const fetchDocuments = useCallback(async (startAfter?: string, isPageChange?: boolean) => {
        setLoading(true);
        setError(null);
        if (isPageChange) {
            setPageLoading(true);
        }
        try {
            // Only include complete filters (field set + value present or is-null)
            const validFilters = filters.filter(isFilterComplete);
            const apiFilters = validFilters.length > 0
                ? validFilters.map(f => parseFilterValueForApi(f))
                : undefined;

            // PITR mode: use listDocumentsAtTime instead
            if (pitrActive && pitrReadTime) {
                setPitrError(null);
                try {
                    const pitrResult = await adminApi.listDocumentsAtTime(projectId, path, pitrReadTime.toISOString(), {
                        limit: pageSize,
                        databaseId,
                        orderBy,
                        orderDirection,
                    });
                    setDocuments(pitrResult.documents);
                    setHasMore(pitrResult.hasMore ?? false);
                    setCount(pitrResult.documents.length);
                    loadedPathRef.current = path;
                    if (isPageChange) {
                        scrollTableToTop();
                    }
                } catch (pitrErr: any) {
                    // PITR error — don't wipe the existing table data
                    setPitrError(pitrErr.message || "Time travel failed. The endpoint may not be deployed.");
                }
            } else {
                const [docsResult, countResult] = await Promise.all([
                    adminApi.listDocuments(projectId, path, {
                        limit: pageSize,
                        databaseId,
                        startAfter,
                        orderBy,
                        orderDirection,
                        filters: apiFilters,
                    }),
                    adminApi.countDocuments(projectId, path, databaseId, {
                        filters: apiFilters,
                        orderBy,
                        orderDirection,
                    }),
                ]);
                setDocuments(docsResult.documents);
                setHasMore(docsResult.hasMore ?? false);
                if (countResult) {
                    setCount(countResult.count);
                }
                loadedPathRef.current = path;
                // Scroll to top after page data loads
                if (isPageChange) {
                    scrollTableToTop();
                }
            }
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
            setPageLoading(false);
        }
    }, [projectId, path, databaseId, pageSize, orderBy, orderDirection, filters, scrollTableToTop, pitrActive, pitrReadTime]);

    const fetchRef = useRef(fetchDocuments);
    fetchRef.current = fetchDocuments;

    const prevPathRef = useRef(`${projectId}|${path}|${databaseId}`);
    const initialDocsRef = useRef(initialDocuments);
    initialDocsRef.current = initialDocuments;

    useEffect(() => {
        const pathKey = `${projectId}|${path}|${databaseId}`;
        let hasRestoredFilters = false;
        const isPathChange = prevPathRef.current !== pathKey;
        if (isPathChange) {
            prevPathRef.current = pathKey;

            if (clickTimerRef.current) {
                clearTimeout(clickTimerRef.current);
                clickTimerRef.current = null;
            }

            // If we have cached docs for this path, use them instead of clearing
            if (initialDocsRef.current && initialDocsRef.current.length > 0) {
                setDocumentsRaw(initialDocsRef.current);
                // Notify parent of restored cache
                if (onDocumentsChangeRef.current) {
                    const docs = initialDocsRef.current;
                    queueMicrotask(() => onDocumentsChangeRef.current?.(docs));
                }
            } else {
                setDocuments([]);
            }
            setCursorStack([]);
            setSelectedIds(new Set());
            setCount(undefined);
            setOrderBy(undefined);
            setOrderDirection("asc");
            // Restore persisted filters for the new path
            const persisted = readPersistedFilters(path);
            if (persisted && persisted.length > 0) {
                setFilters(persisted);
                setShowFilterBar(true);
                hasRestoredFilters = true;
            } else {
                setFilters([]);
                setShowFilterBar(false);
            }
            setEditingCell(null);
            prevSortFilterKey.current = `undefined|asc|[]|${pageSize}`;
        }
        // Skip fetch if we have cached docs for this path change
        if (initialDocsRef.current && initialDocsRef.current.length > 0 && isPathChange) {
            initialDocsRef.current = undefined; // consume the cache, future fetches are normal
            return;
        }
        initialDocsRef.current = undefined; // consume after first use
        // When persisted filters are restored, skip fetching here — the
        // sortFilterKey effect will pick up the new filters after React
        // flushes the state update and fetch with the correct filters.
        if (!hasRestoredFilters) {
            fetchRef.current();
        }
    }, [projectId, path, databaseId]);

    const completeFilters = useMemo(() => filters.filter(isFilterComplete), [filters, isFilterComplete]);
    const sortFilterKey = `${orderBy}|${orderDirection}|${JSON.stringify(completeFilters)}|${pageSize}`;
    const prevSortFilterKey = useRef(sortFilterKey);
    useEffect(() => {
        if (prevSortFilterKey.current !== sortFilterKey) {
            prevSortFilterKey.current = sortFilterKey;
            setCursorStack([]);
            fetchRef.current();
        }
    }, [sortFilterKey]);

    // Re-fetch when PITR readTime changes
    const prevPitrKey = useRef(`${pitrActive}|${pitrReadTime?.toISOString()}`);
    useEffect(() => {
        const pitrKey = `${pitrActive}|${pitrReadTime?.toISOString()}`;
        if (prevPitrKey.current !== pitrKey) {
            prevPitrKey.current = pitrKey;
            setCursorStack([]);
            fetchRef.current();
        }
    }, [pitrActive, pitrReadTime]);

    // ─── Pagination handlers ────────────────────────────────────────────────

    const handleNextPage = useCallback(() => {
        if (documents.length === 0 || !hasMore) return;
        const lastDocId = documents[documents.length - 1].id;
        setCursorStack(prev => [...prev, lastDocId]);
        fetchDocuments(lastDocId, true);
    }, [documents, hasMore, fetchDocuments]);

    const handlePrevPage = useCallback(() => {
        if (cursorStack.length === 0) return;
        const newStack = cursorStack.slice(0, -1);
        setCursorStack(newStack);
        const cursor = newStack.length > 0 ? newStack[newStack.length - 1] : undefined;
        fetchDocuments(cursor, true);
    }, [cursorStack, fetchDocuments]);

    const handleRefresh = useCallback(() => {
        const cursor = cursorStack.length > 0 ? cursorStack[cursorStack.length - 1] : undefined;
        setDocuments([]);
        fetchDocuments(cursor, true);
    }, [cursorStack, fetchDocuments]);

    // ─── Sort handler (via VirtualTable) ────────────────────────────────────

    // Map between VirtualTable column key (__id) and Firestore field (__name__)
    const sortBy: [string, "asc" | "desc"] | undefined = orderBy
        ? [orderBy === "__name__" ? "__id" : orderBy, orderDirection]
        : undefined;

    const handleSortByUpdate = useCallback((newSortBy?: [string, "asc" | "desc"]) => {
        if (newSortBy) {
            // __id is the column key; Firestore uses __name__ to sort by document ID
            const field = newSortBy[0] === "__id" ? "__name__" : newSortBy[0];
            setOrderBy(field);
            setOrderDirection(newSortBy[1]);
        } else {
            setOrderBy(undefined);
            setOrderDirection("asc");
        }
    }, []);



    // ─── Selection handlers ─────────────────────────────────────────────────

    const handleSelectAll = useCallback((checked: boolean) => {
        if (checked) {
            setSelectedIds(new Set(documents.map(d => d.id)));
        } else {
            setSelectedIds(new Set());
        }
    }, [documents]);

    const handleSelectRow = useCallback((id: string, checked: boolean) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (checked) next.add(id); else next.delete(id);
            return next;
        });
    }, []);

    // ─── Action handlers ────────────────────────────────────────────────────

    // Ref to break cascade: handleCmsOpen → handleRefresh → fetchDocuments → filters/sort/page
    const handleRefreshRef = useRef(handleRefresh);
    handleRefreshRef.current = handleRefresh;

    const handleCmsOpen = useCallback((doc: AdminDocument) => {
        if (cmsCollection) {
            sideEntityController.open({
                path,
                entityId: doc.id,
                updateUrl: true,
                onUpdate: () => {
                    handleRefreshRef.current();
                },
            });
        }
    }, [cmsCollection, path, sideEntityController]);

    const handleCopyId = useCallback((id: string) => {
        navigator.clipboard.writeText(id);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 1500);
    }, []);

    const handleBulkDeleteClick = useCallback(() => {
        if (selectedIds.size === 0) return;
        setDeleteConfirmOpen(true);
    }, [selectedIds]);

    const handleBulkDeleteConfirm = useCallback(async () => {
        setDeleting(true);
        try {
            await adminApi.batchWrite(
                projectId,
                Array.from(selectedIds).map(id => ({ type: "delete" as const, path, documentId: id })),
                databaseId
            );
            setSelectedIds(new Set());
            setDeleteConfirmOpen(false);
            handleRefresh();
        } catch (e: any) {
            setError(e.message);
        } finally {
            setDeleting(false);
        }
    }, [selectedIds, projectId, path, databaseId, handleRefresh]);

    const handleDuplicate = useCallback((doc: AdminDocument) => {
        setDuplicateData(doc.values ?? {});
        setAddDialogOpen(true);
    }, []);

    // ─── State flags (computed early, needed by rowData) ────────────────────

    const showSkeletons = (loading && loadedPathRef.current !== path && documents.length === 0) || pageLoading;
    const showLoadingBar = loading && !showSkeletons && !pageLoading;

    // ─── Build row data for VirtualTable ────────────────────────────────────

    const rowData: AdminRow[] = useMemo(() => {
        if (showSkeletons) {
            // Generate skeleton placeholder rows
            return SKELETON_ROW_WIDTHS.map((widths, i) => ({
                _doc: { id: `__skeleton_${i}`, path: "", values: {} } as AdminDocument,
                _skeleton: true,
                _skeletonWidths: widths,
            }));
        }
        return documents.map(doc => ({
            ...doc.values,
            _doc: doc,
            _selected: selectedIds.has(doc.id),
        }));
    }, [documents, showSkeletons, selectedIds]);

    // ─── Cell renderer ──────────────────────────────────────────────────────

    // Stable cell renderer — reads volatile state from refs, not from closure
    const cellRenderer = useCallback((props: CellRendererParams<AdminRow>) => {
        const { column, rowData: row, columnIndex } = props;
        if (!row) return null;

        // ── Skeleton row: render placeholders ───────────────────────
        if (row._skeleton) {
            const widths = row._skeletonWidths ?? [120, 100, 80, 140, 90, 110, 100];
            if (column.key === "__id") {
                return (
                    <div className="flex items-center gap-1 h-full px-3">
                        {/* Matches Checkbox size="small": w-8 h-8 with p-2 around a 16px box */}
                        <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                            <Skeleton width={16} height={16} className="rounded" />
                        </div>
                        <Skeleton width={widths[0]} height={14} />
                    </div>
                );
            }
            // Data columns use the width from the skeleton array
            const skeletonIdx = columnIndex < widths.length ? columnIndex : columnIndex % widths.length;
            return (
                <div className="flex items-center h-full px-3">
                    <Skeleton width={widths[skeletonIdx]} height={14} />
                </div>
            );
        }

        const doc = row._doc;

        // ID column
        if (column.key === "__id") {
            return (
                <div
                    className={cls(
                        "flex items-center gap-1 h-full w-full px-3",
                        "text-text-primary dark:text-text-primary-dark",
                        "cursor-pointer hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
                    )}
                    onClick={(e) => {
                        if (e.detail === 1) {
                            onDocumentSelectRef.current(doc);
                        }
                    }}
                >
                    <div className="flex-shrink-0 flex items-center" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                            checked={row._selected ?? false}
                            onCheckedChange={(checked) => handleSelectRow(doc.id, checked as boolean)}
                            size="small"
                        />
                    </div>
                    <span className="font-mono text-xs truncate flex-grow">{doc.id}</span>
                    <div className="flex items-center gap-0.5 flex-shrink-0">
                        {cmsCollection && (
                            <Tooltip title={`Open in ${cmsCollection.name ?? "CMS"}`}>
                                <IconButton size="smallest" onClick={(e) => { e.stopPropagation(); handleCmsOpen(doc); }}>
                                    <span style={{ fontSize: "9px" }} className="font-bold leading-none tracking-tighter">CMS</span>
                                </IconButton>
                            </Tooltip>
                        )}
                        <Tooltip title={copiedIdRef.current === doc.id ? "Copied!" : "Copy ID"}>
                            <IconButton size="smallest" onClick={(e) => { e.stopPropagation(); handleCopyId(doc.id); }}>
                                <ContentCopyIcon size="smallest" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Duplicate">
                            <IconButton size="smallest" onClick={(e) => { e.stopPropagation(); handleDuplicate(doc); }}>
                                <AddIcon size="smallest" />
                            </IconButton>
                        </Tooltip>
                    </div>
                </div>
            );
        }

        // Data columns
        const value = doc.values?.[column.key];
        const isEditing = editingCellRef.current?.id === doc.id && editingCellRef.current?.key === column.key;
        const isEmpty = value === null || value === undefined;

        return (
            <Popover
                open={isEditing}
                onOpenChange={(open) => {
                    if (!open) {
                        setEditingCell(null);
                    }
                }}
                enabled={isEditing}
                side="bottom"
                align="start"
                sideOffset={-48}
                avoidCollisions={true}
                trigger={
                    <div className={cls(
                        "group relative flex items-center h-full px-3 text-sm truncate",
                        isEmpty && "text-surface-400 dark:text-surface-500",
                        !isEmpty && "text-text-primary dark:text-text-primary-dark",
                        "cursor-pointer hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors outline-none"
                    )}
                    onClick={(e) => {
                        if (e.detail === 1) {
                            // Delay single-click action so a quick second click
                            // (double-click) can cancel it before it fires.
                            if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
                            const docSnapshot = doc;
                            const colKey = column.key;
                            clickTimerRef.current = setTimeout(() => {
                                clickTimerRef.current = null;
                                onDocumentSelectRef.current(docSnapshot, colKey);
                            }, 150);
                        }
                    }}
                    onDoubleClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // Cancel the pending single-click action
                        if (clickTimerRef.current) {
                            clearTimeout(clickTimerRef.current);
                            clickTimerRef.current = null;
                        }
                        onDocumentDeselectRef.current();
                        if (!pitrActive) {
                            setEditingCell({ id: doc.id, key: column.key });
                        }
                    }}>
                        {renderCellValue(value)}
                        {!pitrActive && (
                            <div
                                className="absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (clickTimerRef.current) {
                                        clearTimeout(clickTimerRef.current);
                                        clickTimerRef.current = null;
                                    }
                                    onDocumentDeselectRef.current();
                                    setEditingCell({ id: doc.id, key: column.key });
                                }}
                            >
                                <Tooltip title="Edit">
                                    <IconButton size="smallest">
                                        <EditIcon size="smallest" />
                                    </IconButton>
                                </Tooltip>
                            </div>
                        )}
                    </div>
                }
            >
                {isEditing && (
                    <PopoverCellEditor
                        columnKey={column.key}
                        initialValue={value} 
                        onSave={async (newVal) => {
                            try {
                                await adminApi.updateDocument(projectId, path, doc.id, { [column.key]: newVal }, databaseId);
                                setDocuments(prev => prev.map(d => d.id === doc.id ? { ...d, values: { ...d.values, [column.key]: newVal } } : d));
                                setEditingCell(null);
                            } catch (e: any) {
                                snackbar.open({ type: "error", message: e.message });
                            }
                        }}
                        onCancel={() => setEditingCell(null)}
                    />
                )}
            </Popover>
        );
    }, [cmsCollection, handleSelectRow, handleCopyId, handleDuplicate, handleCmsOpen, editingCell, adminApi, projectId, path, databaseId, snackbar, pitrActive]);

    // ─── State flags ────────────────────────────────────────────────────────

    // Skeleton columns: used when we have no real columns yet
    const skeletonColumns: VirtualTableColumn[] = useMemo(() => [
        {
            key: "__id",
            title: "ID",
            width: ID_COL_WIDTH,
            frozen: true,
            sortable: false,
            resizable: false,
            align: "left" as const,
            headerAlign: "left" as const,
        },
        ...Array.from({ length: 6 }, (_, i) => ({
            key: `__skel_${i}`,
            title: "",
            width: DEFAULT_COL_WIDTH,
            sortable: false,
            resizable: false,
            align: "left" as const,
            headerAlign: "left" as const,
        })),
    ], []);

    // Use skeleton columns when we don't have real data yet
    const activeColumns = showSkeletons && vtColumns.length <= 1 ? skeletonColumns : vtColumns;
    // Stable rowClassName — memoized to avoid reference changes
    const rowClassName = useCallback(() => "group/row hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors", []);

    // ─── Empty component ────────────────────────────────────────────────────

    const emptyComponent = useMemo(() => (
        <div className="text-center space-y-3">
            <Typography color="secondary" variant="body2">
                {completeFilters.length > 0
                    ? "No documents match the current filters"
                    : "No documents in this collection"
                }
            </Typography>
            {completeFilters.length > 0 ? (
                <Button size="small" variant="text" onClick={() => {
                    setFilters([]);
                    persistFilters(path, []);
                }}>
                    Clear filters
                </Button>
            ) : (
                <Button size="small" variant="outlined" startIcon={<AddIcon size="small" />}
                        onClick={() => setAddDialogOpen(true)}>
                    Add first document
                </Button>
            )}
        </div>
    ), [completeFilters, path]);

    // ─── Render ─────────────────────────────────────────────────────────────

    return (
        <div className="flex flex-col flex-grow overflow-hidden">
            {/* Merged header: breadcrumbs + toolbar */}
            <div className={cls(
                "flex items-center gap-2 px-4 py-2 min-h-[48px]",
                "border-b",
                defaultBorderMixin,
                "bg-surface-50 dark:bg-surface-900"
            )}>
                {/* Breadcrumbs */}
                <div className="flex items-center gap-1 min-w-0 overflow-x-auto no-scrollbar flex-shrink">
                    {onOpenCollectionDrawer && (
                        <IconButton
                            size="small"
                            onClick={onOpenCollectionDrawer}
                            className="flex-shrink-0 mr-1"
                        >
                            <MenuIcon size="small" />
                        </IconButton>
                    )}
                    <Chip size="small" onClick={onRootClick} className="cursor-pointer flex-shrink-0">/</Chip>
                    {breadcrumbParts.map((part, index) => (
                        <React.Fragment key={index}>
                            <ChevronRightIcon size="smallest" className="text-surface-400 flex-shrink-0" />
                            <Chip
                                size="small"
                                colorScheme={index % 2 === 0 ? "blueLighter" : undefined}
                                onClick={() => onBreadcrumbClick(index)}
                                className="cursor-pointer flex-shrink-0"
                            >
                                {part}
                            </Chip>
                        </React.Fragment>
                    ))}
                </div>

                {/* Right side toolbar */}
                <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
                    {!showSkeletons && (
                        <Chip size="small" colorScheme="grayLighter">
                            {count !== undefined ? `${count.toLocaleString()} docs` : "…"}
                        </Chip>
                    )}

                    {!showSkeletons && cmsCollection && (
                        <Chip size="small" colorScheme="cyanLighter">
                            CMS: {cmsCollection.name}
                        </Chip>
                    )}

                    {!pitrActive && !showSkeletons && selectedIds.size > 0 && (
                        <>
                            <Checkbox
                                checked={selectedIds.size === documents.length && documents.length > 0}
                                onCheckedChange={handleSelectAll}
                                size="small"
                            />
                            <Typography variant="caption" color="secondary">
                                {selectedIds.size} selected
                            </Typography>
                            <Tooltip title="Delete selected">
                                <IconButton size="small" onClick={handleBulkDeleteClick}>
                                    <DeleteIcon size="small" />
                                </IconButton>
                            </Tooltip>
                        </>
                    )}

                    <Tooltip title={showFilterBar ? "Hide filters" : "Show filters"}>
                        <IconButton
                            size="small"
                            onClick={() => setShowFilterBar(!showFilterBar)}
                            className={completeFilters.length > 0 ? "text-primary" : ""}
                            disabled={pitrActive}
                        >
                            <FilterListIcon size="small" />
                        </IconButton>
                    </Tooltip>

                    <ExportButton
                        projectId={projectId}
                        path={path}
                        databaseId={databaseId}
                        documents={documents}
                        count={count}
                        filters={completeFilters.length > 0
                            ? completeFilters.map(f => parseFilterValueForApi(f))
                            : undefined}
                        orderBy={orderBy}
                        orderDirection={orderDirection}
                    />

                    {onPitrActivate && !pitrActive && (
                        <Tooltip title="Time travel (PITR)">
                            <IconButton
                                size="small"
                                onClick={onPitrActivate}
                            >
                                <HistoryIcon size="small" />
                            </IconButton>
                        </Tooltip>
                    )}

                    <Tooltip title="Refresh">
                        <IconButton size="small" onClick={handleRefresh} className={loading && !showSkeletons ? "animate-spin" : ""}>
                            <RefreshIcon size="small" />
                        </IconButton>
                    </Tooltip>

                    {!pitrActive && (
                        <Tooltip title="Add document">
                            <Button
                                size="small"
                                variant="outlined"
                                startIcon={<AddIcon size="small" />}
                                onClick={() => setAddDialogOpen(true)}
                            >
                                Add
                            </Button>
                        </Tooltip>
                    )}
                </div>
            </div>

            {/* PITR toolbar — only visible when active */}
            <PITRToolbar
                active={pitrActive ?? false}
                readTime={pitrReadTime ?? null}
                onActivate={onPitrActivate ?? (() => {})}
                onDeactivate={() => {
                    setPitrError(null);
                    onPitrDeactivate?.();
                }}
                onTimeChange={onPitrTimeChange ?? (() => {})}
                loading={pitrActive && loading}
                error={pitrError}
            />

            {/* Filter bar */}
            {showFilterBar && (
                <FilterBar
                    fieldKeys={fieldKeys}
                    fieldTypes={fieldTypes}
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    path={path}
                    focusValueIndex={focusValueIndex}
                    onClose={() => setShowFilterBar(false)}
                />
            )}

            {/* Loading bar */}
            {showLoadingBar && (
                <div className="h-0.5 bg-primary/20 overflow-hidden flex-shrink-0">
                    <div className="h-full bg-primary animate-pulse w-full" />
                </div>
            )}

            {/* VirtualTable — always mounted, fed skeleton rows when loading */}
            <div ref={tableWrapperRef} className="flex-grow overflow-hidden relative">
                    <VirtualTable
                        data={rowData}
                        columns={activeColumns}
                        cellRenderer={cellRenderer}
                        onColumnResize={showSkeletons ? undefined : handleColumnResize}
                        onColumnsOrderChange={showSkeletons ? undefined : handleColumnsOrderChange}
                        sortBy={showSkeletons ? undefined : sortBy}
                        onSortByUpdate={showSkeletons ? undefined : handleSortByUpdate}
                        loading={loading}
                        error={error ? new Error(error) : undefined}
                        emptyComponent={emptyComponent}
                        hoverRow={!showSkeletons}
                        rowHeight={48}
                        rowClassName={showSkeletons ? undefined : rowClassName}
                        headerIconSize="smallest"
                    />
            </div>

            {/* Pagination footer */}
            {documents.length > 0 && (
                <div className={cls(
                    "flex items-center gap-3 px-4 py-2",
                    "border-t",
                    defaultBorderMixin,
                    "bg-surface-50 dark:bg-surface-900"
                )}>
                    <Typography variant="caption" color="secondary">
                        Page {currentPage + 1}
                        {count !== undefined && ` of ${Math.max(1, Math.ceil(count / pageSize))}`}
                    </Typography>

                    <div className="flex-grow" />

                    <div className="flex items-center gap-1">
                        <Typography variant="caption" color="secondary">Rows:</Typography>
                        <Select
                            size="smallest"
                            value={String(pageSize)}
                            onValueChange={(v) => {
                                setPageSize(Number(v));
                                setCursorStack([]);
                            }}
                            className="w-20"
                        >
                            {PAGE_SIZE_OPTIONS.map(n => (
                                <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                            ))}
                        </Select>
                    </div>

                    <div className="flex items-center gap-1">
                        <Tooltip title="Previous page">
                            <IconButton size="small" onClick={handlePrevPage} disabled={currentPage === 0}>
                                <ArrowBackIcon size="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Next page">
                            <IconButton size="small" onClick={handleNextPage} disabled={!hasMore}>
                                <ArrowForwardIcon size="small" />
                            </IconButton>
                        </Tooltip>
                    </div>
                </div>
            )}

            <AddDocumentDialog
                open={addDialogOpen}
                projectId={projectId}
                collectionPath={path}
                databaseId={databaseId}
                onClose={() => {
                    setAddDialogOpen(false);
                    setDuplicateData(undefined);
                }}
                onDocumentCreated={handleRefresh}
                initialData={duplicateData}
            />

            <ConfirmationDialog
                open={deleteConfirmOpen}
                onAccept={handleBulkDeleteConfirm}
                onCancel={() => setDeleteConfirmOpen(false)}
                loading={deleting}
                title={`Delete ${selectedIds.size} document(s)?`}
                body={"This action cannot be undone. The selected documents will be permanently deleted."}
            />
        </div>
    );
}
