import { getIconForProperty, LabelWithIcon } from "@firecms/core";
import { FieldProps, PropertyConfig, PropertyPreviewProps, Typography } from "@firecms/firebase";

export const colorPropertyConfig: PropertyConfig = {
    name: "Color picker",
    key: "color",
    property: {
        dataType: "string",
        Field: ({ value, setValue, tableMode, property }: FieldProps<string>) => {
            return <>
                {!tableMode && <LabelWithIcon icon={getIconForProperty(property, "small")}
                                              required={property.validation?.required}
                                              title={property.name}/>}
                <div className={"flex flex-row gap-4"}>
                    <input
                        className={"rounded-md"}
                        type="color"
                        value={value}
                        onChange={(evt: any) => setValue(evt.target.value)}/>
                    <Typography>
                        Pick a color
                    </Typography>
                </div>
            </>;
        },
        Preview: ({ value }: PropertyPreviewProps<string>) => {
            return <div
                className={"rounded-md w-5 h-5"}
                style={{
                    backgroundColor: value,
                }}/>;
        },
    },
}
