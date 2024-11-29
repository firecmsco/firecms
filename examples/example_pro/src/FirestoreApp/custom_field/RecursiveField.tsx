import React, { ComponentType, useMemo } from "react";
import {
    FieldProps,
    getIconForProperty,
    LabelWithIcon,
    MapFieldBinding,
    MapProperty,
    RepeatFieldBinding,
    ResolvedArrayProperty,
    ResolvedNumberProperty,
    ResolvedProperty,
    ResolvedStringProperty,
    TextFieldBinding
} from "@firecms/core";
import { BooleanSwitchWithLabel, Paper, Select, SelectItem } from "@firecms/ui";

export const conditionProperty = (name: string): MapProperty => ({
    dataType: "map",
    name: name,
    properties: {
        name: {
            dataType: "string",
            name: "Name",
            validation: {
                required: true
            }
        },
        operator: {
            dataType: "string",
            name: "Operator",
            enumValues: {
                "==": "==",
                "!=": "!=",
                "in": "in",
                ">": ">",
                "<": "<",
                "startsWith": "startsWith",
                "endsWith": "endsWith",
                "includes": "includes"
            }
        },
        value: {
            name: "Value",
            dataType: "string",
            // @ts-ignore
            Field: UnionField
        },
        and: {
            dataType: "map",
            name: "And",
            Field: ConditionalField,
            customProps: {
                getProperty: () => conditionProperty("And condition")
            }
        },
        or: {
            dataType: "map",
            name: "Or",
            Field: ConditionalField,
            customProps: {
                getProperty: () => conditionProperty("Or condition")
            }
        },
    }
});

type ConditionalFieldProps = {
    getProperty: () => MapProperty
}

function ConditionalField({
                              value,
                              customProps,
                              ...props
                          }: FieldProps<object, ConditionalFieldProps>) {

    const { getProperty } = customProps;
    const [enabled, setEnabled] = React.useState<boolean>(Boolean(value));
    const resolvedProperty = useMemo(() => {
        if (enabled) {
            return getProperty();
        }
        return undefined;
    }, [enabled]);

    return (
        <>
            <LabelWithIcon
                icon={getIconForProperty(props.property, "small")}
                required={props.property.validation?.required}
                title={props.property.name}
                className={"text-text-secondary dark:text-text-secondary-dark ml-3.5 mt-4"}
            />
            <Paper className={"flex flex-col gap-2 p-2"}>
                <BooleanSwitchWithLabel size="small" value={enabled} onValueChange={setEnabled} label={"Enabled"}/>
                {enabled && resolvedProperty && <MapFieldBinding
                    {...props}
                    value={value}
                    customProps={customProps}
                    property={resolvedProperty}
                    minimalistView={true}
                />}
            </Paper>
        </>
    )

}

function UnionField({
                        value,
                        property,
                        ...props
                    }: FieldProps<string | number | (string | number)[]>) {

    const [type, setType] = React.useState<string>(inferTypeFromValue(value));
    const internalProperty: ResolvedProperty = useMemo(() => {
        if (type === "string") {
            return {
                ...property as ResolvedStringProperty,
                dataType: "string"
            }
        } else if (type === "number") {
            return {
                ...property as ResolvedNumberProperty,
                dataType: "number"
            }
        } else if (type === "string[]") {
            return {
                ...property as ResolvedArrayProperty,
                dataType: "array",
                of: {
                    dataType: "string"
                }
            };
        } else if (type === "number[]") {
            return {
                ...property as ResolvedArrayProperty,
                dataType: "array",
                of: {
                    dataType: "number"
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
                icon={getIconForProperty(property as ResolvedProperty, "small")}
                required={property.validation?.required}
                title={property.name}
                className={"text-text-secondary dark:text-text-secondary-dark ml-3.5"}
            />
            <Paper key={`form_control_${props.propertyKey}_${type}`} className={"flex flex-col gap-2 p-2"}>
                <Select size="medium"
                        value={type}
                        fullWidth={true}
                        onValueChange={setType}>
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

