import React, { useCallback, useState } from "react";
import { Popover, Button, Typography, Select, SelectItem, defaultBorderMixin, cls, IconButton, CloseIcon } from "@firecms/ui";
import { FieldType, fieldTypeFromValue, convertValue, InlineValueEditor, EditableFieldsView, defaultValueForType, isReference, normalizeReference } from "./FieldEditor";
import { ReferenceEditor } from "./ReferenceEditor";

export function PopoverCellEditor({
    columnKey,
    initialValue,
    onSave,
    onCancel,
}: {
    columnKey: string;
    initialValue: any;
    onSave: (val: any) => Promise<void>;
    onCancel: () => void;
}) {
    const [editedValue, setEditedValue] = useState(structuredClone(initialValue));
    const [saving, setSaving] = useState(false);
    
    // We always determine the current type from the value
    const type = fieldTypeFromValue(editedValue);

    const handleTypeChange = (newType: FieldType) => {
        setEditedValue(convertValue(editedValue, newType));
    };

    const handleFieldChange = useCallback((path: string[], value: any) => {
        setEditedValue((prev: any) => {
            if (path.length === 0) return value;
            const next = structuredClone(prev);
            let target = next;
            for (let i = 0; i < path.length - 1; i++) {
                target = target[path[i]];
            }
            target[path[path.length - 1]] = value;
            return next;
        });
    }, []);

    const handleFieldDelete = useCallback((path: string[]) => {
        setEditedValue((prev: any) => {
            if (path.length === 0) return null;
            const next = structuredClone(prev);
            let target = next;
            for (let i = 0; i < path.length - 1; i++) {
                target = target[path[i]];
            }
            if (Array.isArray(target)) {
                target.splice(Number(path[path.length - 1]), 1);
            } else {
                delete target[path[path.length - 1]];
            }
            return next;
        });
    }, []);

    const handleFieldAdd = useCallback((parentPath: string[], key: string, newType: FieldType) => {
        setEditedValue((prev: any) => {
            const next = structuredClone(prev);
            let target = next;
            for (const p of parentPath) {
                target = target[p];
            }
            if (Array.isArray(target)) {
                target.push(defaultValueForType(newType));
            } else {
                target[key] = defaultValueForType(newType);
            }
            return next;
        });
    }, []);

    const isExpandable = type === "map" || type === "array";

    return (
        <div className={cls("flex flex-col bg-surface-50 dark:bg-surface-950 rounded-md shadow-xl text-text-primary dark:text-white overflow-hidden", defaultBorderMixin)}
             style={{ width: isExpandable ? 560 : 400, maxWidth: '90vw', maxHeight: 'var(--radix-popover-content-available-height, 60vh)' }}
             onClick={e => e.stopPropagation()}>
            
            {/* Header - Fixed height 44px */}
            <div className="flex items-center gap-2 px-3 h-[44px] flex-shrink-0 border-b border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-900">
                <Typography variant="subtitle2" className="flex-grow min-w-0 truncate font-mono text-sm">
                    {columnKey}
                </Typography>
                <Select size="smallest" value={type} onValueChange={(t) => handleTypeChange(t as FieldType)} className="w-[110px] flex-shrink-0">
                    <SelectItem value="string">String</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="boolean">Boolean</SelectItem>
                    <SelectItem value="null">Null</SelectItem>
                    <SelectItem value="map">Map</SelectItem>
                    <SelectItem value="array">Array</SelectItem>
                    <SelectItem value="timestamp">Timestamp</SelectItem>
                    <SelectItem value="geopoint">Geopoint</SelectItem>
                    <SelectItem value="reference">Reference</SelectItem>
                </Select>
                <IconButton size="small" onClick={onCancel} disabled={saving}><CloseIcon size="small"/></IconButton>
            </div>
            
            {/* Body */}
            <div className="w-full overflow-y-auto flex-grow min-h-0 flex flex-col p-3">
                {isExpandable ? (
                    <EditableFieldsView 
                        values={editedValue} 
                        path={[]} 
                        onChange={handleFieldChange} 
                        onDelete={handleFieldDelete}
                        onAdd={handleFieldAdd}
                        isArray={type === "array"}
                        onReorder={(fromIndex, toIndex) => {
                            setEditedValue((prev: any) => {
                                const next = [...prev];
                                const [moved] = next.splice(fromIndex, 1);
                                next.splice(toIndex, 0, moved);
                                return next;
                            });
                        }}
                    />
                ) : type === "reference" && isReference(editedValue) ? (
                    <ReferenceEditor
                        value={normalizeReference(editedValue)}
                        onChange={setEditedValue}
                        autoFocus={true}
                    />
                ) : (
                    <div className="w-full">
                        <InlineValueEditor value={editedValue} onChange={setEditedValue} autoFocus={true} fullWidth={true} />
                    </div>
                )}
            </div>
            
            {/* Footer */}
            <div className="flex items-center justify-end gap-2 p-2 flex-shrink-0 border-t border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-900">
                <Button size="small" variant="text" onClick={onCancel}>Cancel</Button>
                <Button size="small" variant="filled" loading={saving} onClick={async () => {
                    setSaving(true);
                    try {
                        await onSave(editedValue);
                    } finally {
                        setSaving(false);
                    }
                }}>Save</Button>
            </div>
        </div>
    );
}

