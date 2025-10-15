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
    const classes = "h-8 w-8 flex items-center justify-center rounded-full shadow text-white " + (disabled ? "bg-surface-400 dark:bg-surface-600" : "");

    const defaultPropertyConfig = typeof propertyConfig?.property === "object" ? getDefaultFieldConfig(propertyConfig.property) : undefined;

    return <div
        className={classes}
        style={{
            background: !disabled ? (propertyConfig?.color ?? defaultPropertyConfig?.color ?? "#888") : undefined
        }}>
        {propertyConfig?.Icon ? getIconForWidget(propertyConfig, "small") : getIconForWidget(defaultPropertyConfig, "small")}
    </div>
}
