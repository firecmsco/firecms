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
    TextField,
    defaultBorderMixin,
    DeleteIcon,
    RefreshIcon,
    KeyboardTabIcon,
    AddIcon,
    ContentCopyIcon,
    ArrowBackIcon,
    ArrowForwardIcon,
    FilterListIcon,
    CloseIcon,
    ChevronRightIcon,
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

// ─── Types ──────────────────────────────────────────────────────────────────

type FilterDef = {
    field: string;
    op: string;
    value: string;
};

// Row shape fed to VirtualTable: the document values plus _doc metadata
type AdminRow = Record<string, any> & {
    _doc: AdminDocument;
    _skeleton?: boolean;
    _skeletonWidths?: number[];
};

const PAGE_SIZE_OPTIONS = [25, 50, 100, 200];
const FILTER_OPS = [
    { value: "==", label: "==" },
    { value: "!=", label: "!=" },
    { value: "<", label: "<" },
    { value: "<=", label: "<=" },
    { value: ">", label: ">" },
    { value: ">=", label: ">=" },
    { value: "array-contains", label: "contains" },
];

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

// ─── Cell value rendering ───────────────────────────────────────────────────

function renderCellValue(value: any): string {
    if (value === null || value === undefined) return "—";
    if (typeof value === "boolean") return value ? "true" : "false";
    if (typeof value === "number") return String(value);
    
    // We use a high safe limit (1000) so CSS `text-truncate` can handle dynamic sizing 
    // based on column width without crashing the browser on multi-megabyte string payloads.
    if (typeof value === "string") return value.length > 1000 ? value.substring(0, 1000) + "…" : value;
    
    if (value instanceof Date || (value && value._seconds !== undefined)) {
        const date = value._seconds ? new Date(value._seconds * 1000) : value;
        return date.toLocaleString();
    }
    if (Array.isArray(value)) {
        return `[${value.length} items]`;
    }
    if (typeof value === "object") {
        return `{${Object.keys(value).length} fields}`;
    }
    return String(value);
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function DocumentTable({
    projectId,
    path,
    databaseId,
    onDocumentSelect,
    onNavigateToSubcollection,
    breadcrumbParts,
    onBreadcrumbClick,
    onRootClick,
}: {
    projectId: string;
    path: string;
    databaseId?: string;
    onDocumentSelect: (doc: AdminDocument, field?: string) => void;
    onNavigateToSubcollection: (subPath: string) => void;
    breadcrumbParts: string[];
    onBreadcrumbClick: (index: number) => void;
    onRootClick: () => void;
}) {
    const adminApi = useAdminApi();
    const [documents, setDocuments] = useState<AdminDocument[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [count, setCount] = useState<number | undefined>(undefined);
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [duplicateData, setDuplicateData] = useState<Record<string, any> | undefined>(undefined);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [editingCell, setEditingCell] = useState<{ id: string; key: string } | null>(null);

    // Refs for volatile state read by cellRenderer so the function stays stable
    const selectedIdsRef = useRef(selectedIds);
    selectedIdsRef.current = selectedIds;
    const copiedIdRef = useRef(copiedId);
    copiedIdRef.current = copiedId;

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
    const [newFilterField, setNewFilterField] = useState("");
    const [newFilterOp, setNewFilterOp] = useState("==");
    const [newFilterValue, setNewFilterValue] = useState("");

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

    // ─── Column config (persisted) ──────────────────────────────────────────
    const [columnConfig, setColumnConfig] = useState<ColumnConfig | null>(null);

    // Load persisted column config when path changes
    useEffect(() => {
        setColumnConfig(readColumnConfig(path));
    }, [path]);

    // Derive field keys from document data
    const fieldKeys: string[] = useMemo(() => {
        const fieldSet = new Set<string>();
        for (const doc of documents) {
            if (doc.values) {
                Object.keys(doc.values).forEach(k => fieldSet.add(k));
            }
        }
        return Array.from(fieldSet).sort();
    }, [documents]);

    // Build VirtualTable columns
    const vtColumns: VirtualTableColumn[] = useMemo(() => {
        const savedOrder = columnConfig?.order;
        const savedWidths = columnConfig?.widths ?? {};

        // ID column (frozen)
        const idCol: VirtualTableColumn = {
            key: "__id",
            title: "ID",
            width: savedWidths["__id"] ?? ID_COL_WIDTH,
            frozen: false,
            sortable: false,
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

        const fieldCols: VirtualTableColumn[] = orderedFields.map(key => ({
            key,
            title: key,
            width: savedWidths[key] ?? DEFAULT_COL_WIDTH,
            sortable: true,
            resizable: true,
            align: "left" as const,
            headerAlign: "left" as const,
        }));

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

    // ─── Convert filter value strings to proper types ───────────────────────

    function parseFilterValue(val: string): any {
        if (val === "true") return true;
        if (val === "false") return false;
        if (val === "null") return null;
        const num = Number(val);
        if (!isNaN(num) && val.trim() !== "") return num;
        return val;
    }

    // ─── Data fetching ──────────────────────────────────────────────────────

    const countRef = useRef(count);
    countRef.current = count;

    const fetchDocuments = useCallback(async (startAfter?: string) => {
        setLoading(true);
        setError(null);
        try {
            const apiFilters = filters.length > 0
                ? filters.map(f => ({ field: f.field, op: f.op, value: parseFilterValue(f.value) }))
                : undefined;

            const [docsResult, countResult] = await Promise.all([
                adminApi.listDocuments(projectId, path, {
                    limit: pageSize,
                    databaseId,
                    startAfter,
                    orderBy,
                    orderDirection,
                    filters: apiFilters,
                }),
                startAfter
                    ? Promise.resolve(countRef.current !== undefined ? { count: countRef.current } : null)
                    : adminApi.countDocuments(projectId, path, databaseId),
            ]);
            setDocuments(docsResult.documents);
            setHasMore(docsResult.hasMore ?? false);
            if (countResult) {
                setCount(countResult.count);
            }
            loadedPathRef.current = path;
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [projectId, path, databaseId, pageSize, orderBy, orderDirection, filters]);

    const fetchRef = useRef(fetchDocuments);
    fetchRef.current = fetchDocuments;

    const prevPathRef = useRef(`${projectId}|${path}|${databaseId}`);

    useEffect(() => {
        const pathKey = `${projectId}|${path}|${databaseId}`;
        if (prevPathRef.current !== pathKey) {
            prevPathRef.current = pathKey;
            setDocuments([]);
            setCursorStack([]);
            setSelectedIds(new Set());
            setCount(undefined);
            setOrderBy(undefined);
            setOrderDirection("asc");
            setFilters([]);
            setShowFilterBar(false);
            setEditingCell(null);
            prevSortFilterKey.current = `undefined|asc|[]|${pageSize}`;
        }
        fetchRef.current();
    }, [projectId, path, databaseId]);

    const sortFilterKey = `${orderBy}|${orderDirection}|${JSON.stringify(filters)}|${pageSize}`;
    const prevSortFilterKey = useRef(sortFilterKey);
    useEffect(() => {
        if (prevSortFilterKey.current !== sortFilterKey) {
            prevSortFilterKey.current = sortFilterKey;
            setCursorStack([]);
            fetchRef.current();
        }
    }, [sortFilterKey]);

    // ─── Pagination handlers ────────────────────────────────────────────────

    const handleNextPage = useCallback(() => {
        if (documents.length === 0 || !hasMore) return;
        const lastDocId = documents[documents.length - 1].id;
        setCursorStack(prev => [...prev, lastDocId]);
        fetchDocuments(lastDocId);
    }, [documents, hasMore, fetchDocuments]);

    const handlePrevPage = useCallback(() => {
        if (cursorStack.length === 0) return;
        const newStack = cursorStack.slice(0, -1);
        setCursorStack(newStack);
        const cursor = newStack.length > 0 ? newStack[newStack.length - 1] : undefined;
        fetchDocuments(cursor);
    }, [cursorStack, fetchDocuments]);

    const handleRefresh = useCallback(() => {
        const cursor = cursorStack.length > 0 ? cursorStack[cursorStack.length - 1] : undefined;
        fetchDocuments(cursor);
    }, [cursorStack, fetchDocuments]);

    // ─── Sort handler (via VirtualTable) ────────────────────────────────────

    const sortBy: [string, "asc" | "desc"] | undefined = orderBy
        ? [orderBy, orderDirection]
        : undefined;

    const handleSortByUpdate = useCallback((newSortBy?: [string, "asc" | "desc"]) => {
        if (newSortBy) {
            setOrderBy(newSortBy[0]);
            setOrderDirection(newSortBy[1]);
        } else {
            setOrderBy(undefined);
            setOrderDirection("asc");
        }
    }, []);

    // ─── Filter handlers ────────────────────────────────────────────────────

    const handleAddFilter = useCallback(() => {
        if (!newFilterField.trim()) return;
        setFilters(prev => [...prev, {
            field: newFilterField.trim(),
            op: newFilterOp,
            value: newFilterValue,
        }]);
        setNewFilterField("");
        setNewFilterValue("");
    }, [newFilterField, newFilterOp, newFilterValue]);

    const handleRemoveFilter = useCallback((index: number) => {
        setFilters(prev => prev.filter((_, i) => i !== index));
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

    const handleCmsOpen = useCallback((doc: AdminDocument) => {
        if (cmsCollection) {
            sideEntityController.open({ path, entityId: doc.id, updateUrl: true });
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

    const showSkeletons = loading && loadedPathRef.current !== path && documents.length === 0;
    const showLoadingBar = loading && !showSkeletons;

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
        }));
    }, [documents, showSkeletons]);

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
                            onDocumentSelect(doc);
                        }
                    }}
                >
                    <div className="flex-shrink-0 flex items-center" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                            checked={selectedIdsRef.current.has(doc.id)}
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
        const isEditing = editingCell?.id === doc.id && editingCell?.key === column.key;
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
                trigger={
                    <div className={cls(
                        "flex items-center h-full px-3 text-sm truncate",
                        isEmpty && "text-surface-400 dark:text-surface-500",
                        !isEmpty && "text-text-primary dark:text-text-primary-dark",
                        "cursor-pointer hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors outline-none"
                    )}
                    onClick={(e) => {
                        if (e.detail === 2) {
                            e.preventDefault();
                            e.stopPropagation();
                            setEditingCell({ id: doc.id, key: column.key });
                        } else if (e.detail === 1) {
                            e.preventDefault();
                            e.stopPropagation();
                            onDocumentSelect(doc, column.key);
                        }
                    }}>
                        {renderCellValue(value)}
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
    }, [cmsCollection, handleSelectRow, handleCopyId, handleDuplicate, handleCmsOpen, editingCell, adminApi, projectId, path, databaseId, snackbar]);

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
                {filters.length > 0
                    ? "No documents match the current filters"
                    : "No documents in this collection"
                }
            </Typography>
            {filters.length > 0 ? (
                <Button size="small" variant="text" onClick={() => setFilters([])}>
                    Clear filters
                </Button>
            ) : (
                <Button size="small" variant="outlined" startIcon={<AddIcon size="small" />}
                        onClick={() => setAddDialogOpen(true)}>
                    Add first document
                </Button>
            )}
        </div>
    ), [filters]);

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

                    {!showSkeletons && selectedIds.size > 0 && (
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
                            className={filters.length > 0 ? "text-primary" : ""}
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
                        filters={filters.length > 0
                            ? filters.map(f => ({ field: f.field, op: f.op, value: parseFilterValue(f.value) }))
                            : undefined}
                        orderBy={orderBy}
                        orderDirection={orderDirection}
                    />

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

                    <Tooltip title="Refresh">
                        <IconButton size="small" onClick={handleRefresh} className={loading && !showSkeletons ? "animate-spin" : ""}>
                            <RefreshIcon size="small" />
                        </IconButton>
                    </Tooltip>
                </div>
            </div>

            {/* Filter bar */}
            {showFilterBar && (
                <div className={cls(
                    "flex flex-col gap-2 px-4 py-2",
                    "border-b",
                    defaultBorderMixin,
                    "bg-surface-50 dark:bg-surface-900"
                )}>
                    {filters.length > 0 && (
                        <div className="flex items-center gap-1 flex-wrap">
                            {filters.map((f, i) => (
                                <Chip key={i} size="small" colorScheme="blueLighter" onClick={() => handleRemoveFilter(i)}>
                                    {f.field} {f.op} {f.value}
                                    <CloseIcon size="smallest" className="ml-1" />
                                </Chip>
                            ))}
                            <Button size="small" variant="text" onClick={() => setFilters([])} className="text-xs">
                                Clear all
                            </Button>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <TextField
                            size="smallest"
                            placeholder="Field name"
                            value={newFilterField}
                            onChange={(e) => setNewFilterField(e.target.value)}
                            className="w-36"
                        />
                        <Select size="smallest" value={newFilterOp} onValueChange={setNewFilterOp} className="w-28">
                            {FILTER_OPS.map(o => (
                                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                            ))}
                        </Select>
                        <TextField
                            size="smallest"
                            placeholder="Value"
                            value={newFilterValue}
                            onChange={(e) => setNewFilterValue(e.target.value)}
                            className="w-36"
                            onKeyDown={(e) => { if (e.key === "Enter") handleAddFilter(); }}
                        />
                        <Button size="small" variant="outlined" onClick={handleAddFilter} disabled={!newFilterField.trim()}>
                            Add filter
                        </Button>
                    </div>
                </div>
            )}

            {/* Loading bar */}
            {showLoadingBar && (
                <div className="h-0.5 bg-primary/20 overflow-hidden flex-shrink-0">
                    <div className="h-full bg-primary animate-pulse w-full" />
                </div>
            )}

            {/* VirtualTable — always mounted, fed skeleton rows when loading */}
            <div className="flex-grow overflow-hidden relative">
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
