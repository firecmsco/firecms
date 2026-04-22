import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    cls,
    Typography,
    Button,
    IconButton,
    Tooltip,
    Tabs,
    Tab,
    defaultBorderMixin,
    Skeleton,
    CloseIcon,
    DeleteIcon,
    SaveIcon,
    FolderIcon,
    LoadingButton,
    ContentCopyIcon,
    OpenInNewIcon,
    AddIcon,
} from "@firecms/ui";
import { ConfirmationDialog, jsonStringifyReplacer } from "@firecms/core";
import { useCreateFormex } from "@firecms/formex";
import { useAdminApi } from "./api/AdminApiProvider";
import { AdminDocument } from "./api/admin_api";
import { EditableFieldsView, defaultValueForType, isTimestamp, FieldType } from "./FieldEditor";

/**
 * Sentinel value sent to the backend to signal that a field should be deleted.
 * The backend converts this to FieldValue.delete().
 */
const FIRECMS_DELETE_FIELD = "__FIRECMS_DELETE_FIELD__";



const setIn = (obj: any, path: string[], value: any): any => {
    if (path.length === 0) return value;
    const [head, ...tail] = path;
    const clone = Array.isArray(obj) ? [...obj] : { ...obj };
    clone[head as any] = setIn(obj[head as any], tail, value);
    return clone;
};

const deleteIn = (obj: any, path: string[]): any => {
    if (path.length === 0) return obj;
    const [head, ...tail] = path;
    if (tail.length === 0) {
        if (Array.isArray(obj)) {
            const clone = [...obj];
            clone.splice(Number(head), 1);
            return clone;
        } else {
            const clone = { ...obj };
            delete clone[head];
            return clone;
        }
    }
    const clone = Array.isArray(obj) ? [...obj] : { ...obj };
    clone[head as any] = deleteIn(obj[head as any], tail);
    return clone;
};

const addIn = (obj: any, path: string[], key: string, type: FieldType): any => {
    if (path.length === 0) {
        if (Array.isArray(obj)) {
            return [...obj, defaultValueForType(type)];
        } else {
            return { ...obj, [key]: defaultValueForType(type) };
        }
    }
    const [head, ...tail] = path;
    const clone = Array.isArray(obj) ? [...obj] : { ...obj };
    clone[head as any] = addIn(obj[head as any], tail, key, type);
    return clone;
};

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
    initialFocusField,
    onDirtyChange,
}: {
    projectId: string;
    document: AdminDocument;
    databaseId?: string;
    onClose: () => void;
    onDocumentUpdated: (doc: AdminDocument) => void;
    onNavigateToSubcollection: (subPath: string) => void;
    onDocumentDeleted?: () => void;
    initialFocusField?: string | null;
    onDirtyChange?: (dirty: boolean) => void;
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
    const [addingSubcollection, setAddingSubcollection] = useState(false);
    const [newSubcollectionName, setNewSubcollectionName] = useState("");
    const subcollectionInputRef = useRef<HTMLInputElement>(null);

    const [copiedPath, setCopiedPath] = useState(false);

    const formex = useCreateFormex({
        initialValues: document.values ?? {},
        onSubmit: () => {}
    });
    
    const { values: editedValues, dirty: isDirty, setValues, resetForm } = formex;

    // Report dirty state changes to parent
    useEffect(() => {
        onDirtyChange?.(isDirty);
    }, [isDirty, onDirtyChange]);

    // Sync when document changes
    useEffect(() => {
        resetForm({ values: document.values ?? {} });
        setJsonValue(JSON.stringify(document.values ?? {}, jsonStringifyReplacer, 2));
        setJsonError(null);
    }, [document, resetForm]);

    // Load subcollections
    useEffect(() => {
        setSubcollectionsLoading(true);
        adminApi
            .listCollections(projectId, document.path, databaseId)
            .then(({ collections }) => setSubcollections(collections))
            .catch(() => setSubcollections([]))
            .finally(() => setSubcollectionsLoading(false));
    }, [document.path, projectId, databaseId]);

    // Sync JSON tab when switching to it
    useEffect(() => {
        if (activeTab === "json") {
            setJsonValue(JSON.stringify(editedValues, jsonStringifyReplacer, 2));
        }
    }, [activeTab, editedValues]);

    const handleFieldChange = useCallback((path: string[], value: any) => {
        setValues(setIn(editedValues, path, value));
    }, [editedValues, setValues]);

    const handleFieldDelete = useCallback((path: string[]) => {
        setValues(deleteIn(editedValues, path));
    }, [editedValues, setValues]);

    const handleFieldAdd = useCallback((parentPath: string[], key: string, type: FieldType) => {
        setValues(addIn(editedValues, parentPath, key, type));
    }, [editedValues, setValues]);

    const handleSaveFields = useCallback(async () => {
        setSaving(true);
        setJsonError(null);
        try {
            const parentPath = document.path.substring(0, document.path.lastIndexOf("/"));
            // Mark deleted top-level fields with the sentinel so the backend
            // can convert them to FieldValue.delete()
            const payload = { ...editedValues };
            const originalKeys = Object.keys(document.values ?? {});
            for (const key of originalKeys) {
                if (!(key in payload)) {
                    payload[key] = FIRECMS_DELETE_FIELD;
                }
            }
            const updated = await adminApi.updateDocument(
                projectId,
                parentPath,
                document.id,
                payload,
                databaseId
            );
            onDocumentUpdated(updated);
            resetForm({ values: updated.values });
        } catch (e: any) {
            setJsonError(e.message);
        } finally {
            setSaving(false);
        }
    }, [editedValues, document, projectId, databaseId, onDocumentUpdated, resetForm]);

    const handleSaveJson = useCallback(async () => {
        try {
            const parsed = JSON.parse(jsonValue);
            setValues(parsed);
            setSaving(true);
            setJsonError(null);
            const parentPath = document.path.substring(0, document.path.lastIndexOf("/"));
            // Mark deleted top-level fields with the sentinel
            const payload = { ...parsed };
            const originalKeys = Object.keys(document.values ?? {});
            for (const key of originalKeys) {
                if (!(key in payload)) {
                    payload[key] = FIRECMS_DELETE_FIELD;
                }
            }
            const updated = await adminApi.updateDocument(
                projectId,
                parentPath,
                document.id,
                payload,
                databaseId
            );
            onDocumentUpdated(updated);
            resetForm({ values: updated.values });
        } catch (e: any) {
            if (e instanceof SyntaxError) {
                setJsonError("Invalid JSON: " + e.message);
            } else {
                setJsonError(e.message);
            }
        } finally {
            setSaving(false);
        }
    }, [jsonValue, document, projectId, databaseId, onDocumentUpdated, resetForm, setValues]);

    const handleDiscard = useCallback(() => {
        resetForm({ values: document.values ?? {} });
        setJsonValue(JSON.stringify(document.values ?? {}, jsonStringifyReplacer, 2));
        setJsonError(null);
    }, [document, resetForm]);

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
                                href={`https://console.firebase.google.com/project/${projectId}/firestore/databases/${(databaseId || "(default)").replace("(default)", "-default-")}/data/~2F${document.path.replace(/\//g, "~2F")}`}
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
                "flex items-center gap-2 px-4 py-2 min-h-[44px]",
                "border-b",
                defaultBorderMixin
            )}>
                <Typography variant="caption" color="secondary" className="flex-shrink-0">
                    Subcollections:
                </Typography>
                {subcollectionsLoading ? (
                    <Skeleton width={64} height={16} className="rounded" />
                ) : (
                    <div className="flex gap-1 flex-wrap items-center">
                        {subcollections.map(sub => (
                            <Button
                                key={sub}
                                size="small"
                                variant="text"
                                startIcon={<FolderIcon size="smallest" className="text-amber-500 dark:text-amber-400" />}
                                onClick={() => onNavigateToSubcollection(`${document.path}/${sub}`)}
                                className="text-xs"
                            >
                                {sub}
                            </Button>
                        ))}
                        {addingSubcollection ? (
                            <input
                                ref={subcollectionInputRef}
                                type="text"
                                value={newSubcollectionName}
                                onChange={e => setNewSubcollectionName(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === "Enter") {
                                        const trimmed = newSubcollectionName.trim();
                                        if (trimmed) {
                                            setSubcollections(prev => [...prev, trimmed].sort());
                                            onNavigateToSubcollection(`${document.path}/${trimmed}`);
                                        }
                                        setAddingSubcollection(false);
                                        setNewSubcollectionName("");
                                    }
                                    if (e.key === "Escape") {
                                        setAddingSubcollection(false);
                                        setNewSubcollectionName("");
                                    }
                                }}
                                onBlur={() => {
                                    const trimmed = newSubcollectionName.trim();
                                    if (trimmed) {
                                        setSubcollections(prev => [...prev, trimmed].sort());
                                        onNavigateToSubcollection(`${document.path}/${trimmed}`);
                                    }
                                    setAddingSubcollection(false);
                                    setNewSubcollectionName("");
                                }}
                                placeholder="name"
                                className="bg-transparent border-b border-surface-300 dark:border-surface-600 text-sm text-text-primary dark:text-white outline-none py-0.5 font-mono w-28"
                                autoFocus
                            />
                        ) : (
                            <Tooltip title="Add subcollection">
                                <IconButton
                                    size="smallest"
                                    onClick={() => setAddingSubcollection(true)}
                                >
                                    <AddIcon size="smallest" />
                                </IconButton>
                            </Tooltip>
                        )}
                    </div>
                )}
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}
                className="px-4 pt-2">
                <Tab value="fields">Fields</Tab>
                <Tab value="json">JSON</Tab>
            </Tabs>

            {/* Tab content */}
            <div className="flex-grow overflow-y-auto min-h-0">
                {activeTab === "fields" ? (
                    <div className="p-3">
                        <EditableFieldsView
                            values={editedValues}
                            path={[]}
                            onChange={handleFieldChange}
                            onDelete={handleFieldDelete}
                            onAdd={handleFieldAdd}
                            autoFocusPath={initialFocusField}
                        />
                    </div>
                ) : (
                    <div className="flex flex-col h-full min-h-0">
                        <textarea
                            value={jsonValue}
                            onChange={e => {
                                setJsonValue(e.target.value);
                                setJsonError(null);
                            }}
                            className={cls(
                                "flex-grow w-full resize-none p-3",
                                "bg-surface-50 dark:bg-surface-900",
                                "text-text-primary dark:text-text-primary-dark",
                                "focus:outline-none",
                                "rounded-md",
                            )}
                            style={{
                                fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                                fontSize: "0.875rem",
                                lineHeight: "1.5",
                                tabSize: 2,
                            }}
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
