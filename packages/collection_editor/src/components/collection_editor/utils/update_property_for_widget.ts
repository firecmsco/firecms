import { buildProperty, PropertyConfig, mergeDeep, Property } from "@firecms/core";

export function updatePropertyFromWidget(propertyData: any,
                                         selectedWidgetId: string | undefined,
                                         customFields: Record<string, PropertyConfig>): Property {

    let updatedProperty;
    if (selectedWidgetId === "text_field") {
        updatedProperty = mergeDeep(
            propertyData,
            buildProperty({
                dataType: "string",
                propertyConfig: "text_field",
                editable: propertyData.editable !== undefined ? propertyData.editable : true,
                storage: undefined,
                multiline: undefined,
                markdown: undefined,
                email: undefined,
                url: undefined,
                enumValues: undefined
            })
        );
    } else if (selectedWidgetId === "multiline") {
        updatedProperty = mergeDeep(
            propertyData,
            buildProperty({
                dataType: "string",
                propertyConfig: "multiline",
                editable: propertyData.editable !== undefined ? propertyData.editable : true,
                multiline: true,
                storage: undefined,
                markdown: undefined,
                email: undefined,
                url: undefined,
                enumValues: undefined
            })
        );
    } else if (selectedWidgetId === "markdown") {
        updatedProperty = mergeDeep(
            propertyData,
            buildProperty({
                dataType: "string",
                propertyConfig: "markdown",
                editable: propertyData.editable !== undefined ? propertyData.editable : true,
                storage: undefined,
                multiline: undefined,
                markdown: true,
                email: undefined,
                url: undefined
            })
        );
    } else if (selectedWidgetId === "url") {
        updatedProperty = mergeDeep(
            propertyData,
            buildProperty({
                dataType: "string",
                propertyConfig: "url",
                editable: propertyData.editable !== undefined ? propertyData.editable : true,
                storage: undefined,
                multiline: undefined,
                markdown: undefined,
                email: undefined,
                url: true,
                enumValues: undefined
            })
        );
    } else if (selectedWidgetId === "email") {
        updatedProperty = mergeDeep(
            propertyData,
            buildProperty({
                dataType: "string",
                propertyConfig: "email",
                editable: propertyData.editable !== undefined ? propertyData.editable : true,
                storage: undefined,
                multiline: undefined,
                markdown: undefined,
                email: true,
                url: undefined,
                enumValues: undefined
            })
        );
    } else if (selectedWidgetId === "select") {
        updatedProperty = mergeDeep(
            propertyData,
            buildProperty({
                dataType: "string",
                propertyConfig: "select",
                editable: propertyData.editable !== undefined ? propertyData.editable : true,
                storage: undefined,
                multiline: undefined,
                markdown: undefined,
                email: undefined,
                url: undefined,
                enumValues: propertyData.enumValues ?? []
            })
        );
    } else if (selectedWidgetId === "multi_select") {
        updatedProperty = mergeDeep(
            propertyData,
            buildProperty({
                dataType: "array",
                propertyConfig: "multi_select",
                editable: propertyData.editable !== undefined ? propertyData.editable : true,
                of: {
                    dataType: "string",
                    enumValues: propertyData.of?.enumValues ?? []
                }
            })
        );
    } else if (selectedWidgetId === "number_input") {
        updatedProperty = mergeDeep(
            propertyData,
            buildProperty({
                dataType: "number",
                propertyConfig: "number_input",
                editable: propertyData.editable !== undefined ? propertyData.editable : true,
                enumValues: undefined
            })
        );
    } else if (selectedWidgetId === "number_select") {
        updatedProperty = mergeDeep(
            propertyData,
            buildProperty({
                dataType: "number",
                propertyConfig: "number_select",
                editable: propertyData.editable !== undefined ? propertyData.editable : true,
                enumValues: propertyData.enumValues ?? []
            })
        );
    } else if (selectedWidgetId === "multi_number_select") {
        updatedProperty = mergeDeep(
            propertyData,
            buildProperty({
                dataType: "array",
                propertyConfig: "multi_number_select",
                editable: propertyData.editable !== undefined ? propertyData.editable : true,
                of: {
                    dataType: "number",
                    enumValues: propertyData.of?.enumValues ?? []
                }
            })
        );
    } else if (selectedWidgetId === "file_upload") {
        updatedProperty = mergeDeep(
            propertyData,
            buildProperty({
                dataType: "string",
                propertyConfig: "file_upload",
                editable: propertyData.editable !== undefined ? propertyData.editable : true,
                storage: {
                    storagePath: "/"
                }
            })
        );
    } else if (selectedWidgetId === "multi_file_upload") {
        updatedProperty = mergeDeep(
            propertyData,
            buildProperty({
                dataType: "array",
                propertyConfig: "multi_file_upload",
                editable: propertyData.editable !== undefined ? propertyData.editable : true,
                of: {
                    dataType: "string",
                    storage: propertyData.of?.storage ?? {
                        storagePath: "/"
                    }
                }
            })
        );
    } else if (selectedWidgetId === "group") {
        updatedProperty = mergeDeep(
            propertyData,
            buildProperty({
                dataType: "map",
                propertyConfig: "group",
                editable: propertyData.editable !== undefined ? propertyData.editable : true,
                keyValue: false,
                properties: propertyData.properties ?? {}
            })
        );
    } else if (selectedWidgetId === "key_value") {
        updatedProperty = mergeDeep(
            propertyData,
            buildProperty({
                dataType: "map",
                propertyConfig: "key_value",
                editable: propertyData.editable !== undefined ? propertyData.editable : true,
                keyValue: true,
                properties: undefined
            })
        );
    } else if (selectedWidgetId === "reference") {
        updatedProperty = mergeDeep(
            propertyData,
            buildProperty({
                dataType: "reference",
                propertyConfig: "reference",
                editable: propertyData.editable !== undefined ? propertyData.editable : true
            })
        );
    } else if (selectedWidgetId === "multi_references") {
        updatedProperty = mergeDeep(
            propertyData,
            buildProperty({
                dataType: "array",
                propertyConfig: "multi_references",
                editable: propertyData.editable !== undefined ? propertyData.editable : true,
                of: {
                    dataType: "reference"
                }
            })
        );
    } else if (selectedWidgetId === "switch") {
        updatedProperty = mergeDeep(
            propertyData,
            buildProperty({
                dataType: "boolean",
                propertyConfig: "switch",
                editable: propertyData.editable !== undefined ? propertyData.editable : true
            })
        );
    } else if (selectedWidgetId === "date_time") {
        updatedProperty = mergeDeep(
            propertyData,
            buildProperty({
                dataType: "date",
                propertyConfig: "date_time",
                editable: propertyData.editable !== undefined ? propertyData.editable : true,
                mode: "date_time"
            })
        );
    } else if (selectedWidgetId === "repeat") {
        updatedProperty = mergeDeep(
            propertyData,
            buildProperty({
                dataType: "array",
                propertyConfig: "repeat",
                editable: propertyData.editable !== undefined ? propertyData.editable : true
            })
        );
    } else if (selectedWidgetId === "block") {
        updatedProperty = mergeDeep(
            propertyData,
            buildProperty({
                dataType: "array",
                propertyConfig: "block",
                editable: propertyData.editable !== undefined ? propertyData.editable : true,
                oneOf: {
                    properties: {}
                }
            })
        );
    } else if (selectedWidgetId && customFields[selectedWidgetId]) {
        updatedProperty = { ...customFields[selectedWidgetId].property, propertyConfig: selectedWidgetId };
    }

    return updatedProperty;
}
