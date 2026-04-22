import React, { useCallback, useMemo, useRef, useState } from "react";
import {
    cls,
    Select,
    SelectItem,
    TextField,
    IconButton,
    Chip,
    CloseIcon,
    SearchableSelect,
    SearchableSelectItem,
} from "@firecms/ui";
import {
    FilterDef,
    FilterOp,
    FieldType,
    getOperatorsForType,
    OPERATOR_LABELS,
    TYPE_BADGES,
    FILTERABLE_VALUE_TYPES,
    isMultiValueOp,
} from "./filter_utils";
import { FIELD_TYPE_OPTIONS } from "./FieldEditor";

// ─── Props ──────────────────────────────────────────────────────────────────

interface FilterRowProps {
    filter: FilterDef;
    index: number;
    fieldKeys: string[];
    fieldTypes: Record<string, FieldType>;
    onChange: (index: number, filter: FilterDef) => void;
    onRemove: (index: number) => void;

    autoFocusField?: boolean;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function FilterRow({
    filter,
    index,
    fieldKeys,
    fieldTypes,
    onChange,
    onRemove,

    autoFocusField,
}: FilterRowProps) {
    // The inferred type from documents (for the field selector badge)
    const inferredType = filter.field ? (fieldTypes[filter.field] ?? "unknown") : "unknown";
    // The user-selected value type (drives operators + value input)
    const activeType = filter.valueType;
    const operators = useMemo(() => getOperatorsForType(activeType), [activeType]);

    // ─── Field change ───────────────────────────────────────────────────────
    const handleFieldChange = useCallback((newField: string) => {
        const isKnown = fieldTypes[newField] !== undefined;
        if (isKnown) {
            // Known field — update valueType based on inference
            const newInferred = fieldTypes[newField];
            const newValueType = FILTERABLE_VALUE_TYPES.includes(newInferred) ? newInferred : "string";
            const newOps = getOperatorsForType(newValueType);
            const newOp = newOps.includes(filter.op) ? filter.op : newOps[0];
            onChange(index, {
                field: newField,
                op: newOp,
                value: getDefaultValue(newValueType, newOp),
                valueType: newValueType,
            });
        } else {
            // Custom field — keep current valueType and value, just update the field name
            onChange(index, { ...filter, field: newField });
        }
    }, [filter, fieldTypes, index, onChange]);

    // ─── Value type change ──────────────────────────────────────────────────
    const handleValueTypeChange = useCallback((newType: string) => {
        const vt = newType as FieldType;
        const newOps = getOperatorsForType(vt);
        // When selecting null type, force is-null operator
        const newOp = vt === "null" ? "is-null" as FilterOp : (newOps.includes(filter.op) ? filter.op : newOps[0]);
        onChange(index, {
            ...filter,
            valueType: vt,
            op: newOp,
            value: getDefaultValue(vt, newOp),
        });
    }, [filter, index, onChange]);

    // ─── Operator change ────────────────────────────────────────────────────
    const handleOpChange = useCallback((newOp: string) => {
        const op = newOp as FilterOp;
        let newValue = filter.value;

        // Transition between single and multi-value
        if (isMultiValueOp(op) && !Array.isArray(filter.value)) {
            newValue = filter.value !== null && filter.value !== undefined && filter.value !== ""
                ? [filter.value]
                : [];
        } else if (!isMultiValueOp(op) && Array.isArray(filter.value)) {
            newValue = filter.value.length > 0 ? filter.value[0] : "";
        }

        if (op === "is-null") {
            newValue = null;
        }

        onChange(index, { ...filter, op, value: newValue });
    }, [filter, index, onChange]);

    // ─── Value change ───────────────────────────────────────────────────────
    const handleValueChange = useCallback((newValue: any) => {
        onChange(index, { ...filter, value: newValue });
    }, [filter, index, onChange]);

    // ─── Value input rendering based on valueType + operator ─────────────────

    const isNull = filter.op === "is-null";
    const isMulti = isMultiValueOp(filter.op);

    return (
        <div className="flex items-center gap-1.5">
                {/* Field selector — supports custom field names via search + suggestions */}
                <SearchableSelect
                    size="smallest"
                    value={filter.field}
                    onValueChange={handleFieldChange}
                    placeholder="Field..."
                    className="w-[160px] flex-shrink-0"
                    allowCustomValues
                    autoFocus={!filter.field}
                    renderValue={(v) => (
                        <span className="flex items-center gap-1.5 text-xs">
                            <span className={cls("font-mono text-[10px]", TYPE_BADGES[fieldTypes[v] ?? "unknown"]?.color)}>
                                {TYPE_BADGES[fieldTypes[v] ?? "unknown"]?.label}
                            </span>
                            <span className="truncate">{v}</span>
                        </span>
                    )}
                >
                    {fieldKeys.map(key => (
                        <SearchableSelectItem key={key} value={key}>
                            <span className="flex items-center gap-2 text-xs">
                                <span className={cls("font-mono text-[10px] w-6", TYPE_BADGES[fieldTypes[key] ?? "unknown"]?.color)}>
                                    {TYPE_BADGES[fieldTypes[key] ?? "unknown"]?.label}
                                </span>
                                <span>{key}</span>
                            </span>
                        </SearchableSelectItem>
                    ))}
                </SearchableSelect>

                {/* Operator selector */}
                <Select
                    size="smallest"
                    value={filter.op}
                    onValueChange={handleOpChange}
                    className="w-[120px] flex-shrink-0"
                    renderValue={(v) => (
                        <span className="text-xs">{OPERATOR_LABELS[v as FilterOp] ?? v}</span>
                    )}
                >
                    {operators.map(op => (
                        <SelectItem key={op} value={op}>
                            <span className="text-xs">{OPERATOR_LABELS[op]}</span>
                        </SelectItem>
                    ))}
                </Select>

                {/* Value type selector — uses same labels as doc view */}
                <Select
                    size="smallest"
                    value={activeType}
                    onValueChange={handleValueTypeChange}
                    className="w-24 flex-shrink-0"
                >
                    {FIELD_TYPE_OPTIONS.map(o => (
                        <SelectItem key={o.value} value={o.value}>
                            <span className="text-xs">{o.label}</span>
                        </SelectItem>
                    ))}
                </Select>

                {/* Value input */}
                <div className="flex-grow min-w-[120px]">
                    {isNull ? (
                        <div className="flex items-center h-7 px-2 text-xs text-surface-400 dark:text-surface-500 italic">
                            null
                        </div>
                    ) : isMulti ? (
                        <MultiValueInput
                            value={Array.isArray(filter.value) ? filter.value : []}
                            onChange={handleValueChange}
                            fieldType={activeType}
                        />
                    ) : (
                        <SingleValueInput
                            value={filter.value}
                            onChange={handleValueChange}
                            fieldType={activeType}
                        />
                    )}
                </div>

                {/* Remove */}
                <IconButton
                    size="smallest"
                    onClick={() => onRemove(index)}
                    className="flex-shrink-0 text-surface-400 hover:text-red-400"
                >
                    <CloseIcon size="smallest" />
            </IconButton>
        </div>
    );
}

// ─── Single value input ────────────────────────────────────────────────────

function SingleValueInput({
    value,
    onChange,
    fieldType,
}: {
    value: any;
    onChange: (v: any) => void;
    fieldType: FieldType;
}) {
    if (fieldType === "boolean") {
        return (
            <Select
                size="smallest"
                value={value === true ? "true" : value === false ? "false" : ""}
                onValueChange={(v) => onChange(v === "true")}
                placeholder="Select..."
                className="w-full"
            >
                <SelectItem value="true">
                    <span className="text-xs">true</span>
                </SelectItem>
                <SelectItem value="false">
                    <span className="text-xs">false</span>
                </SelectItem>
            </Select>
        );
    }

    if (fieldType === "timestamp") {
        const dateValue = value instanceof Date
            ? value
            : (typeof value === "string" && value ? new Date(value) : null);
        const isoStr = dateValue ? dateValue.toISOString().slice(0, 16) : "";
        return (
            <TextField
                size="smallest"
                type="datetime-local"
                value={isoStr}
                onChange={(e) => {
                    const d = new Date(e.target.value);
                    if (!isNaN(d.getTime())) onChange(d);
                }}
                className="w-full"
            />
        );
    }

    // String, number, or fallback
    return (
        <TextField
            size="smallest"
            type={fieldType === "number" ? "number" : "text"}
            value={value !== null && value !== undefined ? String(value) : ""}
            onChange={(e) => {
                const raw = e.target.value;
                if (fieldType === "number") {
                    const num = parseFloat(raw);
                    onChange(isNaN(num) ? raw : num);
                } else {
                    onChange(raw);
                }
            }}
            placeholder="Value..."
            className="w-full"
        />
    );
}

// ─── Multi-value chip input ────────────────────────────────────────────────

function MultiValueInput({
    value,
    onChange,
    fieldType,
}: {
    value: any[];
    onChange: (v: any[]) => void;
    fieldType: FieldType;
}) {
    const [inputValue, setInputValue] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const handleAdd = useCallback(() => {
        const trimmed = inputValue.trim();
        if (!trimmed) return;

        let parsed: any = trimmed;
        if (fieldType === "number") {
            const num = parseFloat(trimmed);
            if (!isNaN(num)) parsed = num;
        } else if (trimmed === "true") {
            parsed = true;
        } else if (trimmed === "false") {
            parsed = false;
        }

        if (!value.includes(parsed)) {
            onChange([...value, parsed]);
        }
        setInputValue("");
    }, [inputValue, value, onChange, fieldType]);

    const handleRemove = useCallback((idx: number) => {
        onChange(value.filter((_, i) => i !== idx));
    }, [value, onChange]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAdd();
        } else if (e.key === "Backspace" && inputValue === "" && value.length > 0) {
            onChange(value.slice(0, -1));
        }
    }, [handleAdd, inputValue, value, onChange]);

    return (
        <div
            className={cls(
                "flex items-center flex-wrap gap-1 min-h-[28px] px-2 py-0.5 rounded-md",
                "bg-surface-100 dark:bg-surface-800",
                "border border-surface-200 dark:border-surface-700",
                "focus-within:ring-1 focus-within:ring-primary",
            )}
            onClick={() => inputRef.current?.focus()}
        >
            {value.map((v, i) => (
                <Chip
                    key={`${v}-${i}`}
                    size="small"
                    colorScheme="cyanLighter"
                    onClick={() => handleRemove(i)}
                    className="cursor-pointer"
                >
                    <span className="text-xs">{String(v)}</span>
                    <CloseIcon size="smallest" className="ml-0.5" />
                </Chip>
            ))}
            <input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleAdd}
                placeholder={value.length === 0 ? "Type + Enter…" : ""}
                className={cls(
                    "flex-grow min-w-[60px] bg-transparent outline-none text-xs",
                    "text-text-primary dark:text-text-primary-dark",
                    "placeholder:text-surface-400 dark:placeholder:text-surface-500",
                )}
            />
        </div>
    );
}

// ─── Default value helper ──────────────────────────────────────────────────

function getDefaultValue(fieldType: FieldType, op: FilterOp): any {
    if (op === "is-null") return null;
    if (isMultiValueOp(op)) return [];
    if (fieldType === "boolean") return true;
    if (fieldType === "number") return "";
    return "";
}
