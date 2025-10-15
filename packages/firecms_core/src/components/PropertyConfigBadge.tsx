import { PropertyConfig } from "@firecms/types";
import { getDefaultFieldConfig } from "../core";
import { getIconForWidget } from "../util";

export function PropertyConfigBadge({
                                        propertyConfig,
                                        disabled
                                    }: {
    propertyConfig: PropertyConfig | undefined,
    disabled?: boolean
}): React.ReactNode {
    const classes = "h-8 w-8 flex items-center justify-center rounded-full shadow-2xs text-white " + (disabled ? "bg-surface-400 dark:bg-surface-600" : "");

    const defaultPropertyConfig = typeof propertyConfig?.property === "object" ? getDefaultFieldConfig(propertyConfig.property) : undefined;

    return <div
        className={classes}
        style={{
            background: !disabled ? (propertyConfig?.color ?? defaultPropertyConfig?.color ?? "#888") : undefined
        }}>
        {propertyConfig?.Icon ? getIconForWidget(propertyConfig, "small") : getIconForWidget(defaultPropertyConfig, "small")}
    </div>
}
