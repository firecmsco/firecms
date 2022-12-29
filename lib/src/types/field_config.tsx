import { SvgIconProps } from "@mui/material/SvgIcon";
import { DataType } from "./properties";

export type FieldConfig = {
    name: string;
    description?: string;
    dataType: DataType;
    Icon?: React.ComponentType<SvgIconProps>;
    color?: string;
    Field: React.ComponentType<any>;
}

export type FieldConfigId =
    "text_field" |
    "multiline" |
    "markdown" |
    "url" |
    "email" |
    "select" |
    "multi_select" |
    "number_input" |
    "number_select" |
    "multi_number_select" |
    "file_upload" |
    "multi_file_upload" |
    "group" |
    "reference" |
    "multi_references" |
    "switch" |
    "date_time" |
    "repeat" |
    "custom_array" |
    "block";
