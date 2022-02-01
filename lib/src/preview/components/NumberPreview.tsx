import React from "react";

import { EnumValuesChip } from "./CustomChip";
import { PreviewComponentProps } from "../internal";
import { resolveEnum } from "../../core/utils";
import { useSchemaRegistry } from "../../hooks/useSchemaRegistry";

/**
 * @category Preview components
 */
export function NumberPreview({
                                  name,
                                  value,
                                  property,
                                  size
                              }: PreviewComponentProps<number>): React.ReactElement {


    const schemaRegistry = useSchemaRegistry();

    if (property.enumValues) {
        const enumKey = value;
        const enumValues = resolveEnum(property.enumValues, schemaRegistry.enumConfigs);
        return <EnumValuesChip
            enumId={enumKey}
            enumValues={enumValues}
            small={size !== "regular"}/>;
    } else {
        return <>{value}</>;
    }
}
