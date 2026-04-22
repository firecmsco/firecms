import React, { useCallback, useEffect, useRef } from "react";
import {
    cls,
    Button,
    AddIcon,
    defaultBorderMixin,
} from "@firecms/ui";
import { FilterRow } from "./FilterRow";
import {
    FilterDef,
    FilterOp,
    FieldType,
    getOperatorsForType,
    persistFilters,
    FILTERABLE_VALUE_TYPES,
} from "./filter_utils";

// ─── Props ──────────────────────────────────────────────────────────────────

interface FilterBarProps {
    fieldKeys: string[];
    fieldTypes: Record<string, FieldType>;
    filters: FilterDef[];
    onFiltersChange: (filters: FilterDef[]) => void;
    path: string;
    /** Index of the filter whose value input should be auto-focused */
    focusValueIndex?: number;
    /** Called when the filter bar should be hidden */
    onClose?: () => void;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function FilterBar({
    fieldKeys,
    fieldTypes,
    filters,
    onFiltersChange,
    path,
    focusValueIndex,
    onClose,
}: FilterBarProps) {
    const justAddedRef = useRef(false);

    // Auto-add an empty row when opened with no filters
    useEffect(() => {
        if (filters.length === 0 && !justAddedRef.current) {
            const defaultOps = getOperatorsForType("string");
            onFiltersChange([{
                field: "",
                op: defaultOps[0],
                value: "",
                valueType: "string",
            }]);
            justAddedRef.current = true;
        }
    }, []); // only on mount

    // ─── Handlers ───────────────────────────────────────────────────────────

    const handleChange = useCallback((index: number, filter: FilterDef) => {
        const newFilters = filters.map((f, i) => i === index ? filter : f);
        onFiltersChange(newFilters);
        persistFilters(path, newFilters.filter(f => f.field));
    }, [filters, onFiltersChange, path]);

    const handleRemove = useCallback((index: number) => {
        const newFilters = filters.filter((_, i) => i !== index);
        onFiltersChange(newFilters);
        persistFilters(path, newFilters.filter(f => f.field));
    }, [filters, onFiltersChange, path]);

    const handleAdd = useCallback(() => {
        const defaultOps = getOperatorsForType("string");
        const newFilters = [...filters, {
            field: "",
            op: defaultOps[0] as FilterOp,
            value: "",
            valueType: "string" as FieldType,
        }];
        onFiltersChange(newFilters);
        justAddedRef.current = true;
    }, [filters, onFiltersChange]);

    const handleClearAll = useCallback(() => {
        onFiltersChange([]);
        persistFilters(path, []);
        onClose?.();
    }, [onFiltersChange, path, onClose]);

    // ─── Render ─────────────────────────────────────────────────────────────

    return (
        <div className={cls(
            "flex flex-col gap-1 px-4 py-3",
            "border-b",
            defaultBorderMixin,
            "bg-surface-50 dark:bg-surface-900",
        )}>
            {/* Filter rows */}
            {filters.map((filter, i) => (
                <FilterRow
                    key={i}
                    filter={filter}
                    index={i}
                    fieldKeys={fieldKeys}
                    fieldTypes={fieldTypes}
                    onChange={handleChange}
                    onRemove={handleRemove}
                    autoFocusValue={focusValueIndex === i}
                />
            ))}

            {/* Actions row */}
            <div className="flex items-center gap-2 mt-1">
                <Button
                    size="small"
                    variant="text"
                    startIcon={<AddIcon size="smallest" />}
                    onClick={handleAdd}
                    className="text-xs"
                >
                    Add filter
                </Button>

                {filters.length > 0 && (
                    <Button
                        size="small"
                        variant="text"
                        onClick={handleClearAll}
                        className="text-xs text-surface-500 hover:text-red-400 ml-auto"
                    >
                        Clear all
                    </Button>
                )}
            </div>
        </div>
    );
}
