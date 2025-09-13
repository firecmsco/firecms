import {
    ArrayProperty,
    FieldProps,
    getIconForProperty,
    LabelWithIcon,
    NumberProperty,
    Property,
    RepeatFieldBinding,
    StringProperty,
    TextFieldBinding
} from "@firecms/core";
import React, { ComponentType, useMemo } from "react";
import { Paper, Select, SelectItem } from "@firecms/ui";

export function UnionField({
                               value,
                               property,
                               ...props
                           }: FieldProps<string | number | (string | number)[]>) {

    const [type, setType] = React.useState<string>(inferTypeFromValue(value));
    const internalProperty: Property = useMemo(() => {
        if (type === "string") {
            return {
                ...property as StringProperty,
                type: "string"
            }
        } else if (type === "number") {
            return {
                ...property as NumberProperty,
                type: "number"
            }
        } else if (type === "string[]") {
            return {
                ...property as ArrayProperty,
                type: "array",
                of: {
                    type: "string"
                }
            };
        } else if (type === "number[]") {
            return {
                ...property as ArrayProperty,
                type: "array",
                of: {
                    type: "number"
                }
            }
        } else {
            throw new Error("Invalid type")
        }
    }, [type]);

    const Component: ComponentType<FieldProps<any>> = useMemo(() => {
        if (type === "string") {
            return TextFieldBinding;
        } else if (type === "number") {
            return TextFieldBinding;
        } else if (type === "string[]") {
            return RepeatFieldBinding;
        } else if (type === "number[]") {
            return RepeatFieldBinding;
        } else {
            throw new Error("Invalid type")
        }
    }, [type]);

    return (<>
            <LabelWithIcon
                icon={getIconForProperty(property as Property, "small")}
                required={property.validation?.required}
                title={property.name ?? propertyKey}
                className={"text-text-secondary dark:text-text-secondary-dark ml-3.5"}
            />
            <Paper key={`form_control_${props.propertyKey}_${type}`} className={"flex flex-col gap-2 p-2"}>
                <Select size="small" value={type} onValueChange={setType}
                        fullWidth={true}
                        renderValue={(value) => <div>{value}</div>}>
                    <SelectItem value={"string"}>String</SelectItem>
                    <SelectItem value={"number"}>Number</SelectItem>
                    <SelectItem value={"string[]"}>String Array</SelectItem>
                    <SelectItem value={"number[]"}>Number Array</SelectItem>
                </Select>
                <Component key={`form_control_${props.propertyKey}_${type}`}
                           value={value}
                           property={internalProperty}
                           {...props}
                           minimalistView={true}/>
            </Paper>
        </>
    )

}

function inferTypeFromValue(value: string | number | (string | number)[]) {
    if (Array.isArray(value)) {
        if (value.length > 0) {
            return typeof value[0] === "string" ? "string[]" : "number[]";
        } else {
            return "string[]";
        }
    } else {
        return typeof value === "number" ? "number" : "string";
    }
}
