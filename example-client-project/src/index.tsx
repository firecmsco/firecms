import { FieldConfig, FireCMSCustomization } from "firecms";
import { CustomColorTextField } from "./fields/CustomColorTextField";

const customFields: Record<string, FieldConfig> = {
    "test-field": {
        name: "Test Field",
        description: "Test Field Description",
        dataType: "string",
        color: "#2d7ff9",
        Field: CustomColorTextField
    }
}
const config: FireCMSCustomization = {
    fields: customFields
}

export default config;
