import React from "react";
import { VirtualTableWhereFilterOp } from "@rebasepro/ui";
import { BooleanSwitchWithLabel } from "@rebasepro/ui";
import { useTranslation } from "@rebasepro/core";

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
    const { t } = useTranslation();

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
        <div className="w-full">
            <BooleanSwitchWithLabel
                size={"medium"}
                value={valueSetToTrue}
                allowIndeterminate={true}
                onValueChange={(v: boolean | null) => updateFilter(v === null ? undefined : v)}
                label={!valueSet
                    ? t("no_filter")
                    : valueSetToTrue
                        ? `${title} ${t("is_true")}`
                        : `${title} ${t("is_false")}`}
            />
        </div>
    );
}
