import { FireCMSCustomization } from "@firecms/firebase";
import { SampleEntityView } from "./custom_entity_view/SampleEntityView";

export const customization: FireCMSCustomization = {
    collections: [],
    fields: [],
    entityViews: [
        {
            key: "sample_entity_view",
            name: "Sample entity view",
            Builder: SampleEntityView
        }
    ]
}
