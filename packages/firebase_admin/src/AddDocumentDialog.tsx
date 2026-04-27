import React, { useCallback, useState } from "react";
import {
    cls,
    Typography,
    Button,
    TextField,
    defaultBorderMixin,
    LoadingButton,
    SaveIcon,
    DialogActions,
    Dialog,
} from "@firecms/ui";
import { useAdminApi } from "./api/AdminApiProvider";
import { EditableFieldsView, defaultValueForType, FieldType } from "./FieldEditor";

export function AddDocumentDialog({
    open,
    projectId,
    collectionPath,
    databaseId,
    onClose,
    onDocumentCreated,
    initialData,
    initialId,
    onAnalyticsEvent,
}: {
    open: boolean;
    projectId: string;
    collectionPath: string;
    databaseId?: string;
    onClose: () => void;
    onDocumentCreated: () => void;
    initialData?: Record<string, any>;
    initialId?: string;
    onAnalyticsEvent?: (eventName: string, params?: Record<string, any>) => void;
}) {
    const adminApi = useAdminApi();
    const [documentId, setDocumentId] = useState(initialId ?? "");
    const [values, setValues] = useState<Record<string, any>>(initialData ?? {});
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Re-sync when dialog opens with new initial data
    React.useEffect(() => {
        if (open) {
            setDocumentId(initialId ?? "");
            setValues(initialData ? structuredClone(initialData) : {});
            setError(null);
        }
    }, [open, initialData, initialId]);

    // ── Field mutation helpers (same pattern as DocumentPanel) ──
    const handleFieldChange = useCallback((path: string[], newValue: any) => {
        setValues(prev => {
            const updated = structuredClone(prev);
            let target: any = updated;
            for (let i = 0; i < path.length - 1; i++) {
                target = target[path[i]];
            }
            const lastKey = path[path.length - 1];
            if (Array.isArray(target)) {
                target[parseInt(lastKey)] = newValue;
            } else {
                target[lastKey] = newValue;
            }
            return updated;
        });
    }, []);

    const handleFieldDelete = useCallback((path: string[]) => {
        setValues(prev => {
            const updated = structuredClone(prev);
            let target: any = updated;
            for (let i = 0; i < path.length - 1; i++) {
                target = target[path[i]];
            }
            const lastKey = path[path.length - 1];
            if (Array.isArray(target)) {
                target.splice(parseInt(lastKey), 1);
            } else {
                delete target[lastKey];
            }
            return updated;
        });
    }, []);

    const handleFieldAdd = useCallback((parentPath: string[], key: string, type: FieldType) => {
        setValues(prev => {
            const updated = structuredClone(prev);
            let target: any = updated;
            for (const p of parentPath) {
                target = target[p];
            }
            if (Array.isArray(target)) {
                target.push(defaultValueForType(type));
            } else {
                target[key] = defaultValueForType(type);
            }
            return updated;
        });
    }, []);

    const handleCreate = useCallback(async () => {
        setError(null);
        setSaving(true);
        try {
            await adminApi.createDocument(
                projectId,
                collectionPath,
                values,
                documentId.trim() || undefined,
                databaseId
            );
            setDocumentId("");
            setValues({});
            onAnalyticsEvent?.("document_created", { projectId, collectionPath, documentId: documentId.trim() || "(auto)" });
            onDocumentCreated();
            onClose();
        } catch (e: any) {
            setError(e.message);
        } finally {
            setSaving(false);
        }
    }, [values, documentId, projectId, collectionPath, databaseId, onAnalyticsEvent]);

    return (
        <Dialog
            open={open}
            onOpenChange={(open) => {
                if (!open) {
                    setError(null);
                    onClose();
                }
            }}
            maxWidth={"2xl"}
        >
            <div className="p-6 flex flex-col gap-4 min-w-[500px]">
                <Typography variant="h6">
                    {initialData ? "Duplicate document" : "Add document"}
                </Typography>

                <Typography variant="body2" color="secondary">
                    Collection: <strong>{collectionPath}</strong>
                </Typography>

                <TextField
                    size="small"
                    label="Document ID (optional)"
                    placeholder="Auto-generated if empty"
                    value={documentId}
                    onChange={(e) => setDocumentId(e.target.value)}
                />

                {/* Field editor — same view as edit mode */}
                <div className={cls(
                    "border rounded-lg overflow-y-auto max-h-[400px] p-2",
                    defaultBorderMixin,
                )}>
                    <EditableFieldsView
                        values={values}
                        path={[]}
                        onChange={handleFieldChange}
                        onDelete={handleFieldDelete}
                        onAdd={handleFieldAdd}
                    />
                </div>

                {error && (
                    <Typography variant="caption" color="error">
                        {error}
                    </Typography>
                )}
            </div>

            <DialogActions>
                <Button
                    variant="text"
                    onClick={() => {
                        setError(null);
                        onClose();
                    }}
                >
                    Cancel
                </Button>
                <LoadingButton
                    loading={saving}
                    startIcon={<SaveIcon size="small" />}
                    onClick={handleCreate}
                >
                    {initialData ? "Duplicate" : "Create"}
                </LoadingButton>
            </DialogActions>
        </Dialog>
    );
}
