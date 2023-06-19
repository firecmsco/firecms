import React from "react";

import { EnumValueConfig } from "../../types";
import { ErrorBoundary } from "../../core";
import { EnumValuesChip } from "./EnumValuesChip";
import { PreviewSize } from "../PropertyPreviewProps";

/**
 * @category Preview components
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
        <div className="flex flex-wrap gap-2">
            {value && value.map((enumKey, index) => {
                    return (
                        <ErrorBoundary
                            key={`preview_array_ref_${name}_${index}`}>
                            <EnumValuesChip
                                enumKey={enumKey}
                                enumValues={enumValues}
                                small={size !== "regular"}/>
                        </ErrorBoundary>
                    );
                }
            )}
        </div>
    );
}
