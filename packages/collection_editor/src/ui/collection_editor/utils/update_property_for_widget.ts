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
                dataType: "string",
                propertyConfig: "text_field",
                editable: propertyData.editable !== undefined ? propertyData.editable : true,
                storage: undefined,
                multiline: undefined,
                markdown: undefined,
                email: undefined,
                url: undefined,
                enumValues: undefined
            } satisfies StringProperty
        );
    } else if (selectedWidgetId === "multiline") {
        updatedProperty = mergeDeep(
            propertyData,
            {
                dataType: "string",
                propertyConfig: "multiline",
                editable: propertyData.editable !== undefined ? propertyData.editable : true,
                multiline: true,
                storage: undefined,
                markdown: undefined,
                email: undefined,
                url: undefined,
                enumValues: undefined
            } satisfies StringProperty
        );
    } else if (selectedWidgetId === "markdown") {
        updatedProperty = mergeDeep(
            propertyData,
            {
                dataType: "string",
                propertyConfig: "markdown",
                editable: propertyData.editable !== undefined ? propertyData.editable : true,
                storage: undefined,
                multiline: undefined,
                markdown: true,
                email: undefined,
                url: undefined
            } satisfies StringProperty
        );
    } else if (selectedWidgetId === "url") {
        updatedProperty = mergeDeep(
            propertyData,
            {
                dataType: "string",
                propertyConfig: "url",
                editable: propertyData.editable !== undefined ? propertyData.editable : true,
                storage: undefined,
                multiline: undefined,
                markdown: undefined,
                email: undefined,
                url: true,
                enumValues: undefined
            } satisfies StringProperty
        );
    } else if (selectedWidgetId === "email") {
        updatedProperty = mergeDeep(
            propertyData,
            {
                dataType: "string",
                propertyConfig: "email",
                editable: propertyData.editable !== undefined ? propertyData.editable : true,
                storage: undefined,
                multiline: undefined,
                markdown: undefined,
                email: true,
                url: undefined,
                enumValues: undefined
            } satisfies StringProperty
        );
    } else if (selectedWidgetId === "select") {
        updatedProperty = mergeDeep(
            propertyData,
            {
                dataType: "string",
                propertyConfig: "select",
                editable: propertyData.editable !== undefined ? propertyData.editable : true,
                storage: undefined,
                multiline: undefined,
                markdown: undefined,
                email: undefined,
                url: undefined,
                enumValues: propertyData.enumValues ?? []
            } satisfies StringProperty
        );
    } else if (selectedWidgetId === "multi_select") {
        updatedProperty = mergeDeep(
            propertyData,
            {
                dataType: "array",
                propertyConfig: "multi_select",
                editable: propertyData.editable !== undefined ? propertyData.editable : true,
                of: {
                    dataType: "string",
                    enumValues: propertyData.of?.enumValues ?? []
                }
            } satisfies ArrayProperty
        );
    } else if (selectedWidgetId === "number_input") {
        updatedProperty = mergeDeep(
            propertyData,
            {
                dataType: "number",
                propertyConfig: "number_input",
                editable: propertyData.editable !== undefined ? propertyData.editable : true,
                enumValues: undefined
            } satisfies NumberProperty
        );
    } else if (selectedWidgetId === "number_select") {
        updatedProperty = mergeDeep(
            propertyData,
            {
                dataType: "number",
                propertyConfig: "number_select",
                editable: propertyData.editable !== undefined ? propertyData.editable : true,
                enumValues: propertyData.enumValues ?? []
            } satisfies NumberProperty
        );
    } else if (selectedWidgetId === "multi_number_select") {
        updatedProperty = mergeDeep(
            propertyData,
            {
                dataType: "array",
                propertyConfig: "multi_number_select",
                editable: propertyData.editable !== undefined ? propertyData.editable : true,
                of: {
                    dataType: "number",
                    enumValues: propertyData.of?.enumValues ?? []
                }
            } satisfies ArrayProperty
        );
    } else if (selectedWidgetId === "file_upload") {
        updatedProperty = mergeDeep(
            propertyData,
            {
                dataType: "string",
                propertyConfig: "file_upload",
                editable: propertyData.editable !== undefined ? propertyData.editable : true,
                storage: {
                    storagePath: "/"
                }
            } satisfies StringProperty
        );
    } else if (selectedWidgetId === "multi_file_upload") {
        updatedProperty = mergeDeep(
            propertyData,
            {
                dataType: "array",
                propertyConfig: "multi_file_upload",
                editable: propertyData.editable !== undefined ? propertyData.editable : true,
                of: {
                    dataType: "string",
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
                dataType: "map",
                propertyConfig: "group",
                editable: propertyData.editable !== undefined ? propertyData.editable : true,
                keyValue: false,
                properties: propertyData.properties ?? {}
            } satisfies MapProperty
        );
    } else if (selectedWidgetId === "key_value") {
        updatedProperty = mergeDeep(
            propertyData,
            {
                dataType: "map",
                propertyConfig: "key_value",
                editable: propertyData.editable !== undefined ? propertyData.editable : true,
                keyValue: true,
                properties: undefined
            } satisfies MapProperty
        );
    } else if (selectedWidgetId === "reference") {
        updatedProperty = mergeDeep(
            propertyData,
            {
                dataType: "reference",
                propertyConfig: "reference",
                editable: propertyData.editable !== undefined ? propertyData.editable : true
            } satisfies Property
        );
    } else if (selectedWidgetId === "multi_references") {
        updatedProperty = mergeDeep(
            propertyData,
            {
                dataType: "array",
                propertyConfig: "multi_references",
                editable: propertyData.editable !== undefined ? propertyData.editable : true,
                of: {
                    dataType: "reference"
                }
            } satisfies ArrayProperty
        );
    } else if (selectedWidgetId === "switch") {
        updatedProperty = mergeDeep(
            propertyData,
            {
                dataType: "boolean",
                propertyConfig: "switch",
                editable: propertyData.editable !== undefined ? propertyData.editable : true
            } satisfies BooleanProperty
        );
    } else if (selectedWidgetId === "date_time") {
        updatedProperty = mergeDeep(
            propertyData,
            {
                dataType: "date",
                propertyConfig: "date_time",
                editable: propertyData.editable !== undefined ? propertyData.editable : true,
                mode: "date_time"
            } satisfies DateProperty
        );
    } else if (selectedWidgetId === "repeat") {
        updatedProperty = mergeDeep(
            propertyData,
            {
                dataType: "array",
                propertyConfig: "repeat",
                editable: propertyData.editable !== undefined ? propertyData.editable : true
            } satisfies ArrayProperty
        );
    } else if (selectedWidgetId === "block") {
        updatedProperty = mergeDeep(
            propertyData,
            {
                dataType: "array",
                propertyConfig: "block",
                editable: propertyData.editable !== undefined ? propertyData.editable : true,
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
