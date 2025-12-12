import React from "react";
import { Paper, Typography, CircularProgress } from "@firecms/ui";
import { ColumnHeader } from "./ColumnHeader";
import { EditableCell } from "./EditableCell";
import { DocumentData, InferredSchema } from "../types";

interface TableViewProps {
    documents: DocumentData[];
    schema: InferredSchema;
    onCellEdit: (docId: string, field: string, value: any) => Promise<void>;
    loading?: boolean;
}

/**
 * Table view for displaying documents with auto-inferred columns
 */
export const TableView: React.FC<TableViewProps> = ({
    documents,
    schema,
    onCellEdit,
    loading = false
}) => {
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

    if (schema.fields.length === 0) {
        return (
            <Paper style={{ padding: '40px', textAlign: 'center' }}>
                <Typography variant="body1" style={{ color: '#6b7280' }}>
                    No fields discovered in documents
                </Typography>
            </Paper>
        );
    }

    const getFieldValue = (doc: DocumentData, fieldPath: string): any => {
        const keys = fieldPath.split('.');
        let value: any = doc.data;
        
        for (const key of keys) {
            if (value === null || value === undefined) {
                return undefined;
            }
            value = value[key];
        }
        
        return value;
    };

    const formatArrayValue = (value: any[]): string => {
        if (value.length === 0) return '[]';
        if (value.length <= 3) {
            return `[${value.map(v => typeof v === 'object' ? JSON.stringify(v) : String(v)).join(', ')}]`;
        }
        return `[${value.length} items]`;
    };

    const renderCellValue = (doc: DocumentData, field: any) => {
        const value = getFieldValue(doc, field.path);
        
        // Handle arrays specially for display
        if (Array.isArray(value)) {
            return (
                <div style={{ padding: '8px 12px' }}>
                    <Typography
                        variant="body2"
                        style={{
                            fontSize: '13px',
                            color: '#374151',
                            fontFamily: 'monospace'
                        }}
                    >
                        {formatArrayValue(value)}
                    </Typography>
                </div>
            );
        }

        return (
            <EditableCell
                value={value}
                fieldPath={field.path}
                dataType={field.dataType}
                onSave={async (newValue) => {
                    await onCellEdit(doc.id, field.path, newValue);
                }}
            />
        );
    };

    return (
        <Paper style={{ overflow: 'auto', maxHeight: '70vh' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 10 }}>
                    <tr>
                        <th style={{ 
                            padding: '8px 12px', 
                            borderBottom: '2px solid #e5e7eb',
                            textAlign: 'left',
                            minWidth: '150px',
                            backgroundColor: '#f9fafb'
                        }}>
                            <Typography variant="caption" style={{ fontWeight: 600, fontSize: '12px' }}>
                                Document ID
                            </Typography>
                        </th>
                        {schema.fields.map((field) => (
                            <th key={field.path} style={{ textAlign: 'left' }}>
                                <ColumnHeader field={field} />
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {documents.map((doc) => (
                        <tr
                            key={doc.id}
                            style={{
                                borderBottom: '1px solid #e5e7eb',
                                transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#f9fafb';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                        >
                            <td style={{ 
                                padding: '8px 12px',
                                fontFamily: 'monospace',
                                fontSize: '12px',
                                color: '#6b7280',
                                maxWidth: '200px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            }}>
                                {doc.id}
                            </td>
                            {schema.fields.map((field) => (
                                <td key={field.path}>
                                    {renderCellValue(doc, field)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            <div style={{ padding: '12px', borderTop: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                <Typography variant="caption" style={{ color: '#6b7280' }}>
                    Showing {documents.length} document{documents.length !== 1 ? 's' : ''} with {schema.fields.length} field{schema.fields.length !== 1 ? 's' : ''}
                </Typography>
            </div>
        </Paper>
    );
};
