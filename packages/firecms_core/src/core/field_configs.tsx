import React from "react";

import { ArrayProperty, FieldProps, Property, PropertyConfig, ResolvedProperty } from "../types";
import {
    ArrayCustomShapedFieldBinding,
    ArrayOfReferencesFieldBinding,
    BlockFieldBinding,
    DateTimeFieldBinding,
    GeopointFieldBinding,
    KeyValueFieldBinding,
    MapFieldBinding,
    MarkdownEditorFieldBinding,
    MultiSelectFieldBinding,
    ReferenceAsStringFieldBinding,
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
    FlagIcon,
    FormatListNumberedIcon,
    FormatQuoteIcon,
    HttpIcon,
    LinkIcon,
    ListAltIcon,
    ListIcon,
    MailIcon,
    LocationOnIcon,
    NumbersIcon, PersonIcon,
    RepeatIcon,
    ScheduleIcon,
    ShortTextIcon,
    SubjectIcon,
    UploadFileIcon,
    VerifiedUserIcon,
    ViewStreamIcon
} from "@firecms/ui";
import { UserSelectFieldBinding } from "../form/field_bindings/UserSelectFieldBinding";

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
            Field: MarkdownEditorFieldBinding
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
        Icon: MailIcon,
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
        name: "Multi select (enum)",
        description: "Select multiple text values from within an enumeration",
        Icon: ListAltIcon,
        color: "#4223c9",
        property: {
            dataType: "array",
            of: {
                dataType: "string",
                enumValues: [],
            },
            Field: MultiSelectFieldBinding
        }
    },
    user_select: {
        key: "user_select",
        name: "User select",
        description: "Select a user from the user management system. Store the user ID.",
        Icon: PersonIcon,
        property: {
            dataType: "string",
            Field: UserSelectFieldBinding
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
            Field: MultiSelectFieldBinding
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
    reference_as_string: {
        key: "reference_as_string",
        name: "Reference (as string)",
        description: "The value refers to a different collection (it is saved as a string)",
        Icon: LinkIcon,
        color: "#154fb3",
        property: {
            dataType: "string",
            Field: ReferenceAsStringFieldBinding
        }
    },
    reference: {
        key: "reference",
        name: "Reference",
        description: "The value refers to a different collection (it is saved as a reference)",
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
    geopoint: {
        key: "geopoint",
        name: "Geopoint",
        description: "Latitude and longitude pair",
        Icon: LocationOnIcon,
        color: "#0ea5e9",
        property: {
            dataType: "geopoint",
            Field: GeopointFieldBinding
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
        description: "A complex field that allows the user to compose different fields together, with a key/value format",
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
        } else if (property.userSelect) {
            return "user_select";
        } else if (property.reference) {
            return "reference_as_string";
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
    } else if (property.dataType === "geopoint") {
        return "geopoint";
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
