import { FireCMSCustomization } from "@firecms/firebase";
import { SampleEntityView } from "./custom_entity_view/SampleEntityView";

export const customization: FireCMSCustomization = {
    collections: [],
    entityViews: [
        {
            key: "test",
            name: "Test",
            Builder: SampleEntityView
        }
    ]
}
