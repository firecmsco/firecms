import React from "react";
import { EntityRelation, FilterValues, Relation } from "@firecms/types";
import { RelationSelector } from "../../RelationSelector";

interface RelationSelectorFieldProps {
    /** Field name */
    name: string;
    /** Whether the field is disabled */
    disabled?: boolean;
    /** Current value - can be single EntityRelation or array for multiple selection */
    internalValue: EntityRelation | EntityRelation[] | undefined | null;
    /** Callback when value changes */
    updateValue: (newValue: EntityRelation | EntityRelation[] | null) => void;
    /** The relation configuration */
    relation: Relation;
    /** Force filter to be applied to the relation search */
    forceFilter?: FilterValues<string>;
    /** Collection size for display */
    size?: "small" | "medium";
}

/** Thin wrapper around RelationSelector for table cells */
export function TableRelationSelectorField({
   disabled = false,
   internalValue,
   updateValue,
   relation,
   forceFilter,
   size = "medium",
}: RelationSelectorFieldProps) {

    const multiple = relation.cardinality === "many";

    const placeholder = React.useMemo(() => {
        if (disabled) return "Disabled";
        if (multiple) return "Select multiple...";
        return "Select...";
    }, [disabled, multiple]);

    return (
        <RelationSelector
            placeholder={placeholder}
            multiple={multiple}
            disabled={disabled}
            size={size}
            value={internalValue || null}
            onValueChange={(newVal) => updateValue(newVal ?? null)}
            relation={relation}
            forceFilter={forceFilter}
        />
    );
}
