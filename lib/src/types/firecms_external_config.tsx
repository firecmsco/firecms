import { FieldConfig } from "./field_config";

export type FireCMSCustomization = {
    /**
     * Record of custom form fields to be used in the CMS
     */
    customFields: Record<string, FieldConfig>;
}
