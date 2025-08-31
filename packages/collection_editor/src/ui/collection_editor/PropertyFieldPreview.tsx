import {
    ErrorBoundary,
    getFieldConfig,
    isPropertyBuilder,
    Property,
    PropertyConfigBadge,
    useCustomizationController,
} from "@firecms/core";
import {
    cardClickableMixin,
    cardMixin,
    cardSelectedMixin,
    cls,
    DoNotDisturbOnIcon,
    FunctionsIcon,
    Paper,
    Typography,
} from "@firecms/ui";

import { editableProperty } from "../../utils/entities";

export function PropertyFieldPreview({
                                         property,
                                         onClick,
                                         hasError,
                                         includeName,
                                         includeEditButton,
                                         selected
                                     }: {
    property: Property,
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
        ? "border-red-500 dark:border-red-500 ring-0 dark:ring-0"
        : (selected ? "border-primary" : "border-transparent");

    return <ErrorBoundary>
        <div
            onClick={onClick}
            className="flex flex-row w-full cursor-pointer">
            <div className={"m-4"}>
                <PropertyConfigBadge propertyConfig={propertyConfig}/>
            </div>
            <Paper
                className={cls(
                    "m-1",
                    "border",
                    "pl-2 w-full flex flex-row gap-4 items-center",
                    cardMixin,
                    onClick ? cardClickableMixin : "",
                    selected ? cardSelectedMixin : "",
                    "grow p-4 border transition-colors duration-200",
                    borderColorClass
                )}
            >

                <div className="w-full flex flex-col">

                    {includeName &&
                        <ErrorBoundary>
                            <Typography variant="body1"
                                        component="span"
                                        className="grow pr-2">
                                {property.name
                                    ? property.name
                                    : "\u00a0"
                                }
                            </Typography>
                        </ErrorBoundary>}

                    <div className="flex flex-row items-center">
                        <ErrorBoundary>
                            <Typography className="grow pr-2"
                                        variant={includeName ? "body2" : "subtitle1"}
                                        component="span"
                                        color="secondary">
                                {propertyConfig?.name}
                            </Typography>
                        </ErrorBoundary>
                        <ErrorBoundary>
                            <Typography variant="body2"
                                        component="span"
                                        color="disabled">
                                {property.type}
                            </Typography>
                        </ErrorBoundary>

                    </div>
                </div>

                {includeEditButton && <Typography variant={"button"}>
                    EDIT
                </Typography>}

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
        <div
            onClick={onClick}
            className="flex flex-row w-full cursor-pointer">
            <div className={"relative m-4"}>
                {propertyConfig && <PropertyConfigBadge propertyConfig={propertyConfig}/>}
                {!propertyConfig && <div
                    className={"h-8 w-8 p-1 rounded-full shadow-2xs text-white bg-surface-500"}>
                    <FunctionsIcon color={"inherit"} size={"medium"}/>
                </div>}
                <DoNotDisturbOnIcon color={"disabled"} size={"small"} className={"absolute -right-2 -top-2"}/>
            </div>
            <Paper
                className={cls(
                    "pl-2 w-full flex flex-row gap-4 items-center",
                    cardMixin,
                    onClick ? cardClickableMixin : "",
                    selected ? cardSelectedMixin : "",
                    "grow p-4 border transition-colors duration-200",
                    selected ? "border-primary" : "border-transparent")}
            >

                <div className="w-full flex flex-col">
                    <Typography variant="body1"
                                component="span"
                                className="grow pr-2">
                        {property?.name
                            ? property.name
                            : name
                        }
                    </Typography>

                    <div className="flex flex-row items-center">
                        {propertyConfig && <Typography className="grow pr-2"
                                                       variant={"body2"}
                                                       component="span"
                                                       color="secondary">
                            {propertyConfig?.name}
                        </Typography>}

                        {property && !isPropertyBuilder(property) && <ErrorBoundary>
                            <Typography variant="body2"
                                        component="span"
                                        color="disabled">
                                {property.type}
                            </Typography>
                        </ErrorBoundary>}

                        {property && isPropertyBuilder(property) && <ErrorBoundary>
                            <Typography variant="body2"
                                        component="span"
                                        color="disabled">
                                This property is defined as a property builder in code
                            </Typography>
                        </ErrorBoundary>}

                        {!property && <ErrorBoundary>
                            <Typography variant="body2"
                                        component="span"
                                        color="disabled">
                                This field is defined as an additional field in code
                            </Typography>
                        </ErrorBoundary>}

                    </div>

                    {/*<div className="flex flex-row text-xs">*/}
                    {/*    <Typography className="grow pr-2"*/}
                    {/*                variant="body2"*/}
                    {/*                component="span"*/}
                    {/*                color="secondary">*/}
                    {/*        This field can only be edited in code*/}
                    {/*    </Typography>*/}
                    {/*</div>*/}
                </div>

            </Paper>
        </div>)
}
