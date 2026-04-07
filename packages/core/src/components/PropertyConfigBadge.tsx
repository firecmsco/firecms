import type { PropertyConfig } from "@rebasepro/types/cms";
;
import { getDefaultFieldConfig } from "../core";
import { getIconForWidget } from "../util";

export function PropertyConfigBadge({
    propertyConfig,
    disabled,
    size = "medium"
}: {
    propertyConfig: PropertyConfig | undefined,
    disabled?: boolean,
    size?: "extraSmall" | "small" | "medium"
}): React.ReactNode {
    const sizeClasses = size === "extraSmall" ? "h-5 w-5" : size === "small" ? "h-6 w-6" : "h-8 w-8";
    const iconSize = size === "extraSmall" ? 14 : size === "small" ? "smallest" : "small";
    const classes = `${sizeClasses} flex-shrink-0 flex items-center justify-center rounded-full shadow-2xs text-white ` + (disabled ? "bg-surface-400 dark:bg-surface-600" : "");

    const defaultPropertyConfig = typeof propertyConfig?.property === "object" ? getDefaultFieldConfig(propertyConfig.property as import("@rebasepro/types").Property) : undefined;

    return <div
        className={classes}
        style={{
            background: !disabled ? (propertyConfig?.color ?? defaultPropertyConfig?.color ?? "#888") : undefined
        }}>
        {propertyConfig?.Icon ? getIconForWidget(propertyConfig, iconSize) : getIconForWidget(defaultPropertyConfig, iconSize)}
    </div>
}
