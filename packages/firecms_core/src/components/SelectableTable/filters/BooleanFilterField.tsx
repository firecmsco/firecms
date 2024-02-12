import React from "react";
import { VirtualTableWhereFilterOp } from "../../VirtualTable";
import { BooleanSwitchWithLabel } from "@firecms/ui";

interface BooleanFieldProps {
    name: string,
    value?: [op: VirtualTableWhereFilterOp, fieldValue: any];
    setValue: (value?: [op: VirtualTableWhereFilterOp, newValue: any]) => void;
    title?: string;
}

export function BooleanFilterField({
                                       name,
                                       title,
                                       value,
                                       setValue
                                   }: BooleanFieldProps) {

    function updateFilter(val?: boolean) {
        if (val !== undefined) {
            setValue(
                ["==", val]
            );
        } else {
            setValue(
                undefined
            );
        }
    }

    const valueSetToTrue = value && value[1];
    const valueSet = !!value;

    return (
        <div className="w-[200px]">
            <BooleanSwitchWithLabel
                value={valueSetToTrue}
                allowIndeterminate={true}
                onValueChange={(v: boolean | null) => updateFilter(v === null ? undefined : v)}
                label={!valueSet
                    ? "No filter"
                    : valueSetToTrue
                        ? `${title} is true`
                        : `${title} is false`}
            />
        </div>
    )
        ;
}
