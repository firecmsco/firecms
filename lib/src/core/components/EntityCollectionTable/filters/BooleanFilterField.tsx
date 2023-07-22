
import React from "react";
import { TableWhereFilterOp } from "../../Table";
import { Checkbox } from "../../../../components/Checkbox";

interface BooleanFieldProps {
    name: string,
    value?: [op: TableWhereFilterOp, fieldValue: any];
    setValue: (value?: [op: TableWhereFilterOp, newValue: any]) => void;
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
        <div className="w-200px">
            <label htmlFor={`filter-${name}`} className="flex justify-center items-center gap-4">
                <span className="text-sm">
                    {!valueSet
                        ? "No filter"
                        : valueSetToTrue
                            ? `${title} is true`
                            : `${title} is false`}
                </span>
                <Checkbox
                    key={`filter-${name}`}
                    checked={valueSet && valueSetToTrue}
                    indeterminate={!valueSet}
                    onCheckedChange={(checked) => {
                        if (valueSetToTrue) {
                            updateFilter(false);
                        } else if (!valueSet) {
                            updateFilter(true);
                        } else {
                            updateFilter(undefined);
                        }
                    }}
                />
            </label>
        </div>
    );
}
