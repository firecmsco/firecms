import React from "react";
import { Typography } from "@firecms/ui";
import { TypeIndicator } from "./TypeIndicator";
import { InferredField } from "../types";

interface ColumnHeaderProps {
    field: InferredField;
}

/**
 * Table column header with field name and type indicator
 * Applies visual styling for sparse fields
 */
export const ColumnHeader: React.FC<ColumnHeaderProps> = ({ field }) => {
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderBottom: field.isSparse ? '2px dashed #d1d5db' : '2px solid #e5e7eb',
                backgroundColor: field.isSparse ? '#f9fafb' : 'transparent',
                minWidth: '120px'
            }}
        >
            <TypeIndicator
                dataType={field.dataType}
                hasConflict={field.hasTypeConflict}
                conflictingTypes={field.conflictingTypes}
                size="small"
            />
            <Typography
                variant="caption"
                style={{
                    fontWeight: 600,
                    color: field.isSparse ? '#6b7280' : '#374151',
                    fontSize: '12px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                }}
            >
                {field.name}
            </Typography>
            {field.isSparse && (
                <Typography
                    variant="caption"
                    style={{
                        fontSize: '10px',
                        color: '#9ca3af',
                        fontStyle: 'italic'
                    }}
                >
                    ({field.occurrenceCount})
                </Typography>
            )}
        </div>
    );
};
