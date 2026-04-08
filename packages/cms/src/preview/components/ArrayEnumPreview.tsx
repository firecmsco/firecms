import React from "react";

import { EnumValueConfig } from "@rebasepro/types";
import type { PreviewSize } from "../../types/components/PropertyPreviewProps";
import { EnumValuesChip } from "./EnumValuesChip";
import { ErrorBoundary } from "@rebasepro/ui";

/**
 * @group Preview components
 */
export function ArrayEnumPreview({
    name,
    value,
    enumValues,
    size
}: {
    value: string[] | number[],
    name: string | undefined,
    enumValues: EnumValueConfig[],
    size: PreviewSize
}) {

    return (
        <div className="flex flex-wrap gap-1.5">
            {value && value.map((enumKey, index) => {
                return (
                    <ErrorBoundary
                        key={`preview_array_ref_${name}_${index}`}>
                        <EnumValuesChip
                            enumKey={enumKey}
                            enumValues={enumValues}
                            size={size !== "medium" ? "small" : "medium"} />
                    </ErrorBoundary>
                );
            }
            )}
        </div>
    );
}
