import { DefaultFieldConfig } from "@firecms/types";

export function isDefaultFieldConfigId(id: string): id is DefaultFieldConfig {
    return ["text_field",
        "multiline",
        "markdown",
        "url",
        "email",
        "switch",
        "select",
        "multi_select",
        "number_input",
        "number_select",
        "multi_number_select",
        "file_upload",
        "multi_file_upload",
        "reference_as_string",
        "reference",
        "multi_references",
        "relation",
        "date_time",
        "group",
        "key_value",
        "repeat",
        "custom_array",
        "block"
    ].includes(id);
}
