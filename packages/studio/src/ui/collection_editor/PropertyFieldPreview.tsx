import {
    ErrorBoundary,
    getFieldConfig,
    isPropertyBuilder,
    Property,
    PropertyConfigBadge,
    useCustomizationController,
} from "@rebasepro/core";
import {
    cardClickableMixin,
    cardMixin,
    cardSelectedMixin,
    cls,
    DoNotDisturbOnIcon,
    FunctionsIcon,
    Paper,
    Typography,
} from "@rebasepro/ui";

import { editableProperty } from "../../utils/entities";

export function PropertyFieldPreview({
    property,
    propertyKey,
    onClick,
    hasError,
    includeName,
    includeEditButton,
    selected
}: {
    property: Property,
    propertyKey?: string,
    hasError?: boolean,
    selected?: boolean,
    includeName?: boolean,
    includeEditButton?: boolean;
    onClick?: () => void
}) {

    const { propertyConfigs } = useCustomizationController();
    const propertyConfig = getFieldConfig(property, propertyConfigs);
    const disabled = !editableProperty(property);

    const borderColorClass = hasError
        ? "border-red-500 dark:border-red-500 border-red-500/100 dark:border-red-500/100 ring-0 dark:ring-0"
        : (selected ? "border-primary" : "");

    return <ErrorBoundary>
        <div onClick={onClick} className={onClick ? "cursor-pointer" : ""}>
        <Paper
            className={cls(
                cardMixin,
                "border w-full flex flex-row gap-4 items-center px-4 py-1",
                onClick ? cardClickableMixin : "",
                selected ? cardSelectedMixin : "",
                "border transition-colors duration-200",
                selected ? "border-primary" : ""
            )}
        >
            <PropertyConfigBadge propertyConfig={propertyConfig} size="small" />

            <div className="w-full flex flex-col pr-8">
                {includeName &&
                    <ErrorBoundary>
                        <div className="flex items-center gap-2">
                            <Typography variant="body2" component="span" className="font-semibold">
                                {property.name || propertyKey || "\u00a0"}
                            </Typography>
                            {property.name && propertyKey && property.name !== propertyKey && (
                                <Typography variant="caption" component="span" color="secondary" className="font-mono">
                                    {propertyKey}
                                </Typography>
                            )}
                        </div>
                    </ErrorBoundary>}

                <div className="flex flex-row items-center gap-2">
                    <ErrorBoundary>
                        <Typography
                            variant={"caption"}
                            component="span"
                            color="secondary">
                            {propertyConfig?.name}
                        </Typography>
                    </ErrorBoundary>
                    <ErrorBoundary>
                        <Typography variant="caption" component="span" color="disabled" className="font-mono">
                            {property.type}
                        </Typography>
                    </ErrorBoundary>
                </div>
            </div>

            {includeEditButton && <Typography variant={"button"}>EDIT</Typography>}
        </Paper>
        </div>
    </ErrorBoundary>
}

export function NonEditablePropertyPreview({
    name,
    selected,
    onClick,
    property
}: {
    name: string,
    selected: boolean,
    onClick?: () => void,
    property?: Property
}) {

    const { propertyConfigs } = useCustomizationController();
    const propertyConfig = !isPropertyBuilder(property) && property ? getFieldConfig(property, propertyConfigs) : undefined;

    return (
        <div onClick={onClick} className={onClick ? "cursor-pointer" : ""}>
        <Paper
            className={cls(
                cardMixin,
                "border w-full flex flex-row gap-4 items-center px-4 py-1",
                onClick ? cardClickableMixin : "",
                selected ? cardSelectedMixin : "",
                "border transition-colors duration-200",
                selected ? "border-primary" : ""
            )}
        >
            <div className={"relative shrink-0"}>
                {propertyConfig && <PropertyConfigBadge propertyConfig={propertyConfig} size="small" />}
                {!propertyConfig && <div
                    className={"h-8 w-8 flex items-center justify-center rounded-full shadow-2xs text-white bg-surface-500"}>
                    <FunctionsIcon color={"inherit"} size={"small"} />
                </div>}
                <DoNotDisturbOnIcon color={"disabled"} size={"small"} className={"absolute -right-2 -top-2 bg-surface-50 dark:bg-surface-900 rounded-full"} />
            </div>

            <div className="w-full flex flex-col pr-8">
                <Typography variant="label" component="span" className="grow pr-2">
                    {property?.name ? property.name : name}
                </Typography>

                <div className="flex flex-row items-center gap-2">
                    {propertyConfig && <Typography variant={"body2"} component="span" color="secondary">
                        {propertyConfig?.name}
                    </Typography>}

                    {property && !isPropertyBuilder(property) && <ErrorBoundary>
                        <Typography variant="caption" component="span" color="disabled">
                            {property.type}
                        </Typography>
                    </ErrorBoundary>}

                    {property && isPropertyBuilder(property) && <ErrorBoundary>
                        <Typography variant="caption" component="span" color="disabled">
                            Defined in code
                        </Typography>
                    </ErrorBoundary>}

                    {!property && <ErrorBoundary>
                        <Typography variant="caption" component="span" color="disabled">
                            Additional field
                        </Typography>
                    </ErrorBoundary>}
                </div>
            </div>
        </Paper>
        </div>
    )
}
