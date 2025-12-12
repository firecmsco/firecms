import React, { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    TextField
} from "@firecms/ui";

interface DocumentEditorProps {
    open: boolean;
    mode: 'create' | 'delete';
    documentId?: string;
    onClose: () => void;
    onCreate?: (data: Record<string, any>, id?: string) => Promise<void>;
    onDelete?: () => Promise<void>;
}

/**
 * Modal for creating and deleting documents
 */
export const DocumentEditor: React.FC<DocumentEditorProps> = ({
    open,
    mode,
    documentId,
    onClose,
    onCreate,
    onDelete
}) => {
    const [jsonData, setJsonData] = useState('{\n  \n}');
    const [customId, setCustomId] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleCreate = async () => {
        if (!onCreate) return;

        try {
            setError(null);
            const parsed = JSON.parse(jsonData);
            
            if (typeof parsed !== 'object' || Array.isArray(parsed)) {
                setError('Document data must be a valid object');
                return;
            }

            setIsProcessing(true);
            await onCreate(parsed, customId || undefined);
            onClose();
            setJsonData('{\n  \n}');
            setCustomId('');
        } catch (err) {
            if (err instanceof SyntaxError) {
                setError('Invalid JSON syntax');
            } else {
                setError(err instanceof Error ? err.message : 'Failed to create document');
            }
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDelete = async () => {
        if (!onDelete) return;

        try {
            setError(null);
            setIsProcessing(true);
            await onDelete();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete document');
        } finally {
            setIsProcessing(false);
        }
    };

    if (mode === 'delete') {
        return (
            <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
                <DialogTitle>Delete Document</DialogTitle>
                <DialogContent>
                    <Typography variant="body1">
                        Are you sure you want to delete document <strong>{documentId}</strong>?
                    </Typography>
                    <Typography variant="body2" className="mt-2 text-text-secondary dark:text-text-secondary-dark">
                        This action cannot be undone.
                    </Typography>
                    {error && (
                        <Typography
                            variant="caption"
                            className="mt-3 block text-red-600 dark:text-red-400"
                        >
                            {error}
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        variant="text"
                        color="neutral"
                        onClick={onClose}
                        disabled={isProcessing}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="filled"
                        color="error"
                        onClick={handleDelete}
                        disabled={isProcessing}
                    >
                        {isProcessing ? 'Deleting...' : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
            <DialogTitle>Create New Document</DialogTitle>
            <DialogContent>
                <div className="flex flex-col gap-4 min-w-[500px]">
                    <div>
                        <Typography variant="caption" className="mb-1 block text-text-secondary dark:text-text-secondary-dark">
                            Document ID (optional - auto-generated if empty)
                        </Typography>
                        <TextField
                            value={customId}
                            onChange={(e) => setCustomId(e.target.value)}
                            placeholder="Leave empty for auto-generated ID"
                            size="small"
                            className="w-full"
                            disabled={isProcessing}
                        />
                    </div>

                    <div>
                        <Typography variant="caption" className="mb-1 block text-text-secondary dark:text-text-secondary-dark">
                            Document Data (JSON)
                        </Typography>
                        <textarea
                            value={jsonData}
                            onChange={(e) => setJsonData(e.target.value)}
                            className={`w-full min-h-[300px] font-mono text-sm p-3 rounded-md resize-y
                                ${error 
                                    ? 'border-2 border-red-500' 
                                    : 'border border-surface-300 dark:border-surface-600'
                                }
                                bg-surface-50 dark:bg-surface-800 
                                text-text-primary dark:text-text-primary-dark
                                focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                                disabled:opacity-50 disabled:cursor-not-allowed
                            `}
                            disabled={isProcessing}
                        />
                    </div>

                    {error && (
                        <Typography
                            variant="caption"
                            className="text-red-600 dark:text-red-400"
                        >
                            {error}
                        </Typography>
                    )}
                </div>
            </DialogContent>
            <DialogActions>
                <Button
                    variant="text"
                    color="neutral"
                    onClick={onClose}
                    disabled={isProcessing}
                >
                    Cancel
                </Button>
                <Button
                    variant="filled"
                    color="primary"
                    onClick={handleCreate}
                    disabled={isProcessing}
                >
                    {isProcessing ? 'Creating...' : 'Create'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
