import React from "react";
import {
    EditIcon,
    ErrorBoundary,
    FieldConfigBadge,
    getFieldConfig,
    IconButton,
    Property,
    TextField,
    useFireCMSContext
} from "@firecms/core";

export function ImportNewPropertyFieldPreview({
                                                  propertyKey,
                                                  property,
                                                  onEditClick,
                                                  includeName = true,
                                                  onPropertyNameChanged,
                                                  propertyTypeView
                                              }: {
    propertyKey: string | null,
    property: Property | null
    includeName?: boolean,
    onEditClick?: () => void,
    onPropertyNameChanged?: (propertyKey: string, value: string) => void,
    propertyTypeView?: React.ReactNode
}) {

    const { propertyConfigs } = useFireCMSContext();
    const widget = property ? getFieldConfig(property, propertyConfigs) : null;

    return <ErrorBoundary>
        <div
            className="flex flex-row w-full items-center">

            <div className={"mx-4"}>
                {propertyTypeView ?? <FieldConfigBadge propertyConfig={widget ?? undefined}/>}
            </div>

            <div className="w-full flex flex-col grow">

                <div className={"flex flex-row items-center gap-2"}>
                    {includeName &&
                        <TextField
                            size={"small"}
                            className={"text-base grow"}
                            value={property?.name ?? ""}
                            onChange={(e) => {
                                if (onPropertyNameChanged && propertyKey)
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
