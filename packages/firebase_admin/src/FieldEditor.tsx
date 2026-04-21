import React, { useCallback, useState } from "react";
import {
    closestCenter,
    DndContext,
    DragEndEvent,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    cls,
    Typography,
    Button,
    IconButton,
    Tooltip,
    TextField,
    TextareaAutosize,
    BooleanSwitch,
    Select,
    SelectItem,
    defaultBorderMixin,
    DeleteIcon,
    AddIcon,
    ExpandMoreIcon,
    ChevronRightIcon,
    DragHandleIcon,
    ArrowUpwardIcon,
    ArrowDownwardIcon,
} from "@firecms/ui";

// ─────────────────────────────────────────────────────────────────────────────
// Types & Constants
// ─────────────────────────────────────────────────────────────────────────────

export type FieldType = "string" | "number" | "boolean" | "null" | "map" | "array" | "timestamp";

export const FIELD_TYPE_OPTIONS: { value: FieldType; label: string }[] = [
    { value: "string", label: "String" },
    { value: "number", label: "Number" },
    { value: "boolean", label: "Boolean" },
    { value: "null", label: "Null" },
    { value: "map", label: "Map" },
    { value: "array", label: "Array" },
    { value: "timestamp", label: "Timestamp" },
];

export function defaultValueForType(type: FieldType): any {
    switch (type) {
        case "string": return "";
        case "number": return 0;
        case "boolean": return false;
        case "null": return null;
        case "map": return {};
        case "array": return [];
        case "timestamp": return { _seconds: Math.floor(Date.now() / 1000), _nanoseconds: 0 };
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────

export function isTimestamp(value: any): boolean {
    return value && typeof value === "object" && ("_seconds" in value || value instanceof Date);
}

export function getTypeName(value: any): string {
    if (value === null || value === undefined) return "null";
    if (typeof value === "boolean") return "bool";
    if (typeof value === "number") return Number.isInteger(value) ? "int" : "float";
    if (typeof value === "string") return "string";
    if (Array.isArray(value)) return "array";
    if (isTimestamp(value)) return "timestamp";
    if (value._lat !== undefined && value._long !== undefined) return "geopoint";
    if (value._path !== undefined) return "reference";
    if (typeof value === "object") return "map";
    return typeof value;
}

export function getTypeColorScheme(value: any): any {
    if (value === null || value === undefined) return "grayLighter";
    if (typeof value === "boolean") return "purpleLighter";
    if (typeof value === "number") return "greenLighter";
    if (typeof value === "string") return "blueLighter";
    if (Array.isArray(value)) return "orangeLighter";
    if (isTimestamp(value)) return "tealLighter";
    return "grayLighter";
}

export function fieldTypeFromValue(value: any): FieldType {
    if (value === null || value === undefined) return "null";
    if (typeof value === "boolean") return "boolean";
    if (typeof value === "number") return "number";
    if (typeof value === "string") return "string";
    if (Array.isArray(value)) return "array";
    if (isTimestamp(value)) return "timestamp";
    if (typeof value === "object") return "map";
    return "string";
}

export function convertValue(currentValue: any, targetType: FieldType): any {
    switch (targetType) {
        case "string":
            if (currentValue === null || currentValue === undefined) return "";
            if (typeof currentValue === "string") return currentValue;
            if (typeof currentValue === "boolean" || typeof currentValue === "number") return String(currentValue);
            return JSON.stringify(currentValue);
        case "number": {
            if (typeof currentValue === "number") return currentValue;
            if (typeof currentValue === "boolean") return currentValue ? 1 : 0;
            if (typeof currentValue === "string") {
                const n = Number(currentValue);
                return isNaN(n) ? 0 : n;
            }
            return 0;
        }
        case "boolean":
            if (typeof currentValue === "boolean") return currentValue;
            if (typeof currentValue === "number") return currentValue !== 0;
            if (typeof currentValue === "string") return currentValue.length > 0 && currentValue !== "false";
            return !!currentValue;
        case "null":
            return null;
        case "map":
            if (typeof currentValue === "object" && currentValue !== null && !Array.isArray(currentValue)) return currentValue;
            return {};
        case "array":
            if (Array.isArray(currentValue)) return currentValue;
            if (currentValue !== null && currentValue !== undefined) return [currentValue];
            return [];
        case "timestamp":
            if (isTimestamp(currentValue)) return currentValue;
            return { _seconds: Math.floor(Date.now() / 1000), _nanoseconds: 0 };
        default:
            return defaultValueForType(targetType);
    }
}


// ─────────────────────────────────────────────────────────────────────────────
// Inline Value Editor
// ─────────────────────────────────────────────────────────────────────────────

function InlineValueEditor({
    value,
    onChange,
}: {
    value: any;
    onChange: (v: any) => void;
}) {
    if (value === null || value === undefined) {
        return (
            <Select
                size="smallest"
                value="null"
                onValueChange={(v) => {
                    onChange(defaultValueForType(v as FieldType));
                }}
                className="w-28"
                placeholder="null"
            >
                <SelectItem value="null">null</SelectItem>
                <SelectItem value="string">→ String</SelectItem>
                <SelectItem value="number">→ Number</SelectItem>
                <SelectItem value="boolean">→ Boolean</SelectItem>
            </Select>
        );
    }

    if (typeof value === "boolean") {
        return (
            <div className="flex items-center gap-2">
                <BooleanSwitch
                    value={value}
                    size="small"
                    onValueChange={onChange}
                />
                <Typography variant="body2" className="text-sm text-surface-600 dark:text-surface-300">
                    {String(value)}
                </Typography>
            </div>
        );
    }

    if (typeof value === "number") {
        return (
            <TextField
                size="smallest"
                type="number"
                value={value}
                onChange={(e) => {
                    const num = parseFloat(e.target.value);
                    onChange(isNaN(num) ? 0 : num);
                }}
                className="max-w-[160px]"
            />
        );
    }

    if (typeof value === "string") {
        return (
            <TextareaAutosize
                value={value}
                onChange={(e) => onChange(e.target.value)}
                minRows={1}
                maxRows={8}
                ignoreBoxSizing
                className={cls(
                    "w-full outline-none text-sm leading-normal px-3 py-0.5 min-h-[28px] rounded-md resize-none",
                    "border",
                    defaultBorderMixin,
                    "bg-surface-50 dark:bg-surface-900",
                    "focus:ring-2 focus:ring-primary focus:border-primary",
                )}
            />
        );
    }

    if (isTimestamp(value)) {
        const date = value._seconds ? new Date(value._seconds * 1000) : new Date();
        const isoStr = date.toISOString().slice(0, 16);
        return (
            <TextField
                size="smallest"
                type="datetime-local"
                value={isoStr}
                onChange={(e) => {
                    const newDate = new Date(e.target.value);
                    if (!isNaN(newDate.getTime())) {
                        onChange({ _seconds: Math.floor(newDate.getTime() / 1000), _nanoseconds: 0 });
                    }
                }}
                className="max-w-[220px]"
            />
        );
    }

    // Fallback: show as text
    return (
        <Typography variant="body2" className="truncate text-surface-600 dark:text-surface-300 text-sm">
            {JSON.stringify(value)}
        </Typography>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sortable Array Item
// ─────────────────────────────────────────────────────────────────────────────

function SortableArrayItem({
    id,
    index,
    totalCount,
    fieldKey,
    value,
    path,
    depth,
    onChange,
    onDelete,
    onAdd,
    onMoveUp,
    onMoveDown,
}: {
    id: string;
    index: number;
    totalCount: number;
    fieldKey: string;
    value: any;
    path: string[];
    depth: number;
    onChange: (path: string[], value: any) => void;
    onDelete: (path: string[]) => void;
    onAdd: (parentPath: string[], key: string, type: FieldType) => void;
    onMoveUp: (index: number) => void;
    onMoveDown: (index: number) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 10 : undefined,
    };

    const [expanded, setExpanded] = useState(depth < 2);
    const typeName = getTypeName(value);
    const isExpandable = typeof value === "object" && value !== null && !isTimestamp(value);

    return (
        <div ref={setNodeRef} style={style}>
            <div style={{ paddingLeft: `${depth * 12}px` }}>
                <div
                    className={cls(
                        "flex items-start gap-2 py-1.5 px-2 rounded-md group",
                        "hover:bg-surface-100 dark:hover:bg-surface-800",
                        isDragging && "bg-surface-100 dark:bg-surface-800 shadow-md",
                    )}
                >
                    {/* Drag handle */}
                    <Tooltip title="Drag to reorder">
                        <span
                            className="w-5 h-5 flex items-center justify-center flex-shrink-0 cursor-grab active:cursor-grabbing text-surface-400 hover:text-surface-600 dark:hover:text-surface-300"
                            {...listeners}
                            {...attributes}
                        >
                            <DragHandleIcon size="smallest" />
                        </span>
                    </Tooltip>

                    {/* Expand/collapse for maps/arrays */}
                    {isExpandable ? (
                        <span
                            className="w-5 h-5 flex items-center justify-center flex-shrink-0 cursor-pointer"
                            onClick={() => setExpanded(!expanded)}
                        >
                            {expanded
                                ? <ExpandMoreIcon size="smallest" className="text-surface-500" />
                                : <ChevronRightIcon size="smallest" className="text-surface-400" />
                            }
                        </span>
                    ) : (
                        <span className="w-5 flex-shrink-0" />
                    )}

                    {/* Array index */}
                    <Typography variant="body2"
                        className="font-medium flex-shrink-0 min-w-[40px] max-w-[60px] truncate text-sm pt-0.5 text-surface-500 dark:text-surface-400 font-mono">
                        {fieldKey}
                    </Typography>

                    {/* Type selector */}
                    <Select
                        size="smallest"
                        value={fieldTypeFromValue(value)}
                        onValueChange={(newType) => {
                            if (newType !== fieldTypeFromValue(value)) {
                                onChange(path, convertValue(value, newType as FieldType));
                            }
                        }}
                        className="w-24 flex-shrink-0"
                    >
                        {FIELD_TYPE_OPTIONS.map(o => (
                            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                    </Select>

                    {/* Inline value editor */}
                    {!isExpandable && (
                        <div className="flex-grow min-w-0">
                            <InlineValueEditor value={value} onChange={(v) => onChange(path, v)} />
                        </div>
                    )}

                    {isExpandable && (
                        <Typography variant="caption" color="secondary" className="flex-shrink-0">
                            {Array.isArray(value) ? `[${value.length}]` : `{${Object.keys(value).length}}`}
                        </Typography>
                    )}

                    {/* Move up/down buttons */}
                    <div className="flex items-center gap-0 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <Tooltip title="Move up">
                            <IconButton
                                size="smallest"
                                onClick={() => onMoveUp(index)}
                                disabled={index === 0}
                            >
                                <ArrowUpwardIcon size="smallest" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Move down">
                            <IconButton
                                size="smallest"
                                onClick={() => onMoveDown(index)}
                                disabled={index === totalCount - 1}
                            >
                                <ArrowDownwardIcon size="smallest" />
                            </IconButton>
                        </Tooltip>
                    </div>

                    {/* Delete button */}
                    <Tooltip title="Delete item">
                        <IconButton
                            size="smallest"
                            onClick={() => onDelete(path)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                        >
                            <DeleteIcon size="smallest" />
                        </IconButton>
                    </Tooltip>
                </div>

                {/* Expanded children */}
                {isExpandable && expanded && (
                    <div className={cls("ml-2 border-l pl-1", defaultBorderMixin)}>
                        {Array.isArray(value) ? (
                            <EditableFieldsView
                                values={Object.fromEntries(value.map((v, i) => [String(i), v]))}
                                path={path}
                                depth={depth + 1}
                                onChange={onChange}
                                onDelete={onDelete}
                                onAdd={onAdd}
                                isArray={true}
                                onReorder={(fromIndex, toIndex) => {
                                    const newArr = [...value];
                                    const [moved] = newArr.splice(fromIndex, 1);
                                    newArr.splice(toIndex, 0, moved);
                                    onChange(path, newArr);
                                }}
                            />
                        ) : (
                            <EditableFieldsView
                                values={value}
                                path={path}
                                depth={depth + 1}
                                onChange={onChange}
                                onDelete={onDelete}
                                onAdd={onAdd}
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Editable Field Row (for map entries - no drag handle)
// ─────────────────────────────────────────────────────────────────────────────

function EditableFieldRow({
    fieldKey,
    value,
    path,
    depth,
    onChange,
    onDelete,
    onAdd,
}: {
    fieldKey: string;
    value: any;
    path: string[];
    depth: number;
    onChange: (path: string[], value: any) => void;
    onDelete: (path: string[]) => void;
    onAdd: (parentPath: string[], key: string, type: FieldType) => void;
}) {
    const [expanded, setExpanded] = useState(depth < 2);
    const typeName = getTypeName(value);
    const isExpandable = typeof value === "object" && value !== null && !isTimestamp(value);

    return (
        <div style={{ paddingLeft: `${depth * 12}px` }}>
            <div
                className={cls(
                    "flex items-start gap-2 py-1.5 px-2 rounded-md group",
                    "hover:bg-surface-100 dark:hover:bg-surface-800",
                )}
            >
                {/* Expand/collapse for maps/arrays */}
                {isExpandable ? (
                    <span
                        className="w-5 h-5 flex items-center justify-center flex-shrink-0 cursor-pointer"
                        onClick={() => setExpanded(!expanded)}
                    >
                        {expanded
                            ? <ExpandMoreIcon size="smallest" className="text-surface-500" />
                            : <ChevronRightIcon size="smallest" className="text-surface-400" />
                        }
                    </span>
                ) : (
                    <span className="w-5 flex-shrink-0" />
                )}

                {/* Field name */}
                <Typography variant="body2"
                    className="font-medium flex-shrink-0 min-w-[80px] max-w-[140px] truncate text-sm pt-0.5">
                    {fieldKey}
                </Typography>

                {/* Type selector */}
                <Select
                    size="smallest"
                    value={fieldTypeFromValue(value)}
                    onValueChange={(newType) => {
                        if (newType !== fieldTypeFromValue(value)) {
                            onChange(path, convertValue(value, newType as FieldType));
                        }
                    }}
                    className="w-24 flex-shrink-0"
                >
                    {FIELD_TYPE_OPTIONS.map(o => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                </Select>

                {/* Inline value editor */}
                {!isExpandable && (
                    <div className="flex-grow min-w-0">
                        <InlineValueEditor value={value} onChange={(v) => onChange(path, v)} />
                    </div>
                )}

                {isExpandable && (
                    <Typography variant="caption" color="secondary" className="flex-shrink-0">
                        {Array.isArray(value) ? `[${value.length}]` : `{${Object.keys(value).length}}`}
                    </Typography>
                )}

                {/* Delete button */}
                <Tooltip title="Delete field">
                    <IconButton
                        size="smallest"
                        onClick={() => onDelete(path)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                    >
                        <DeleteIcon size="smallest" />
                    </IconButton>
                </Tooltip>
            </div>

            {/* Expanded children */}
            {isExpandable && expanded && (
                <div className={cls("ml-2 border-l pl-1", defaultBorderMixin)}>
                    {Array.isArray(value) ? (
                        <EditableFieldsView
                            values={Object.fromEntries(value.map((v, i) => [String(i), v]))}
                            path={path}
                            depth={depth + 1}
                            onChange={onChange}
                            onDelete={onDelete}
                            onAdd={onAdd}
                            isArray={true}
                            onReorder={(fromIndex, toIndex) => {
                                const newArr = [...value];
                                const [moved] = newArr.splice(fromIndex, 1);
                                newArr.splice(toIndex, 0, moved);
                                onChange(path, newArr);
                            }}
                        />
                    ) : (
                        <EditableFieldsView
                            values={value}
                            path={path}
                            depth={depth + 1}
                            onChange={onChange}
                            onDelete={onDelete}
                            onAdd={onAdd}
                        />
                    )}
                </div>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Editable Fields View (main export)
// ─────────────────────────────────────────────────────────────────────────────

export function EditableFieldsView({
    values,
    path,
    onChange,
    onDelete,
    onAdd,
    depth = 0,
    isArray = false,
    onReorder,
}: {
    values: Record<string, any>;
    path: string[];
    onChange: (path: string[], value: any) => void;
    onDelete: (path: string[]) => void;
    onAdd: (parentPath: string[], key: string, type: FieldType) => void;
    depth?: number;
    isArray?: boolean;
    onReorder?: (fromIndex: number, toIndex: number) => void;
}) {
    const [addingField, setAddingField] = useState(false);
    const [newFieldName, setNewFieldName] = useState("");
    const [newFieldType, setNewFieldType] = useState<FieldType>("string");

    if (!values || typeof values !== "object") {
        return <Typography variant="body2" color="secondary">No data</Typography>;
    }

    const entries = isArray
        ? Object.entries(values).sort(([a], [b]) => Number(a) - Number(b))
        : Object.entries(values).sort(([a], [b]) => a.localeCompare(b));

    // DnD setup for array mode
    // We need stable IDs for dnd-kit to animate correctly, as array indices cause issues when mutating order.
    const arrayIdsRef = React.useRef<string[]>([]);
    if (isArray) {
        if (arrayIdsRef.current.length !== entries.length) {
            if (arrayIdsRef.current.length < entries.length) {
                const newIds = Array.from({ length: entries.length - arrayIdsRef.current.length }, () => Math.random().toString(36).substring(2, 10));
                arrayIdsRef.current = [...arrayIdsRef.current, ...newIds];
            } else {
                arrayIdsRef.current = arrayIdsRef.current.slice(0, entries.length);
            }
        }
    }

    const pointerSensor = useSensor(PointerSensor, {
        activationConstraint: { distance: 5 },
    });
    const keyboardSensor = useSensor(KeyboardSensor, {});
    const sensors = useSensors(pointerSensor, keyboardSensor);

    const sortableIds = isArray ? arrayIdsRef.current : entries.map(([key]) => `sortable-${key}`);

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id || !onReorder) return;

        const oldIndex = sortableIds.indexOf(active.id as string);
        const newIndex = sortableIds.indexOf(over.id as string);
        if (oldIndex === -1 || newIndex === -1) return;
        
        // Swap IDs so dnd-kit sees the item follow its target position
        const nextIds = [...arrayIdsRef.current];
        const [movedId] = nextIds.splice(oldIndex, 1);
        nextIds.splice(newIndex, 0, movedId);
        arrayIdsRef.current = nextIds;

        onReorder(oldIndex, newIndex);
    }, [sortableIds, onReorder]);

    const handleMoveUp = useCallback((index: number) => {
        if (index > 0 && onReorder) {
            const nextIds = [...arrayIdsRef.current];
            const [movedId] = nextIds.splice(index, 1);
            nextIds.splice(index - 1, 0, movedId);
            arrayIdsRef.current = nextIds;
            onReorder(index, index - 1);
        }
    }, [onReorder]);

    const handleMoveDown = useCallback((index: number) => {
        if (index < entries.length - 1 && onReorder) {
            const nextIds = [...arrayIdsRef.current];
            const [movedId] = nextIds.splice(index, 1);
            nextIds.splice(index + 1, 0, movedId);
            arrayIdsRef.current = nextIds;
            onReorder(index, index + 1);
        }
    }, [onReorder, entries.length]);

    const renderAddRow = () => (
        <>
            {addingField ? (
                <div
                    className={cls(
                        "flex items-center gap-2 py-2 px-2 rounded-md",
                        "bg-surface-50 dark:bg-surface-900"
                    )}
                    style={{ marginLeft: `${depth * 12}px` }}
                >
                    {!isArray && (
                        <TextField
                            size="smallest"
                            placeholder="Field name"
                            value={newFieldName}
                            onChange={(e) => setNewFieldName(e.target.value)}
                            className="w-28"
                            autoFocus
                        />
                    )}
                    <Select
                        size="smallest"
                        value={newFieldType}
                        onValueChange={(v) => setNewFieldType(v as FieldType)}
                        className="w-28"
                    >
                        {FIELD_TYPE_OPTIONS.map(o => (
                            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                    </Select>
                    <Button
                        size="small"
                        variant="outlined"
                        onClick={() => {
                            const key = isArray ? String(entries.length) : newFieldName.trim();
                            if (!isArray && !key) return;
                            onAdd(path, key, newFieldType);
                            setAddingField(false);
                            setNewFieldName("");
                            setNewFieldType("string");
                        }}
                        disabled={!isArray && !newFieldName.trim()}
                    >
                        Add
                    </Button>
                    <Button size="small" variant="text" onClick={() => {
                        setAddingField(false);
                        setNewFieldName("");
                    }}>
                        Cancel
                    </Button>
                </div>
            ) : (
                <div style={{ marginLeft: `${depth * 12}px` }} className="pt-1">
                    <Button
                        size="small"
                        variant="text"
                        startIcon={<AddIcon size="smallest" />}
                        onClick={() => {
                            if (isArray) {
                                // For arrays, directly add without prompting for a name
                                onAdd(path, String(entries.length), newFieldType);
                            } else {
                                setAddingField(true);
                            }
                        }}
                        className="text-xs"
                    >
                        {isArray ? "Add item" : "Add field"}
                    </Button>
                </div>
            )}
        </>
    );

    // Array mode: render with DnD
    if (isArray && onReorder) {
        return (
            <div className="space-y-0.5">
                <DndContext
                    sensors={sensors}
                    modifiers={[restrictToVerticalAxis]}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
                        {entries.map(([key, value], index) => (
                            <SortableArrayItem
                                key={sortableIds[index]}
                                id={sortableIds[index]}
                                index={index}
                                totalCount={entries.length}
                                fieldKey={String(index)}
                                value={value}
                                path={[...path, key]}
                                depth={depth}
                                onChange={onChange}
                                onDelete={onDelete}
                                onAdd={onAdd}
                                onMoveUp={handleMoveUp}
                                onMoveDown={handleMoveDown}
                            />
                        ))}
                    </SortableContext>
                </DndContext>

                {renderAddRow()}
            </div>
        );
    }

    // Map mode: render without DnD
    return (
        <div className="space-y-0.5">
            {entries.map(([key, value]) => (
                <EditableFieldRow
                    key={key}
                    fieldKey={key}
                    value={value}
                    path={[...path, key]}
                    depth={depth}
                    onChange={onChange}
                    onDelete={onDelete}
                    onAdd={onAdd}
                />
            ))}

            {renderAddRow()}
        </div>
    );
}
