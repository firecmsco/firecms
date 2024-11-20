import React from "react";
import { Checkbox, cls } from "@firecms/ui";
import { PreviewSize } from "../PropertyPreviewProps";
import { Property } from "../../types";

/**
 * @group Preview components
 */
export function BooleanPreview({
                                   value,
                                   size,
                                   property
                               }: {
    value: boolean,
    size: PreviewSize,
    property: Property,
}): React.ReactElement {
    return <div className={"flex flex-row gap-2 items-center"}>
        <Checkbox checked={value}
                  padding={false}
                  size={size}
                  color={"secondary"}/>
        {property.name && <span
            className={cls("text-text-secondary dark:text-text-secondary-dark", size === "small" ? "text-sm" : "")}>{property.name}</span>}
    </div>;
}
