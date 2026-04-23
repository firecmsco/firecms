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

interface DeleteCollectionDialogProps {
    open: boolean;
    collectionPath: string;
    projectId: string;
    databaseId?: string;
    onClose: () => void;
    onDeleted: (collectionPath: string) => void;
}

/**
 * A confirmation dialog for deleting a Firestore collection.
 * Requires typing the collection name to confirm.
 * Tracks deletion progress in real-time via onSnapshot.
 */
export function DeleteCollectionDialog({
    open,
    collectionPath,
    projectId,
    databaseId,
    onClose,
    onDeleted,
}: DeleteCollectionDialogProps) {
    const adminApi = useAdminApi();
    const firestore = useBackendFirestore();
    const snackbar = useSnackbarController();

    const collectionName = collectionPath.split("/").pop() ?? "";
    const [confirmText, setConfirmText] = useState("");
    const [jobId, setJobId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const job = useAdminJob(firestore, projectId, jobId);

    const isConfirmed = confirmText === collectionName;

    // Reset state when dialog opens/closes
    useEffect(() => {
        if (open) {
            setConfirmText("");
            setJobId(null);
            setError(null);
            setSubmitting(false);
        }
    }, [open]);

    // When job completes, notify parent and show snackbar
    useEffect(() => {
        if (job?.status === "completed") {
            snackbar.open({
                type: "success",
                message: `Collection "${collectionPath}" deleted (${job.progress.processed} documents)`,
            });
            onDeleted(collectionPath);
        } else if (job?.status === "failed") {
            setError(job.error ?? "Deletion failed");
            setSubmitting(false);
            snackbar.open({
                type: "error",
                message: `Failed to delete "${collectionPath}": ${job.error ?? "Unknown error"}`,
            });
        }
    }, [job?.status]);

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
            setJobId(result.jobId);
        } catch (e: any) {
            setError(e.message ?? "Failed to start deletion");
            setSubmitting(false);
        }
    }, [adminApi, projectId, collectionPath, databaseId, isConfirmed]);

    const isRunning = job?.status === "running";
    const isCompleted = job?.status === "completed";

    // Calculate percentage for progress bar
    const percentage = (job?.progress.total && job.progress.total > 0)
        ? Math.min(100, Math.round((job.progress.processed / job.progress.total) * 100))
        : null;

    return (
        <Dialog
            open={open}
            onOpenChange={(open) => {
                if (!open && !isRunning) onClose();
            }}
        >
            <DialogContent className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                    <DeleteIcon color="error" />
                    <Typography variant="h6">
                        Delete collection
                    </Typography>
                </div>

                {!isCompleted && (
                    <>
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
                    </>
                )}

                {isRunning && job && (
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <Typography variant="body2" color="secondary">
                                {job.progress.message ?? "Deleting..."}
                            </Typography>
                            {percentage !== null && (
                                <Typography variant="body2" className="font-mono font-medium text-primary">
                                    {percentage}%
                                </Typography>
                            )}
                        </div>
                        <div className="w-full bg-surface-200 dark:bg-surface-700 rounded-full h-2.5 overflow-hidden">
                            <div
                                className="bg-primary h-2.5 rounded-full transition-all duration-500 ease-out"
                                style={{
                                    width: percentage !== null ? `${percentage}%` : "15%",
                                    ...(percentage === null && {
                                        animation: "pulse 2s ease-in-out infinite",
                                    }),
                                }}
                            />
                        </div>
                        <Typography variant="caption" color="disabled">
                            {job.progress.processed} of {job.progress.total ?? "?"} documents deleted
                        </Typography>
                    </div>
                )}

                {isCompleted && job && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                        <span className="text-green-600 dark:text-green-400 text-lg">✓</span>
                        <Typography variant="body2" className="text-green-700 dark:text-green-300">
                            {job.progress.message ?? `Deleted ${job.progress.processed} documents`}
                        </Typography>
                    </div>
                )}

                {!isRunning && !isCompleted && (
                    <>
                        <Typography variant="body2">
                            Type <strong>{collectionName}</strong> to confirm:
                        </Typography>
                        <TextField
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            placeholder={collectionName}
                            size="small"
                            autoFocus
                            disabled={submitting}
                        />
                    </>
                )}

                {error && (
                    <Typography variant="body2" color="error">
                        {error}
                    </Typography>
                )}
            </DialogContent>

            <DialogActions>
                {isCompleted ? (
                    <Button onClick={onClose} variant="text">
                        Close
                    </Button>
                ) : (
                    <>
                        <Button
                            onClick={onClose}
                            variant="text"
                            disabled={isRunning}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDelete}
                            color="error"
                            disabled={!isConfirmed || submitting || isRunning}
                            startIcon={<DeleteIcon size="small" />}
                        >
                            {isRunning ? "Deleting..." : "Delete"}
                        </Button>
                    </>
                )}
            </DialogActions>
        </Dialog>
    );
}
