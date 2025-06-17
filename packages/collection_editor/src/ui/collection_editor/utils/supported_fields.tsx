import { DEFAULT_FIELD_CONFIGS, PropertyConfigId, PropertyConfig } from "@firecms/core";

export const supportedFieldsIds: PropertyConfigId[] = [
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
    "reference",
    "reference_as_string",
    "multi_references",
    "switch",
    "date_time",
    "group",
    "key_value",
    "repeat",
    "block"
];

export const supportedFields: Record<string, PropertyConfig> = Object.entries(DEFAULT_FIELD_CONFIGS)
    .filter(([id]) => supportedFieldsIds.includes(id as PropertyConfigId))
    .map(([id, config]) => ({ [id]: config }))
    .reduce((a, b) => ({ ...a, ...b }), {});
