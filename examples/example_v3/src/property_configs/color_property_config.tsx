import { PropertyConfig } from "@firecms/core";

export const colorPropertyConfig: PropertyConfig = {
    name: "Color picker",
    key: "color",
    property: {
        dataType: "string",
        name: "Color",
        Field: ({ value, setValue }) => {
            return <input
                type="color"
                value={value}
                onChange={(evt: any) => setValue(evt.target.value)}/>;
        },
        Preview: ({ value }) => {
            return <div style={{
                width: 20,
                height: 20,
                backgroundColor: value,
                borderRadius: "4px",
            }}/>;
        },
    },
}
