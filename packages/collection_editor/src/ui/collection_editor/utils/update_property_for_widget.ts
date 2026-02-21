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
} from "@firecms/core";

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
            } satisfies StringProperty
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
            } satisfies StringProperty
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
            } satisfies StringProperty
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
            } satisfies StringProperty
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
            } satisfies StringProperty
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
            } satisfies StringProperty
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
            } satisfies StringProperty
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
            } satisfies ArrayProperty
        );
    } else if (selectedWidgetId === "number_input") {
        updatedProperty = mergeDeep(
            propertyData,
            {
                type: "number",
                propertyConfig: "number_input",
                enum: undefined
            } satisfies NumberProperty
        );
    } else if (selectedWidgetId === "number_select") {
        updatedProperty = mergeDeep(
            propertyData,
            {
                type: "number",
                propertyConfig: "number_select",
                enum: propertyData.enumValues ?? []
            } satisfies NumberProperty
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
            } satisfies ArrayProperty
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
            } satisfies StringProperty
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
            } satisfies ArrayProperty
        );
    } else if (selectedWidgetId === "group") {
        updatedProperty = mergeDeep(
            propertyData,
            {
                type: "map",
                propertyConfig: "group",
                keyValue: false,
                properties: propertyData.properties ?? {}
            } satisfies MapProperty
        );
    } else if (selectedWidgetId === "key_value") {
        updatedProperty = mergeDeep(
            propertyData,
            {
                type: "map",
                propertyConfig: "key_value",
                keyValue: true,
                properties: undefined
            } satisfies MapProperty
        );
    } else if (selectedWidgetId === "reference") {
        updatedProperty = mergeDeep(
            propertyData,
            {
                type: "reference",
                propertyConfig: "reference",
            } satisfies Property
        );
    } else if (selectedWidgetId === "reference_as_string") {
        updatedProperty = mergeDeep(
            propertyData,
            {
                type: "string",
                propertyConfig: "reference_as_string",
            } satisfies Property
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
            } satisfies ArrayProperty
        );
    } else if (selectedWidgetId === "switch") {
        updatedProperty = mergeDeep(
            propertyData,
            {
                type: "boolean",
                propertyConfig: "switch",
            } satisfies BooleanProperty
        );
    } else if (selectedWidgetId === "date_time") {
        updatedProperty = mergeDeep(
            propertyData,
            {
                type: "date",
                propertyConfig: "date_time",
                mode: "date_time"
            } satisfies DateProperty
        );
    } else if (selectedWidgetId === "repeat") {
        updatedProperty = mergeDeep(
            propertyData,
            {
                type: "array",
                propertyConfig: "repeat",
            } satisfies ArrayProperty
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
            } satisfies ArrayProperty
        );
    } else if (selectedWidgetId && propertyConfigs[selectedWidgetId]) {
        updatedProperty = {
            ...propertyConfigs[selectedWidgetId].property,
            propertyConfig: selectedWidgetId
        };
    }

    return updatedProperty;
}
