import React from "react";
import { Chip } from "@firecms/ui";
import { EnumValues } from "@firecms/types";
import { enumToObjectEntries, getLabelOrConfigFrom } from "@firecms/common";
import { buildEnumLabel, getColorScheme } from "../../util/enums";

export interface EnumValuesChipProps {
    enumValues?: EnumValues;
    enumKey: string | number;
    size: "small" | "medium" | "large";
    className?: string;
    children?: React.ReactNode;
}

/**
 * @group Preview components
 */
export function EnumValuesChip({
                                   enumValues,
                                   enumKey,
                                   size,
                                   className,
                                   children
                               }: EnumValuesChipProps) {
    if (!enumValues) return null;
    const enumValuesConfig = enumToObjectEntries(enumValues);
    const enumValue = enumKey !== undefined ? getLabelOrConfigFrom(enumValuesConfig, enumKey) : undefined;
    const label = buildEnumLabel(enumValue);
    const colorScheme = getColorScheme(enumValuesConfig, enumKey);
    return <Chip
        className={className}
        colorScheme={colorScheme}
        error={!label}
        outlined={false}
        size={size}>
        {children}
        {!children && (label !== undefined ? label : String(enumKey))}
    </Chip>;
}
