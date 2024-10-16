import { getIconForWidget } from "../util";
import { PropertyConfig } from "../types";
import { getDefaultFieldConfig } from "../core";

export function PropertyConfigBadge({
                                        propertyConfig,
                                        disabled
                                    }: {
    propertyConfig: PropertyConfig | undefined,
    disabled?: boolean
}): React.ReactNode {
    const classes = "h-8 w-8 p-1 rounded-full shadow text-white " + (disabled ? "bg-gray-400 dark:bg-gray-600" : "");

    const defaultPropertyConfig = typeof propertyConfig?.property === "object" ? getDefaultFieldConfig(propertyConfig.property) : undefined;

    return <div
        className={classes}
        style={{
            background: !disabled ? (propertyConfig?.color ?? defaultPropertyConfig?.color ?? "#888") : undefined
        }}>
        {propertyConfig?.Icon ? getIconForWidget(propertyConfig, "medium") : getIconForWidget(defaultPropertyConfig, "medium")}
    </div>
}
