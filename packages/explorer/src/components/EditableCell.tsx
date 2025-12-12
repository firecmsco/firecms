import React, { useState, useEffect } from "react";
import { TextField, Typography } from "@firecms/ui";
import { DataType } from "../types";

interface EditableCellProps {
    value: any;
    fieldPath: string;
    dataType: DataType;
    onSave: (value: any) => Promise<void>;
}

/**
 * Editable table cell with inline editing and type validation
 */
export const EditableCell: React.FC<EditableCellProps> = ({
    value,
    fieldPath,
    dataType,
    onSave
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isEditing) {
            setEditValue(formatValueForEdit(value));
        }
    }, [isEditing, value]);

    const formatValueForDisplay = (val: any): string => {
        if (val === null || val === undefined) {
            return '';
        }
        if (typeof val === 'object') {
            return JSON.stringify(val);
        }
        return String(val);
    };

    const formatValueForEdit = (val: any): string => {
        if (val === null || val === undefined) {
            return '';
        }
        if (typeof val === 'object') {
            return JSON.stringify(val, null, 2);
        }
        return String(val);
    };

    const validateAndParse = (inputValue: string): { valid: boolean; parsed?: any; error?: string } => {
        if (inputValue === '') {
            return { valid: true, parsed: null };
        }

        try {
            switch (dataType) {
                case 'number':
                    const num = Number(inputValue);
                    if (isNaN(num)) {
                        return { valid: false, error: 'Invalid number' };
                    }
                    return { valid: true, parsed: num };

                case 'boolean':
                    const lower = inputValue.toLowerCase();
                    if (lower === 'true') return { valid: true, parsed: true };
                    if (lower === 'false') return { valid: true, parsed: false };
                    return { valid: false, error: 'Must be true or false' };

                case 'array':
                case 'map':
                    try {
                        const parsed = JSON.parse(inputValue);
                        if (dataType === 'array' && !Array.isArray(parsed)) {
                            return { valid: false, error: 'Must be a valid array' };
                        }
                        if (dataType === 'map' && (typeof parsed !== 'object' || Array.isArray(parsed))) {
                            return { valid: false, error: 'Must be a valid object' };
                        }
                        return { valid: true, parsed };
                    } catch (e) {
                        return { valid: false, error: 'Invalid JSON' };
                    }

                case 'string':
                default:
                    return { valid: true, parsed: inputValue };
            }
        } catch (e) {
            return { valid: false, error: 'Invalid value' };
        }
    };

    const handleSave = async () => {
        const validation = validateAndParse(editValue);
        
        if (!validation.valid) {
            setError(validation.error || 'Invalid value');
            return;
        }

        try {
            setIsSaving(true);
            setError(null);
            await onSave(validation.parsed);
            setIsEditing(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setError(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSave();
        } else if (e.key === 'Escape') {
            handleCancel();
        }
    };

    if (isEditing) {
        return (
            <div style={{ padding: '4px', minWidth: '150px' }}>
                <TextField
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={handleSave}
                    autoFocus
                    size="small"
                    error={!!error}
                    disabled={isSaving}
                    style={{ width: '100%' }}
                />
                {error && (
                    <Typography
                        variant="caption"
                        style={{ color: '#ef4444', fontSize: '10px', marginTop: '2px' }}
                    >
                        {error}
                    </Typography>
                )}
            </div>
        );
    }

    return (
        <div
            onClick={() => setIsEditing(true)}
            style={{
                padding: '8px 12px',
                cursor: 'pointer',
                minHeight: '32px',
                minWidth: '100px',
                borderRadius: '4px',
                transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
            }}
        >
            <Typography
                variant="body2"
                style={{
                    fontSize: '13px',
                    color: value === null || value === undefined ? '#9ca3af' : '#374151',
                    fontStyle: value === null || value === undefined ? 'italic' : 'normal',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                }}
            >
                {formatValueForDisplay(value) || '(empty)'}
            </Typography>
        </div>
    );
};
