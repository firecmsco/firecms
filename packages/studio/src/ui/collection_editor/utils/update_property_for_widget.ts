import {
    ArrayProperty,
    BooleanProperty,
    DateProperty,
    MapProperty,
    mergeDeep,
    NumberProperty,
    Property,
    PropertyConfig,
    StringProperty
} from "@rebasepro/core";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- propertyData is a partial property shape built incrementally via mergeDeep
export function updatePropertyFromWidget(propertyData: any,
    selectedWidgetId: string | undefined,
    propertyConfigs: Record<string, PropertyConfig>): Property {

    let updatedProperty;
    if (selectedWidgetId === "text_field") {
        updatedProperty = mergeDeep(
            propertyData,
            {
                type: "string",
                propertyConfig: "text_field",
                storage: undefined,
                multiline: undefined,
                markdown: undefined,
                email: undefined,
                url: undefined,
                enum: undefined,
                userSelect: undefined
            } as StringProperty
        );
    } else if (selectedWidgetId === "user_select") {
        updatedProperty = mergeDeep(
            propertyData,
            {
                type: "string",
                propertyConfig: "user_select",
                storage: undefined,
                multiline: undefined,
                markdown: undefined,
                email: undefined,
                url: undefined,
                enum: undefined,
                userSelect: true
            } as StringProperty
        );
    } else if (selectedWidgetId === "multiline") {
        updatedProperty = mergeDeep(
            propertyData,
            {
                type: "string",
                propertyConfig: "multiline",
                multiline: true,
                storage: undefined,
                markdown: undefined,
                email: undefined,
                url: undefined,
                enum: undefined,
                userSelect: undefined
            } as StringProperty
        );
    } else if (selectedWidgetId === "markdown") {
        updatedProperty = mergeDeep(
            propertyData,
            {
                type: "string",
                propertyConfig: "markdown",
                storage: undefined,
                multiline: undefined,
                markdown: true,
                email: undefined,
                url: undefined,
                userSelect: undefined
            } as StringProperty
        );
    } else if (selectedWidgetId === "url") {
        updatedProperty = mergeDeep(
            propertyData,
            {
                type: "string",
                propertyConfig: "url",
                storage: undefined,
                multiline: undefined,
                markdown: undefined,
                email: undefined,
                url: true,
                enum: undefined,
                userSelect: undefined
            } as StringProperty
        );
    } else if (selectedWidgetId === "email") {
        updatedProperty = mergeDeep(
            propertyData,
            {
                type: "string",
                propertyConfig: "email",
                storage: undefined,
                multiline: undefined,
                markdown: undefined,
                email: true,
                url: undefined,
                enum: undefined,
                userSelect: undefined
            } as StringProperty
        );
    } else if (selectedWidgetId === "select") {
        updatedProperty = mergeDeep(
            propertyData,
            {
                type: "string",
                propertyConfig: "select",
                storage: undefined,
                multiline: undefined,
                markdown: undefined,
                email: undefined,
                url: undefined,
                enum: propertyData.enumValues ?? [],
                userSelect: undefined
            } as StringProperty
        );
    } else if (selectedWidgetId === "multi_select") {
        updatedProperty = mergeDeep(
            propertyData,
            {
                type: "array",
                propertyConfig: "multi_select",
                of: {
                    type: "string",
                    enum: propertyData.of?.enum ?? []
                }
            } as ArrayProperty
        );
    } else if (selectedWidgetId === "number_input") {
        updatedProperty = mergeDeep(
            propertyData,
            {
                type: "number",
                propertyConfig: "number_input",
                enum: undefined
            } as NumberProperty
        );
    } else if (selectedWidgetId === "number_select") {
        updatedProperty = mergeDeep(
            propertyData,
            {
                type: "number",
                propertyConfig: "number_select",
                enum: propertyData.enumValues ?? []
            } as NumberProperty
        );
    } else if (selectedWidgetId === "multi_number_select") {
        updatedProperty = mergeDeep(
            propertyData,
            {
                type: "array",
                propertyConfig: "multi_number_select",
                of: {
                    type: "number",
                    enum: propertyData.of?.enum ?? []
                }
            } as ArrayProperty
        );
    } else if (selectedWidgetId === "file_upload") {
        updatedProperty = mergeDeep(
            propertyData,
            {
                type: "string",
                propertyConfig: "file_upload",
                storage: {
                    storagePath: "/"
                }
            } as StringProperty
        );
    } else if (selectedWidgetId === "multi_file_upload") {
        updatedProperty = mergeDeep(
            propertyData,
            {
                type: "array",
                propertyConfig: "multi_file_upload",
                of: {
                    type: "string",
                    storage: propertyData.of?.storage ?? {
                        storagePath: "/"
                    }
                }
            } as ArrayProperty
        );
    } else if (selectedWidgetId === "group") {
        updatedProperty = mergeDeep(
            propertyData,
            {
                type: "map",
                propertyConfig: "group",
                keyValue: false,
                properties: propertyData.properties ?? {}
            } as MapProperty
        );
    } else if (selectedWidgetId === "key_value") {
        updatedProperty = mergeDeep(
            propertyData,
            {
                type: "map",
                propertyConfig: "key_value",
                keyValue: true,
                properties: undefined
            } as MapProperty
        );
    } else if (selectedWidgetId === "reference") {
        updatedProperty = mergeDeep(
            propertyData,
            {
                type: "reference",
                propertyConfig: "reference",
            } as Property
        );
    } else if (selectedWidgetId === "reference_as_string") {
        updatedProperty = mergeDeep(
            propertyData,
            {
                type: "string",
                propertyConfig: "reference_as_string",
            } as Property
        );
    } else if (selectedWidgetId === "multi_references") {
        updatedProperty = mergeDeep(
            propertyData,
            {
                type: "array",
                propertyConfig: "multi_references",
                of: {
                    type: "reference"
                }
            } as ArrayProperty
        );
    } else if (selectedWidgetId === "switch") {
        updatedProperty = mergeDeep(
            propertyData,
            {
                type: "boolean",
                propertyConfig: "switch",
            } as BooleanProperty
        );
    } else if (selectedWidgetId === "date_time") {
        updatedProperty = mergeDeep(
            propertyData,
            {
                type: "date",
                propertyConfig: "date_time",
                mode: "date_time"
            } as DateProperty
        );
    } else if (selectedWidgetId === "repeat") {
        updatedProperty = mergeDeep(
            propertyData,
            {
                type: "array",
                propertyConfig: "repeat",
            } as ArrayProperty
        );
    } else if (selectedWidgetId === "block") {
        updatedProperty = mergeDeep(
            propertyData,
            {
                type: "array",
                propertyConfig: "block",
                oneOf: {
                    properties: {}
                }
            } as ArrayProperty
        );
    } else if (selectedWidgetId && propertyConfigs[selectedWidgetId]) {
        updatedProperty = {
            ...propertyConfigs[selectedWidgetId].property,
            propertyConfig: selectedWidgetId
        };
    }

    return updatedProperty;
}
