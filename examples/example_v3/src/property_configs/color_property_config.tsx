import { FieldProps, PropertyConfig, PropertyPreviewProps, Typography } from "@firecms/firebase";

export const colorPropertyConfig: PropertyConfig = {
    name: "Color picker",
    key: "color",
    property: {
        dataType: "string",
        name: "Color",
        Field: ({ value, setValue }: FieldProps<string>) => {
            return <div className={"flex flex-row gap-4"}>
                <input
                    className={"input rounded-md"}
                    type="color"
                    value={value}
                    onChange={(evt: any) => setValue(evt.target.value)}/>
                <Typography>
                    Pick a color
                </Typography>
            </div>;
        },
        Preview: ({ value }: PropertyPreviewProps<string>) => {
            return <div
                className={"rounded-md"}
                style={{
                    width: 20,
                    height: 20,
                    backgroundColor: value,
                }}/>;
        },
    },
}
