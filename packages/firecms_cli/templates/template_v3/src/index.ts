import { FireCMSAppConfig } from "@firecms/firebase";
import { SampleEntityView } from "./custom_entity_view/SampleEntityView";

const appConfig: FireCMSAppConfig = {
    version: "1",
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

export default appConfig;
