import React from "react";
import {
    cn,
    EditIcon,
    ErrorBoundary,
    FieldConfigBadge,
    FunctionsIcon,
    getFieldConfig,
    IconButton,
    Paper,
    Property,
    RemoveCircleIcon,
    TextField,
    Typography
} from "firecms";

export function ImportPropertyFieldPreview({
                                               importKey,
                                               propertyKey,
                                               property,
                                               onEditClick,
                                               hasError,
                                               includeName = true,
                                               selected,
                                               onPropertyNameChanged,
                                               propertyTypeView
                                           }: {
    importKey: string,
    propertyKey: string,
    property: Property
    hasError?: boolean,
    selected?: boolean,
    includeName?: boolean,
    onEditClick?: () => void,
    onPropertyNameChanged?: (propertyKey: string, value: string) => void,
    propertyTypeView?: React.ReactNode
}) {

    const widget = getFieldConfig(property);

    return <ErrorBoundary>
        <div
            className="flex flex-row w-full items-center">

            <div className={"mx-4"}>
                {propertyTypeView ?? <FieldConfigBadge widget={widget}/>}
            </div>

            <div className="w-full flex flex-col grow">

                <div className={"flex flex-row items-center gap-2"}>
                    {includeName &&
                        <TextField
                            size={"small"}
                            className={"text-base grow"}
                            value={property.name ?? ""}
                            onChange={(e) => {
                                if (onPropertyNameChanged)
                                    onPropertyNameChanged(propertyKey, e.target.value);
                            }}/>}

                    <IconButton onClick={onEditClick} size={"small"}>
                        <EditIcon size={"small"}/>
                    </IconButton>
                </div>

            </div>


        </div>
    </ErrorBoundary>
}

export function PropertyBuilderPreview({
                                           name,
                                           selected,
                                           onClick
                                       }: {
    name: string,
    selected
        :
        boolean,
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
