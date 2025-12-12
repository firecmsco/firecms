import React, { useState } from "react";
import { Paper, Typography, Button, CircularProgress } from "@firecms/ui";
import { DocumentData } from "../types";

interface JsonViewProps {
    documents: DocumentData[];
    onDocumentEdit: (docId: string, newData: any) => Promise<void>;
    onExploreSubcollections?: (documentId: string) => void;
    loading?: boolean;
}

/**
 * JSON view for displaying and editing documents as JSON
 */
export const JsonView: React.FC<JsonViewProps> = ({
    documents,
    onDocumentEdit,
    onExploreSubcollections,
    loading = false
}) => {
    const [editingDocId, setEditingDocId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                <CircularProgress />
            </div>
        );
    }

    if (documents.length === 0) {
        return (
            <Paper style={{ padding: '40px', textAlign: 'center' }}>
                <Typography variant="body1" style={{ color: '#6b7280' }}>
                    No documents found in this collection
                </Typography>
            </Paper>
        );
    }

    const handleEdit = (doc: DocumentData) => {
        setEditingDocId(doc.id);
        setEditValue(JSON.stringify(doc.data, null, 2));
        setError(null);
    };

    const handleSave = async (docId: string) => {
        try {
            const parsed = JSON.parse(editValue);
            setIsSaving(true);
            setError(null);
            await onDocumentEdit(docId, parsed);
            setEditingDocId(null);
        } catch (err) {
            if (err instanceof SyntaxError) {
                setError('Invalid JSON syntax');
            } else {
                setError(err instanceof Error ? err.message : 'Failed to save');
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setEditingDocId(null);
        setError(null);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {documents.map((doc) => (
                <Paper key={doc.id} style={{ padding: '16px' }}>
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: '12px'
                    }}>
                        <Typography variant="subtitle2" style={{ fontFamily: 'monospace', color: '#6b7280' }}>
                            {doc.id}
                        </Typography>
                        {editingDocId !== doc.id && (
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={() => handleEdit(doc)}
                            >
                                ✏️ Edit
                            </Button>
                        )}
                    </div>

                    {editingDocId === doc.id ? (
                        <div>
                            <textarea
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                style={{
                                    width: '100%',
                                    minHeight: '300px',
                                    fontFamily: 'monospace',
                                    fontSize: '13px',
                                    padding: '12px',
                                    border: error ? '2px solid #ef4444' : '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    backgroundColor: '#f9fafb',
                                    resize: 'vertical'
                                }}
                                disabled={isSaving}
                            />
                            {error && (
                                <Typography
                                    variant="caption"
                                    style={{ color: '#ef4444', marginTop: '8px', display: 'block' }}
                                >
                                    {error}
                                </Typography>
                            )}
                            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                                <Button
                                    variant="filled"
                                    size="small"
                                    onClick={() => handleSave(doc.id)}
                                    disabled={isSaving}
                                >
                                    {isSaving ? 'Saving...' : '💾 Save'}
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={handleCancel}
                                    disabled={isSaving}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <pre
                            style={{
                                fontFamily: 'monospace',
                                fontSize: '13px',
                                backgroundColor: '#f9fafb',
                                padding: '12px',
                                borderRadius: '6px',
                                overflow: 'auto',
                                maxHeight: '400px',
                                margin: 0
                            }}
                        >
                            {JSON.stringify(doc.data, null, 2)}
                        </pre>
                    )}
                </Paper>
            ))}
        </div>
    );
};
