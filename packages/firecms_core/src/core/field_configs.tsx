import React from "react";

import { ArrayProperty, FieldProps, Property, PropertyConfig, ResolvedProperty } from "../types";
import {
    ArrayCustomShapedFieldBinding,
    ArrayOfReferencesFieldBinding,
    BlockFieldBinding,
    DateTimeFieldBinding,
    KeyValueFieldBinding,
    MapFieldBinding,
    MarkdownFieldBinding,
    MultiSelectBinding,
    ReferenceFieldBinding,
    RepeatFieldBinding,
    SelectFieldBinding,
    StorageUploadFieldBinding,
    SwitchFieldBinding,
    TextFieldBinding
} from "../form";
import { isPropertyBuilder, mergeDeep } from "../util";

import {
    AddLinkIcon,
    BallotIcon,
    DriveFolderUploadIcon,
    EmailIcon,
    FlagIcon,
    FormatListNumberedIcon,
    FormatQuoteIcon,
    HttpIcon,
    LinkIcon,
    ListAltIcon,
    ListIcon,
    NumbersIcon,
    RepeatIcon,
    ScheduleIcon,
    ShortTextIcon,
    SubjectIcon,
    UploadFileIcon,
    ViewStreamIcon
} from "@firecms/ui";

export function isDefaultFieldConfigId(id: string) {
    return Object.keys(DEFAULT_FIELD_CONFIGS).includes(id);
}

export const DEFAULT_FIELD_CONFIGS: Record<string, PropertyConfig<any>> = {
    text_field: {
        key: "text_field",
        name: "Text field",
        description: "Simple short text",
        Icon: ShortTextIcon,
        color: "#2d7ff9",
        property: {
            dataType: "string",
            Field: TextFieldBinding
        }
    },
    multiline: {
        key: "multiline",
        name: "Multiline",
        description: "Text with multiple lines",
        Icon: SubjectIcon,
        color: "#2d7ff9",
        property: {
            dataType: "string",
            multiline: true,
            Field: TextFieldBinding
        }
    },
    markdown: {
        key: "markdown",
        name: "Markdown",
        description: "Text with advanced markdown syntax",
        Icon: FormatQuoteIcon,
        color: "#2d7ff9",
        property: {
            dataType: "string",
            markdown: true,
            Field: MarkdownFieldBinding
        }
    },
    url: {
        key: "url",
        name: "Url",
        description: "Text with URL validation",
        Icon: HttpIcon,
        color: "#154fb3",
        property: {
            dataType: "string",
            url: true,
            Field: TextFieldBinding
        }
    },
    email: {
        key: "email",
        name: "Email",
        description: "Text with email validation",
        Icon: EmailIcon,
        color: "#154fb3",
        property: {
            dataType: "string",
            email: true,
            Field: TextFieldBinding
        }
    },
    switch: {
        key: "switch",
        name: "Switch",
        description: "Boolean true or false field (or yes or no, 0 or 1...)",
        Icon: FlagIcon,
        color: "#20d9d2",
        property: {
            dataType: "boolean",
            Field: SwitchFieldBinding
        }
    },
    select: {
        key: "select",
        name: "Select/enum",
        description: "Select one text value from within an enumeration",
        Icon: ListIcon,
        color: "#4223c9",
        property: {
            dataType: "string",
            enumValues: [],
            Field: SelectFieldBinding
        }
    },
    multi_select: {
        key: "multi_select",
        name: "Multi select",
        description: "Select multiple text values from within an enumeration",
        Icon: ListAltIcon,
        color: "#4223c9",
        property: {
            dataType: "array",
            of: {
                dataType: "string",
                enumValues: [],
            },
            Field: MultiSelectBinding
        }
    },
    number_input: {
        key: "number_input",
        name: "Number input",
        description: "Simple number field with validation",
        Icon: NumbersIcon,
        color: "#bec920",
        property: {
            dataType: "number",
            Field: TextFieldBinding
        }
    },
    number_select: {
        key: "number_select",
        name: "Number select",
        description: "Select a number value from within an enumeration",
        Icon: FormatListNumberedIcon,
        color: "#bec920",
        property: {
            dataType: "number",
            enumValues: [],
            Field: SelectFieldBinding
        }
    },
    multi_number_select: {
        key: "multi_number_select",
        name: "Multiple number select",
        description: "Select multiple number values from within an enumeration",
        Icon: FormatListNumberedIcon,
        color: "#bec920",
        property: {
            dataType: "array",
            of: {
                dataType: "number",
                enumValues: [],
            },
            Field: MultiSelectBinding
        }
    },
    file_upload: {
        key: "file_upload",
        name: "File upload",
        description: "Input for uploading single files",
        Icon: UploadFileIcon,
        color: "#f92d9a",
        property: {
            dataType: "string",
            storage: {
                storagePath: "{path}"
            },
            Field: StorageUploadFieldBinding as React.ComponentType<FieldProps<string>>
        }
    },
    multi_file_upload: {
        key: "multi_file_upload",
        name: "Multiple file upload",
        description: "Input for uploading multiple files",
        Icon: DriveFolderUploadIcon,
        color: "#f92d9a",
        property: {
            dataType: "array",
            of: {
                dataType: "string",
                storage: {
                    storagePath: "{path}"
                }
            },
            Field: StorageUploadFieldBinding
        }
    },
    reference: {
        key: "reference",
        name: "Reference",
        description: "The value refers to a different collection",
        Icon: LinkIcon,
        color: "#ff0042",
        property: {
            dataType: "reference",
            Field: ReferenceFieldBinding
        }
    },
    multi_references: {
        key: "multi_references",
        name: "Multiple references",
        description: "Multiple values that refer to a different collection",
        Icon: AddLinkIcon,
        color: "#ff0042",
        property: {
            dataType: "array",
            of: {
                dataType: "reference",
            },
            Field: ArrayOfReferencesFieldBinding
        }
    },
    date_time: {
        key: "date_time",
        name: "Date/time",
        description: "A date time select field",
        Icon: ScheduleIcon,
        color: "#8b46ff",
        property: {
            dataType: "date",
            Field: DateTimeFieldBinding
        }
    },
    group: {
        key: "group",
        name: "Group",
        description: "Group of multiple fields",
        Icon: BallotIcon,
        color: "#ff9408",
        property: {
            dataType: "map",
            properties: {},
            Field: MapFieldBinding
        }
    },
    key_value: {
        key: "key_value",
        name: "Key-value",
        description: "Flexible field that allows the user to add multiple key-value pairs",
        Icon: BallotIcon,
        color: "#ff9408",
        property: {
            dataType: "map",
            keyValue: true,
            Field: KeyValueFieldBinding
        }
    },
    repeat: {
        key: "repeat",
        name: "Repeat/list",
        description: "A field that gets repeated multiple times (e.g. multiple text fields)",
        Icon: RepeatIcon,
        color: "#ff9408",
        property: {
            dataType: "array",
            of: {
                dataType: "string",
            },
            Field: RepeatFieldBinding
        }
    },
    custom_array: {
        key: "custom_array",
        name: "Custom array",
        description: "A field that saved its value as an array of custom objects",
        Icon: RepeatIcon,
        color: "#ff9408",
        property: {
            dataType: "array",
            of: [],
            Field: ArrayCustomShapedFieldBinding
        }
    },
    block: {
        key: "block",
        name: "Block",
        description: "A complex field that allows the user to compose different fields together, with a key->value format",
        Icon: ViewStreamIcon,
        color: "#ff9408",
        property: {
            dataType: "array",
            oneOf: {
                properties: {},
            },
            Field: BlockFieldBinding
        }
    }
};

export function getDefaultFieldConfig(property: Property | ResolvedProperty): PropertyConfig | undefined {
    const fieldId = getDefaultFieldId(property);
    if (!fieldId) {
        console.error("No field id found for property", property);
        return undefined;
    }
    return DEFAULT_FIELD_CONFIGS[fieldId];
}

export function getFieldConfig(property: Property | ResolvedProperty, propertyConfigs: Record<string, PropertyConfig<any>>): PropertyConfig | undefined {
    const fieldId = getFieldId(property);
    const defaultFieldId = getDefaultFieldId(property);
    if (!defaultFieldId) {
        console.error("No field id found for property", property);
        return undefined;
    }
    const defaultFieldConfig = DEFAULT_FIELD_CONFIGS[defaultFieldId];
    const customField = fieldId ? propertyConfigs[fieldId] : undefined;
    return mergeDeep(defaultFieldConfig ?? {}, customField ?? {} as PropertyConfig);
}

export function getDefaultFieldId(property: Property | ResolvedProperty) {
    if (property.dataType === "string") {
        if (property.multiline) {
            return "multiline";
        } else if (property.markdown) {
            return "markdown";
        } else if (property.storage) {
            return "file_upload";
        } else if (property.url) {
            return "url";
        } else if (property.email) {
            return "email";
        } else if (property.enumValues) {
            return "select";
        } else {
            return "text_field";
        }
    } else if (property.dataType === "number") {
        if (property.enumValues) {
            return "number_select";
        }
        return "number_input";
    } else if (property.dataType === "map") {
        if (property.keyValue)
            return "key_value";
        return "group";
    } else if (property.dataType === "array") {
        const of = (property as ArrayProperty).of;
        const oneOf = (property as ArrayProperty).oneOf;
        if (oneOf) {
            return "block";
        } else if (Array.isArray(of)) {
            return "custom_array";
        } else if (isPropertyBuilder(of)) {
            return "repeat";
        } else if (of?.dataType === "string" && of.enumValues) {
            return "multi_select";
        } else if (of?.dataType === "number" && of.enumValues) {
            return "multi_number_select";
        } else if (of?.dataType === "string" && of.storage) {
            return "multi_file_upload";
        } else if (of?.dataType === "reference") {
            return "multi_references";
        } else {
            return "repeat";
        }
    } else if (property.dataType === "boolean") {
        return "switch";
    } else if (property.dataType === "date") {
        return "date_time";
    } else if (property.dataType === "reference") {
        return "reference";
    }

    console.error("Unsupported field config mapping", property);
    return undefined;
}

export function getFieldId(property: Property | ResolvedProperty): string | undefined {
    if (property.propertyConfig)
        return property.propertyConfig;
    return getDefaultFieldId(property);
}
