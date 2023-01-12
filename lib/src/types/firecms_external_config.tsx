import { FieldConfig } from "./field_config";
import { CMSView } from "./navigation";
import { CMSViewsBuilder } from "./firecms";

export type FireCMSCustomization = {

    /**
     * Custom additional views created by the developer, added to the main
     * navigation
     */
    views?: CMSView[] | CMSViewsBuilder;

    /**
     * Record of custom form fields to be used in the CMS.
     * You can use the key to reference the custom field in
     * the `fieldConfig` prop of a property in a collection.
     */
    fields?: Record<string, FieldConfig>;
}
