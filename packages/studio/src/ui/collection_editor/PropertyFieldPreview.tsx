import {
    ErrorBoundary,
    getFieldConfig,
    isPropertyBuilder,
    Property,
    PropertyConfigBadge,
    useCustomizationController,
} from "@rebasepro/core";
import {
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
                "w-full flex flex-row gap-3 items-center px-3 py-2 rounded-lg transition-all duration-200 border border-transparent bg-transparent",
                selected 
                    ? "bg-primary/5 dark:bg-primary/10 ring-1 ring-inset ring-primary" 
                    : "hover:bg-surface-50 dark:hover:bg-surface-800"
            )}
        >
            <PropertyConfigBadge propertyConfig={propertyConfig} size="small" />

            <div className="w-full flex flex-col pr-8">
                {includeName &&
                    <ErrorBoundary>
                        <div className="flex items-center gap-2">
                            <Typography variant="body2" component="span">
                                {property.name || propertyKey || "\u00a0"}
                            </Typography>
                            {property.name && propertyKey && property.name !== propertyKey && (
                                <Typography variant="caption" component="span" color="secondary" className="font-mono">
                                    {propertyKey}
                                </Typography>
                            )}
                        </div>
                    </ErrorBoundary>}

                <div className="flex flex-row items-center gap-2 mt-0.5">
                    <ErrorBoundary>
                        <Typography
                            variant={"caption"}
                            component="span"
                            className="text-text-secondary dark:text-text-secondary-dark font-medium">
                            {propertyConfig?.name}
                        </Typography>
                    </ErrorBoundary>
                    <ErrorBoundary>
                        <Typography variant="caption" component="span" className="text-text-disabled dark:text-text-disabled-dark font-mono bg-surface-100 dark:bg-surface-800 px-1 py-0.5 rounded">
                            {("columnType" in property ? (property as any).columnType as string : undefined) || property.type}
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
                "w-full flex flex-row gap-3 items-center px-3 py-2 rounded-lg transition-all duration-200 border border-transparent bg-transparent",
                selected 
                    ? "bg-primary/5 dark:bg-primary/10 ring-1 ring-inset ring-primary" 
                    : "hover:bg-surface-50 dark:hover:bg-surface-800"
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

                <div className="flex flex-row items-center gap-2 mt-0.5">
                    {propertyConfig && <Typography variant={"caption"} component="span" className="text-text-secondary dark:text-text-secondary-dark font-medium">
                        {propertyConfig?.name}
                    </Typography>}

                    {property && !isPropertyBuilder(property) && <ErrorBoundary>
                        <Typography variant="caption" component="span" className="text-text-disabled dark:text-text-disabled-dark font-mono bg-surface-100 dark:bg-surface-800 px-1 py-0.5 rounded">
                            {("columnType" in property ? (property as any).columnType as string : undefined) || property.type}
                        </Typography>
                    </ErrorBoundary>}

                    {property && isPropertyBuilder(property) && <ErrorBoundary>
                        <Typography variant="caption" component="span" className="text-text-disabled dark:text-text-disabled-dark">
                            Defined in code
                        </Typography>
                    </ErrorBoundary>}

                    {!property && <ErrorBoundary>
                        <Typography variant="caption" component="span" className="text-text-disabled dark:text-text-disabled-dark">
                            Additional field
                        </Typography>
                    </ErrorBoundary>}
                </div>
            </div>
        </Paper>
        </div>
    )
}
