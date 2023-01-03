import { FieldConfig } from "./field_config";

export type FireCMSCustomization = {
    /**
     * Record of custom form fields to be used in the CMS.
     * You can use the key to reference the custom field in
     * the `Field` prop of a property in a collection.
     */
    customFields: Record<string, FieldConfig>;
}
