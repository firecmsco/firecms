import {
    cardClickableMixin,
    cardMixin,
    cardSelectedMixin,
    cn,
    ErrorBoundary,
    FieldConfigBadge,
    FunctionsIcon,
    getFieldConfig,
    Paper,
    Property,
    RemoveCircleIcon,
    Typography
} from "firecms";

export function PropertyFieldPreview({
                                         propertyKey,
                                         property,
                                         onClick,
                                         hasError,
                                         includeName = true,
                                         selected
                                     }: {
    propertyKey: string,
    property: Property
    hasError?: boolean,
    selected?: boolean,
    includeName?: boolean,
    onClick?: () => void
}) {

    const widget = getFieldConfig(property);

    const borderColorClass = hasError
        ? "border-red-500"
        : (selected ? "border-blue-500" : "border-transparent");

    return <ErrorBoundary>
        <div
            onClick={onClick}
            className="flex flex-row w-full cursor-pointer">
            <div className={"m-4"}>
                <FieldConfigBadge widget={widget}/>
            </div>
            <Paper
                className={cn(
                    "pl-2 w-full flex flex-row gap-4 items-center",
                    cardMixin,
                    onClick ? cardClickableMixin : "",
                    selected ? cardSelectedMixin : "",
                    "flex-grow p-4 border transition-colors duration-200",
                    borderColorClass
                )}
            >

                <div className="w-full flex flex-col">

                    {includeName &&
                        <ErrorBoundary>
                            <Typography variant="body1"
                                        component="span"
                                        className="flex-grow pr-2">
                                {property.name
                                    ? property.name
                                    : "\u00a0"
                                }
                            </Typography>
                        </ErrorBoundary>}

                    <div className="flex flex-row items-center">
                        <ErrorBoundary>
                            <Typography className="flex-grow pr-2"
                                        variant={includeName ? "body2" : "subtitle1"}
                                        component="span"
                                        color="secondary">
                                {propertyKey}
                            </Typography>
                        </ErrorBoundary>
                        <ErrorBoundary>
                            <Typography variant="body2"
                                        component="span"
                                        color="disabled">
                                {widget?.name} - {property.dataType}
                            </Typography>
                        </ErrorBoundary>
                    </div>
                </div>

            </Paper>
        </div>
    </ErrorBoundary>
}

export function PropertyBuilderPreview({
                                           name,
                                           selected,
                                           onClick
                                       }: {
    name: string,
    selected: boolean,
    onClick?: () => void,
}) {

    return (
        <div
            onClick={onClick}
            className="flex flex-row w-full cursor-pointer">
            <div className="bg-gray-500 h-8 mt-0.5 p-0.5 rounded-full shadow-md text-white">
                <FunctionsIcon color={"inherit"} size={"medium"}/>
            </div>
            <div className="pl-12 w-full flex flex-row">
                <Paper
                    className={cn("flex-grow p-2 border border-blue-500",
                        selected ? "bg-blue-50 dark:bg-blue-800" : "bg-transparent")}
                >

                    <div className="w-full flex flex-col">
                        <Typography variant="body2"
                                    component="span"
                                    color="disabled">

                            {name}
                        </Typography>
                        <div className="flex flex-row text-xs">
                            <Typography className="flex-grow pr-2"
                                        variant="body2"
                                        component="span"
                                        color="secondary">
                                This field can only be edited in code
                            </Typography>
                            <RemoveCircleIcon color={"disabled"}/>
                        </div>
                    </div>

                </Paper>
            </div>
        </div>)
}
