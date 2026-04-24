import React, { useCallback, useEffect, useState } from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    TextField,
    Typography,
    DeleteIcon,
} from "@firecms/ui";
import { useSnackbarController } from "@firecms/core";
import { useAdminApi, useBackendFirestore } from "./api/AdminApiProvider";
import { useAdminJob } from "./hooks/useAdminJob";

export function AdminJobSnackbarTracker({
    jobId,
    projectId,
    collectionPath,
    onFinished,
}: {
    jobId: string;
    projectId: string;
    collectionPath: string;
    onFinished: (jobId: string) => void;
}) {
    const firestore = useBackendFirestore();
    const job = useAdminJob(firestore, projectId, jobId);
    const snackbar = useSnackbarController();

    useEffect(() => {
        if (job?.status === "completed") {
            snackbar.open({
                type: "success",
                message: `Collection "${collectionPath}" deleted successfully`,
            });
            onFinished(jobId);
        } else if (job?.status === "failed") {
            snackbar.open({
                type: "error",
                message: `Failed to delete "${collectionPath}": ${job.error ?? "Unknown error"}`,
            });
            onFinished(jobId);
        }
    }, [job?.status, jobId, collectionPath, snackbar, onFinished]);

    return null;
}


interface DeleteCollectionDialogProps {
    open: boolean;
    collectionPath: string;
    projectId: string;
    databaseId?: string;
    onClose: () => void;
    onJobCreated: (jobId: string, path: string) => void;
}

/**
 * A confirmation dialog for deleting a Firestore collection.
 * Requires typing the collection name to confirm.
 */
export function DeleteCollectionDialog({
    open,
    collectionPath,
    projectId,
    databaseId,
    onClose,
    onJobCreated,
}: DeleteCollectionDialogProps) {
    const adminApi = useAdminApi();
    const snackbar = useSnackbarController();

    const collectionName = collectionPath.split("/").pop() ?? "";
    const [confirmText, setConfirmText] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const isConfirmed = confirmText === collectionName;

    // Reset state when dialog opens/closes
    useEffect(() => {
        if (open) {
            setConfirmText("");
            setError(null);
            setSubmitting(false);
        }
    }, [open]);

    const handleDelete = useCallback(async () => {
        if (!isConfirmed) return;
        setSubmitting(true);
        setError(null);

        try {
            const result = await adminApi.createJob(
                projectId,
                "delete_collection",
                { collectionPath },
                databaseId
            );
            snackbar.open({
                type: "success",
                message: `Started deleting collection "${collectionPath}"...`,
            });
            onJobCreated(result.jobId, collectionPath);
            onClose();
        } catch (e: any) {
            setError(e.message ?? "Failed to start deletion");
            setSubmitting(false);
        }
    }, [adminApi, projectId, collectionPath, databaseId, isConfirmed, snackbar, onJobCreated, onClose]);

    return (
        <Dialog open={open} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                    <DeleteIcon color="error" />
                    <Typography variant="h6">
                        Delete collection
                    </Typography>
                </div>

                <Typography variant="body2" color="secondary">
                    This will permanently delete <strong>all documents</strong> and
                    subcollections in:
                </Typography>

                <div className="bg-surface-100 dark:bg-surface-800 rounded px-3 py-2">
                    <Typography variant="body2" className="font-mono">
                        {collectionPath}
                    </Typography>
                </div>

                <Typography variant="body2" color="error">
                    This action cannot be undone.
                </Typography>

                <Typography variant="body2">
                    Type <strong>{collectionName}</strong> to confirm:
                </Typography>
                <TextField
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && isConfirmed && !submitting) {
                            e.preventDefault();
                            handleDelete();
                        }
                    }}
                    placeholder={collectionName}
                    size="small"
                    autoFocus
                    disabled={submitting}
                />

                {error && (
                    <Typography variant="body2" color="error">
                        {error}
                    </Typography>
                )}
            </DialogContent>

            <DialogActions>
                <Button
                    onClick={onClose}
                    variant="text"
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleDelete}
                    color="error"
                    disabled={!isConfirmed || submitting}
                    startIcon={<DeleteIcon size="small" />}
                >
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
    );
}
