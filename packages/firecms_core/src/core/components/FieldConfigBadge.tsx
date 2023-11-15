import { getIconForWidget } from "../util";
import { PropertyConfig } from "../../types";

export function FieldConfigBadge({ propertyConfig }: { propertyConfig: PropertyConfig | undefined }): React.ReactNode {
    const classes = "h-8 w-8 p-1 rounded-full shadow text-white";

    return <div
        className={classes}
        style={{
            background: propertyConfig?.color ?? "#888"
        }}>
        {getIconForWidget(propertyConfig, "medium")}
    </div>
}
