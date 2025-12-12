import React from "react";
import { Tooltip } from "@firecms/ui";
import { DataType } from "../types";

interface TypeIndicatorProps {
    dataType: DataType;
    hasConflict?: boolean;
    conflictingTypes?: DataType[];
    size?: "small" | "medium";
}

/**
 * Visual indicator for data types with icons
 */
export const TypeIndicator: React.FC<TypeIndicatorProps> = ({
    dataType,
    hasConflict = false,
    conflictingTypes,
    size = "small"
}) => {
    const getTypeInfo = (type: DataType): { icon: string; label: string; color: string } => {
        switch (type) {
            case 'string':
                return { icon: '📝', label: 'String', color: '#3b82f6' };
            case 'number':
                return { icon: '🔢', label: 'Number', color: '#10b981' };
            case 'boolean':
                return { icon: '✓', label: 'Boolean', color: '#8b5cf6' };
            case 'timestamp':
                return { icon: '🕐', label: 'Timestamp', color: '#f59e0b' };
            case 'reference':
                return { icon: '🔗', label: 'Reference', color: '#ec4899' };
            case 'geopoint':
                return { icon: '📍', label: 'GeoPoint', color: '#ef4444' };
            case 'array':
                return { icon: '[]', label: 'Array', color: '#6366f1' };
            case 'map':
                return { icon: '{}', label: 'Map', color: '#14b8a6' };
            case 'null':
                return { icon: '∅', label: 'Null', color: '#6b7280' };
            default:
                return { icon: '?', label: 'Unknown', color: '#9ca3af' };
        }
    };

    const typeInfo = getTypeInfo(dataType);
    const fontSize = size === 'small' ? '12px' : '16px';

    const tooltipContent = hasConflict && conflictingTypes
        ? `Multiple types: ${conflictingTypes.map(t => getTypeInfo(t).label).join(', ')}`
        : typeInfo.label;

    return (
        <Tooltip title={tooltipContent}>
            <span
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize,
                    fontWeight: 600,
                    color: typeInfo.color,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    backgroundColor: hasConflict ? '#fef3c7' : 'transparent',
                    border: hasConflict ? '1px solid #f59e0b' : 'none',
                    cursor: 'help'
                }}
            >
                {typeInfo.icon}
            </span>
        </Tooltip>
    );
};
