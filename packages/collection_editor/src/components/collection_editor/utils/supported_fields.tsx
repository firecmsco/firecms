import { DEFAULT_FIELD_CONFIGS, FieldConfigId } from "@firecms/core";

export const supportedFieldsIds: FieldConfigId[] = [
    "text_field",
    "multiline",
    "markdown",
    "url",
    "email",
    "select",
    "multi_select",
    "number_input",
    "number_select",
    "multi_number_select",
    "file_upload",
    "multi_file_upload",
    "group",
    "key_value",
    "reference",
    "multi_references",
    "switch",
    "date_time",
    "repeat",
    "block"
];

export const supportedFields = Object.entries(DEFAULT_FIELD_CONFIGS).filter(([id]) =>
    supportedFieldsIds.includes(id as FieldConfigId)
);
