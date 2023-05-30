import React from "react";
import ShortTextIcon from "@mui/icons-material/ShortText";
import SubjectIcon from "@mui/icons-material/Subject";
import AddLinkIcon from "@mui/icons-material/AddLink";
import ListIcon from "@mui/icons-material/List";
import ScheduleIcon from "@mui/icons-material/Schedule";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DriveFolderUploadIcon from "@mui/icons-material/DriveFolderUpload";
import RepeatIcon from "@mui/icons-material/Repeat";
import ViewStreamIcon from "@mui/icons-material/ViewStream";
import ListAltIcon from "@mui/icons-material/ListAlt";
import LinkIcon from "@mui/icons-material/Link";
import HttpIcon from "@mui/icons-material/Http";
import FlagIcon from "@mui/icons-material/Flag";
import NumbersIcon from "@mui/icons-material/Numbers";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import EmailIcon from "@mui/icons-material/Email";
import BallotOutlinedIcon from "@mui/icons-material/BallotOutlined";

import {
    ArrayCustomShapedFieldBinding
} from "../form/field_bindings/ArrayCustomShapedFieldBinding";
import {
    ArrayProperty,
    FieldConfig,
    FieldConfigId,
    FieldProps,
    Property, ResolvedProperty
} from "../types";
import {
    ArrayEnumSelectBinding,
    ArrayOfReferencesFieldBinding,
    BlockFieldBinding,
    DateTimeFieldBinding,
    MapFieldBinding,
    MarkdownFieldBinding,
    ReferenceFieldBinding,
    RepeatFieldBinding,
    SelectFieldBinding,
    StorageUploadFieldBinding,
    SwitchFieldBinding,
    TextFieldBinding
} from "../form";
import { isPropertyBuilder } from "./util";
import {
    KeyValueFieldBinding
} from "../form/field_bindings/KeyValueFieldBinding";

export const DEFAULT_FIELD_CONFIGS: Record<FieldConfigId, FieldConfig<any>> = {
    text_field: {
        name: "Text field",
        description: "Simple short text",
        dataType: "string",
        Icon: ShortTextIcon,
        color: "#2d7ff9",
        Field: TextFieldBinding
    },
    multiline: {
        name: "Multiline",
        description: "Text with multiple lines",
        dataType: "string",
        Icon: SubjectIcon,
        color: "#2d7ff9",
        Field: TextFieldBinding
    },
    markdown: {
        name: "Markdown",
        description: "Text with advanced markdown syntax",
        dataType: "string",
        Icon: FormatQuoteIcon,
        color: "#2d7ff9",
        Field: MarkdownFieldBinding
    },
    url: {
        name: "Url",
        description: "Text with URL validation",
        dataType: "string",
        Icon: HttpIcon,
        color: "#154fb3",
        Field: TextFieldBinding
    },
    email: {
        name: "Email",
        description: "Text with email validation",
        dataType: "string",
        Icon: EmailIcon,
        color: "#154fb3",
        Field: TextFieldBinding
    },
    select: {
        name: "Select/enum",
        description: "Select one text value from within an enumeration",
        dataType: "string",
        Icon: ListIcon,
        color: "#4223c9",
        Field: SelectFieldBinding
    },
    multi_select: {
        name: "Multi select",
        description: "Select multiple text values from within an enumeration",
        dataType: "array",
        Icon: ListAltIcon,
        color: "#4223c9",
        Field: ArrayEnumSelectBinding
    },
    number_input: {
        name: "Number input",
        description: "Simple number field with validation",
        dataType: "number",
        Icon: NumbersIcon,
        color: "#bec920",
        Field: TextFieldBinding
    },
    number_select: {
        name: "Number select",
        description: "Select a number value from within an enumeration",
        dataType: "number",
        Icon: FormatListNumberedIcon,
        color: "#bec920",
        Field: SelectFieldBinding
    },
    multi_number_select: {
        name: "Multiple number select",
        description: "Select multiple number values from within an enumeration",
        dataType: "array",
        Icon: FormatListNumberedIcon,
        color: "#bec920",
        Field: ArrayEnumSelectBinding
    },
    file_upload: {
        name: "File upload",
        description: "Input for uploading single files",
        dataType: "string",
        Icon: UploadFileIcon,
        color: "#f92d9a",
        Field: StorageUploadFieldBinding as React.ComponentType<FieldProps<string>>
    },
    multi_file_upload: {
        name: "Multiple file upload",
        description: "Input for uploading multiple files",
        dataType: "array",
        Icon: DriveFolderUploadIcon,
        color: "#f92d9a",
        Field: StorageUploadFieldBinding
    },
    reference: {
        name: "Reference",
        description: "The value refers to a different collection",
        dataType: "reference",
        Icon: LinkIcon,
        color: "#ff0042",
        Field: ReferenceFieldBinding
    },
    multi_references: {
        name: "Multiple references",
        description: "Multiple values that refer to a different collection",
        dataType: "array",
        Icon: AddLinkIcon,
        color: "#ff0042",
        Field: ArrayOfReferencesFieldBinding
    },
    switch: {
        name: "Switch",
        description: "True or false field (or yes or no, 0 or 1...)",
        dataType: "boolean",
        Icon: FlagIcon,
        color: "#20d9d2",
        Field: SwitchFieldBinding
    },
    date_time: {
        name: "Date/time",
        description: "A date time select field",
        dataType: "date",
        Icon: ScheduleIcon,
        color: "#8b46ff",
        Field: DateTimeFieldBinding
    },
    group: {
        name: "Group",
        description: "Group of multiple fields",
        dataType: "map",
        Icon: BallotOutlinedIcon,
        color: "#ff9408",
        Field: MapFieldBinding
    },
    key_value: {
        name: "Key-value",
        description: "Flexible field that allows the user to add multiple key-value pairs",
        dataType: "map",
        Icon: BallotOutlinedIcon,
        color: "#ff9408",
        Field: KeyValueFieldBinding
    },
    repeat: {
        name: "Repeat/list",
        description: "A field that gets repeated multiple times (e.g. multiple text fields)",
        dataType: "array",
        Icon: RepeatIcon,
        color: "#ff9408",
        Field: RepeatFieldBinding
    },
    custom_array: {
        name: "Custom array",
        description: "A field that saved its value as an array of custom objects",
        dataType: "array",
        Icon: RepeatIcon,
        color: "#ff9408",
        Field: ArrayCustomShapedFieldBinding
    },
    block: {
        name: "Block",
        description: "A complex field that allows the user to compose different fields together, with a key->value format",
        dataType: "array",
        Icon: ViewStreamIcon,
        color: "#ff9408",
        Field: BlockFieldBinding
    }
};

export function getFieldConfig(property: Property | ResolvedProperty): FieldConfig | undefined {
    const fieldId = getFieldId(property);
    return fieldId ? DEFAULT_FIELD_CONFIGS[fieldId] : undefined;
}

export function getFieldId(property: Property | ResolvedProperty): FieldConfigId | undefined {
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
        if (property.properties)
            return "group";
    } else if (property.dataType === "array") {
        const of = (property as ArrayProperty).of;
        const oneOf = (property as ArrayProperty).oneOf;
        if (Array.isArray(of)) {
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
        } else if (oneOf) {
            return "block";
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
