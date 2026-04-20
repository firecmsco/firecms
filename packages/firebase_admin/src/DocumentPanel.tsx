import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    cls,
    Typography,
    Button,
    IconButton,
    Tooltip,
    Tabs,
    Tab,
    Chip,
    defaultBorderMixin,
    Skeleton,
    TextField,
    CloseIcon,
    DeleteIcon,
    SaveIcon,
    KeyboardTabIcon,
    LoadingButton,
    AddIcon,
    ContentCopyIcon,
    OpenInNewIcon,
} from "@firecms/ui";
import { ConfirmationDialog } from "@firecms/core";
import { useAdminApi } from "./api/AdminApiProvider";
import { AdminDocument } from "./api/admin_api";
import { EditableFieldsView, defaultValueForType, isTimestamp, FieldType } from "./FieldEditor";



// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export function DocumentPanel({
    projectId,
    document,
    databaseId,
    onClose,
    onDocumentUpdated,
    onNavigateToSubcollection,
    onDocumentDeleted,
}: {
    projectId: string;
    document: AdminDocument;
    databaseId?: string;
    onClose: () => void;
    onDocumentUpdated: (doc: AdminDocument) => void;
    onNavigateToSubcollection: (subPath: string) => void;
    onDocumentDeleted?: () => void;
}) {
    const adminApi = useAdminApi();
    const [activeTab, setActiveTab] = useState("fields");
    const [jsonValue, setJsonValue] = useState("");
    const [jsonError, setJsonError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [subcollections, setSubcollections] = useState<string[]>([]);
    const [subcollectionsLoading, setSubcollectionsLoading] = useState(true);

    // Editable working copy
    const [editedValues, setEditedValues] = useState<Record<string, any>>({});
    const [copiedPath, setCopiedPath] = useState(false);

    // Sync when document changes
    useEffect(() => {
        setEditedValues(structuredClone(document.values ?? {}));
        setJsonValue(JSON.stringify(document.values, null, 2));
        setJsonError(null);
    }, [document]);

    // Load subcollections
    useEffect(() => {
        setSubcollectionsLoading(true);
        adminApi
            .listCollections(projectId, document.path, databaseId)
            .then(({ collections }) => setSubcollections(collections))
            .catch(() => setSubcollections([]))
            .finally(() => setSubcollectionsLoading(false));
    }, [document.path, projectId, databaseId]);

    // Dirty detection
    const isDirty = useMemo(() => {
        return JSON.stringify(editedValues) !== JSON.stringify(document.values ?? {});
    }, [editedValues, document.values]);

    // Sync JSON tab when switching to it
    useEffect(() => {
        if (activeTab === "json") {
            setJsonValue(JSON.stringify(editedValues, null, 2));
        }
    }, [activeTab]);

    const handleFieldChange = useCallback((path: string[], value: any) => {
        setEditedValues(prev => {
            const next = structuredClone(prev);
            let target = next;
            for (let i = 0; i < path.length - 1; i++) {
                target = target[path[i]];
            }
            target[path[path.length - 1]] = value;
            return next;
        });
    }, []);

    const handleFieldDelete = useCallback((path: string[]) => {
        setEditedValues(prev => {
            const next = structuredClone(prev);
            let target = next;
            for (let i = 0; i < path.length - 1; i++) {
                target = target[path[i]];
            }
            if (Array.isArray(target)) {
                target.splice(Number(path[path.length - 1]), 1);
            } else {
                delete target[path[path.length - 1]];
            }
            return next;
        });
    }, []);

    const handleFieldAdd = useCallback((parentPath: string[], key: string, type: FieldType) => {
        setEditedValues(prev => {
            const next = structuredClone(prev);
            let target = next;
            for (const p of parentPath) {
                target = target[p];
            }
            if (Array.isArray(target)) {
                target.push(defaultValueForType(type));
            } else {
                target[key] = defaultValueForType(type);
            }
            return next;
        });
    }, []);

    const handleSaveFields = useCallback(async () => {
        setSaving(true);
        setJsonError(null);
        try {
            const parentPath = document.path.substring(0, document.path.lastIndexOf("/"));
            const updated = await adminApi.updateDocument(
                projectId,
                parentPath,
                document.id,
                editedValues,
                databaseId
            );
            onDocumentUpdated(updated);
        } catch (e: any) {
            setJsonError(e.message);
        } finally {
            setSaving(false);
        }
    }, [editedValues, document, projectId, databaseId]);

    const handleSaveJson = useCallback(async () => {
        try {
            const parsed = JSON.parse(jsonValue);
            setEditedValues(parsed);
            setSaving(true);
            setJsonError(null);
            const parentPath = document.path.substring(0, document.path.lastIndexOf("/"));
            const updated = await adminApi.updateDocument(
                projectId,
                parentPath,
                document.id,
                parsed,
                databaseId
            );
            onDocumentUpdated(updated);
        } catch (e: any) {
            if (e instanceof SyntaxError) {
                setJsonError("Invalid JSON: " + e.message);
            } else {
                setJsonError(e.message);
            }
        } finally {
            setSaving(false);
        }
    }, [jsonValue, document, projectId, databaseId]);

    const handleDiscard = useCallback(() => {
        setEditedValues(structuredClone(document.values ?? {}));
        setJsonValue(JSON.stringify(document.values, null, 2));
        setJsonError(null);
    }, [document]);

    const handleDelete = useCallback(async () => {
        setDeleting(true);
        try {
            const parentPath = document.path.substring(0, document.path.lastIndexOf("/"));
            await adminApi.deleteDocument(projectId, parentPath, document.id, databaseId);
            setDeleteOpen(false);
            onDocumentDeleted?.();
            onClose();
        } catch (e: any) {
            setJsonError(e.message);
        } finally {
            setDeleting(false);
        }
    }, [document, projectId, databaseId, onClose, onDocumentDeleted]);

    const handleCopyPath = useCallback(() => {
        navigator.clipboard.writeText(document.path);
        setCopiedPath(true);
        setTimeout(() => setCopiedPath(false), 1500);
    }, [document.path]);

    return (
        <div className={cls(
            "flex flex-col h-full overflow-hidden",
            "bg-white dark:bg-surface-950"
        )}>
            {/* Header */}
            <div className={cls(
                "flex items-center gap-2 px-4 py-3",
                "border-b",
                defaultBorderMixin
            )}>
                <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-1">
                        <Typography variant="subtitle2" className="truncate font-mono">
                            {document.id}
                        </Typography>
                        <Tooltip title={copiedPath ? "Copied!" : "Copy path"}>
                            <IconButton size="smallest" onClick={handleCopyPath}>
                                <ContentCopyIcon size="smallest" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Open in Firebase Console">
                            <IconButton
                                size="smallest"
                                component="a"
                                href={`https://console.firebase.google.com/project/${projectId}/firestore/databases/${databaseId || "(default)"}/data/~2F${document.path.replace(/\//g, "~2F")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <OpenInNewIcon size="smallest" />
                            </IconButton>
                        </Tooltip>
                    </div>
                    <Typography variant="caption" color="secondary" className="truncate block">
                        {document.path}
                    </Typography>
                </div>
                <Tooltip title="Close">
                    <IconButton size="small" onClick={onClose}>
                        <CloseIcon size="small" />
                    </IconButton>
                </Tooltip>
            </div>

            {/* Metadata */}
            <div className={cls(
                "flex items-center gap-3 px-4 py-2 text-xs",
                "border-b",
                defaultBorderMixin,
                "bg-surface-50 dark:bg-surface-900"
            )}>
                {document.createTime && (
                    <span className="text-surface-500 dark:text-surface-400">
                        Created: {new Date(document.createTime).toLocaleString()}
                    </span>
                )}
                {document.updateTime && (
                    <span className="text-surface-500 dark:text-surface-400">
                        Updated: {new Date(document.updateTime).toLocaleString()}
                    </span>
                )}
            </div>

            {/* Subcollections */}
            <div className={cls(
                "flex items-center gap-2 px-4 py-2 min-h-[40px]",
                "border-b",
                defaultBorderMixin
            )}>
                <Typography variant="caption" color="secondary" className="flex-shrink-0">
                    Subcollections:
                </Typography>
                {subcollectionsLoading ? (
                    <Skeleton className="h-6 w-24 rounded" />
                ) : subcollections.length > 0 ? (
                    <div className="flex gap-1 flex-wrap">
                        {subcollections.map(sub => (
                            <Button
                                key={sub}
                                size="small"
                                variant="text"
                                startIcon={<KeyboardTabIcon size="smallest" />}
                                onClick={() => onNavigateToSubcollection(`${document.path}/${sub}`)}
                                className="text-xs"
                            >
                                {sub}
                            </Button>
                        ))}
                    </div>
                ) : (
                    <Typography variant="caption" color="disabled" className="italic">
                        None
                    </Typography>
                )}
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}
                className="px-4 pt-2">
                <Tab value="fields">Fields</Tab>
                <Tab value="json">JSON</Tab>
            </Tabs>

            {/* Tab content */}
            <div className="flex-grow overflow-y-auto">
                {activeTab === "fields" ? (
                    <div className="p-3">
                        <EditableFieldsView
                            values={editedValues}
                            path={[]}
                            onChange={handleFieldChange}
                            onDelete={handleFieldDelete}
                            onAdd={handleFieldAdd}
                        />
                    </div>
                ) : (
                    <div className="flex flex-col gap-2 p-3 h-full">
                        <textarea
                            value={jsonValue}
                            onChange={e => {
                                setJsonValue(e.target.value);
                                setJsonError(null);
                            }}
                            className={cls(
                                "flex-grow font-mono text-sm p-3 rounded-md resize-none min-h-[200px]",
                                "bg-surface-50 dark:bg-surface-900",
                                "border",
                                defaultBorderMixin,
                                "focus:outline-none focus:ring-2 focus:ring-primary",
                                "text-surface-800 dark:text-surface-100"
                            )}
                            spellCheck={false}
                        />
                    </div>
                )}
            </div>

            {/* Error */}
            {jsonError && (
                <div className={cls("px-4 py-2 border-t", defaultBorderMixin)}>
                    <Typography variant="caption" color="error">
                        {jsonError}
                    </Typography>
                </div>
            )}

            {/* Actions */}
            <div className={cls(
                "flex items-center gap-2 px-4 py-3",
                "border-t",
                defaultBorderMixin
            )}>
                <Tooltip title="Delete document">
                    <IconButton
                        size="small"
                        onClick={() => setDeleteOpen(true)}
                        className="text-surface-500 hover:text-red-500"
                    >
                        <DeleteIcon size="small" />
                    </IconButton>
                </Tooltip>
                <div className="flex-grow" />
                {isDirty && (
                    <Button
                        variant="text"
                        size="small"
                        onClick={handleDiscard}
                    >
                        Discard
                    </Button>
                )}
                <LoadingButton
                    size="small"
                    variant="filled"
                    color="primary"
                    loading={saving}
                    disabled={!isDirty && activeTab === "fields"}
                    startIcon={<SaveIcon size="small" />}
                    onClick={activeTab === "json" ? handleSaveJson : handleSaveFields}
                >
                    Save
                </LoadingButton>
            </div>

            {/* Delete confirmation */}
            <ConfirmationDialog
                open={deleteOpen}
                title="Delete document"
                body={
                    <Typography>
                        Are you sure you want to delete <strong>{document.id}</strong>?
                        This action cannot be undone.
                    </Typography>
                }
                loading={deleting}
                onAccept={handleDelete}
                onCancel={() => setDeleteOpen(false)}
            />
        </div>
    );
}
