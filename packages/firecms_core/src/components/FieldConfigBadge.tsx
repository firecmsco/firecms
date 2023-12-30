import { getIconForWidget } from "../util";
import { PropertyConfig } from "../types";
import { getDefaultFieldConfig } from "../core";

export function FieldConfigBadge({ propertyConfig }: { propertyConfig: PropertyConfig | undefined }): React.ReactNode {
    const classes = "h-8 w-8 p-1 rounded-full shadow text-white";

    const defaultPropertyConfig = typeof propertyConfig?.property === "object" ? getDefaultFieldConfig(propertyConfig.property) : undefined;

    return <div
        className={classes}
        style={{
            background: propertyConfig?.color ?? defaultPropertyConfig?.color ?? "#888"
        }}>
        {propertyConfig?.Icon ? getIconForWidget(propertyConfig, "medium") : getIconForWidget(defaultPropertyConfig, "medium")}
    </div>
}
