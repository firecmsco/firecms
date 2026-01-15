import React, { useCallback, useMemo, useState } from "react";
import {
    FilterValues,
    Property,
    WhereFilterOp
} from "@firecms/types";
import {
    Button,
    cls,
    defaultBorderMixin,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FilterListIcon,
    Typography
} from "@firecms/ui";
import { StringNumberFilterField } from "../SelectableTable/filters/StringNumberFilterField";
import { BooleanFilterField } from "../SelectableTable/filters/BooleanFilterField";
import { DateTimeFilterField } from "../SelectableTable/filters/DateTimeFilterField";
import { ReferenceFilterField } from "../SelectableTable/filters/ReferenceFilterField";
import { VirtualTableWhereFilterOp } from "../VirtualTable";
import { enumToObjectEntries } from "@firecms/common";

export interface FiltersDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    properties: Record<string, Property>;
    filterValues: FilterValues<any> | undefined;
    setFilterValues: (filterValues?: FilterValues<any>) => void;
    forceFilter?: FilterValues<any>;
}

/**
 * Dialog that displays all filterable properties from a collection
 * and allows setting filter values for each.
 */
export function FiltersDialog({
    open,
    onOpenChange,
    properties,
    filterValues,
    setFilterValues,
    forceFilter
}: FiltersDialogProps) {
    // Local state for filters being edited
    const [localFilters, setLocalFilters] = useState<FilterValues<any>>(filterValues ?? {});

    // Track hidden state for reference fields (when reference dialog is open)
    const [hiddenFields, setHiddenFields] = useState<Record<string, boolean>>({});

    // Reset local state when dialog opens
    React.useEffect(() => {
        if (open) {
            setLocalFilters(filterValues ?? {});
        }
    }, [open, filterValues]);

    // Get list of filterable properties
    const filterableProperties = useMemo(() => {
        return Object.entries(properties).filter(([key, property]) => {
            if (!property) return false;
            // Force filter properties should not be editable
            if (forceFilter && key in forceFilter) return false;
            // Check if property type is filterable
            const baseProperty = property.type === "array" ? property.of : property;
            if (!baseProperty) return false;
            return ["string", "number", "boolean", "date", "reference"].includes(baseProperty.type);
        });
    }, [properties, forceFilter]);

    const handleFilterChange = useCallback((propertyKey: string, value?: [VirtualTableWhereFilterOp, any]) => {
        setLocalFilters(prev => {
            const newFilters = { ...prev };
            if (value) {
                newFilters[propertyKey] = value as [WhereFilterOp, any];
            } else {
                delete newFilters[propertyKey];
            }
            return newFilters;
        });
    }, []);

    const handleApply = useCallback(() => {
        const hasFilters = Object.keys(localFilters).length > 0;
        setFilterValues(hasFilters ? { ...localFilters, ...forceFilter } : (forceFilter || undefined));
        onOpenChange(false);
    }, [localFilters, setFilterValues, forceFilter, onOpenChange]);

    const handleClearAll = useCallback(() => {
        setLocalFilters({});
    }, []);

    const setHiddenForField = useCallback((propertyKey: string, hidden: boolean) => {
        setHiddenFields(prev => ({
            ...prev,
            [propertyKey]: hidden
        }));
    }, []);

    // Check if any reference field's dialog is currently open (should hide this dialog)
    const isAnyFieldHidden = Object.values(hiddenFields).some(hidden => hidden);
    const activeFilterCount = Object.keys(localFilters).length;

    const renderFilterField = useCallback((propertyKey: string, property: Property) => {
        const isArray = property.type === "array";
        const baseProperty: Property | undefined = isArray ? property.of : property;

        if (!baseProperty) return null;

        const filterValue = localFilters[propertyKey] as [VirtualTableWhereFilterOp, any] | undefined;
        const setValue = (value?: [VirtualTableWhereFilterOp, any]) => handleFilterChange(propertyKey, value);

        if (baseProperty.type === "reference") {
            return (
                <ReferenceFilterField
                    value={filterValue}
                    setValue={setValue}
                    name={propertyKey}
                    isArray={isArray}
                    path={baseProperty.path}
                    title={property.name}
                    includeId={baseProperty.includeId}
                    previewProperties={baseProperty.previewProperties}
                    hidden={hiddenFields[propertyKey] ?? false}
                    setHidden={(hidden) => setHiddenForField(propertyKey, hidden)}
                />
            );
        } else if (baseProperty.type === "number" || baseProperty.type === "string") {
            const enumValues = baseProperty.enum ? enumToObjectEntries(baseProperty.enum) : undefined;
            return (
                <StringNumberFilterField
                    value={filterValue}
                    setValue={setValue}
                    name={propertyKey}
                    type={baseProperty.type}
                    isArray={isArray}
                    enumValues={enumValues}
                    title={property.name}
                />
            );
        } else if (baseProperty.type === "boolean") {
            return (
                <BooleanFilterField
                    value={filterValue}
                    setValue={setValue}
                    name={propertyKey}
                    title={property.name}
                />
            );
        } else if (baseProperty.type === "date") {
            return (
                <DateTimeFilterField
                    value={filterValue}
                    setValue={setValue}
                    name={propertyKey}
                    mode={baseProperty.mode}
                    isArray={isArray}
                    title={property.name}
                />
            );
        }

        return null;
    }, [localFilters, handleFilterChange, hiddenFields, setHiddenForField]);

    return (
        <Dialog
            open={open}
            onOpenChange={onOpenChange}
            maxWidth="3xl"
            fullWidth
            containerClassName={isAnyFieldHidden ? "hidden" : undefined}
        >
            <DialogTitle className="flex items-center gap-2">
                <Typography variant="h6">Filters</Typography>
                {activeFilterCount > 0 && (
                    <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-primary text-white">
                        {activeFilterCount}
                    </span>
                )}
            </DialogTitle>

            <DialogContent >
                {filterableProperties.length === 0 ? (
                    <Typography color="secondary" className="py-8 text-center">
                        No filterable properties available
                    </Typography>
                ) : (
                    <table className="w-full border-collapse">
                        <tbody>
                            {filterableProperties.map(([propertyKey, property], index) => {
                                const hasFilter = propertyKey in localFilters;

                                return (
                                    <tr key={propertyKey} className={cls(
                                        index > 0 && "border-t",
                                        defaultBorderMixin
                                    )}>
                                        {/* Property name on the left */}
                                        <td className="py-3 pr-4 align-middle w-[160px]">
                                            <Typography
                                                variant="body2"
                                                className={cls(
                                                    "font-medium",
                                                    hasFilter && "text-primary"
                                                )}
                                            >
                                                {property.name || propertyKey}
                                            </Typography>
                                        </td>

                                        {/* Filter field on the right */}
                                        <td className="py-3">
                                            {renderFilterField(propertyKey, property)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </DialogContent>

            <DialogActions>
                <Button
                    variant="text"
                    onClick={handleClearAll}
                    disabled={activeFilterCount === 0}
                >
                    Clear all
                </Button>
                <div className="flex-grow" />
                <Button
                    variant="text"
                    onClick={() => onOpenChange(false)}
                >
                    Cancel
                </Button>
                <Button
                    variant="filled"
                    onClick={handleApply}
                >
                    Apply filters
                </Button>
            </DialogActions>
        </Dialog>
    );
}
