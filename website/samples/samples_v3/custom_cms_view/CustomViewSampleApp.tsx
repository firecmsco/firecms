import { buildCollection, CMSView } from "@firecms/core";
import { ExampleCMSView } from "./ExampleCMSView";
import { FireCMSAppConfig, FireCMSCloudApp } from "@firecms/cloud";

const projectId = "YOUR_PROJECT_ID";

const customViews: CMSView[] = [{
    path: "additional",
    name: "Additional view",
    description: "This is an example of an additional view that is defined by the user",
    // This can be any React component
    view: <ExampleCMSView/>
}];

const productCollection = buildCollection({
    name: "Product",
    id: "products",
    path: "products",
    properties: {
        name: {
            name: "Name",
            validation: { required: true },
            dataType: "string"
        }
    }
});

const appConfig: FireCMSAppConfig = {
    version: "1",
    collections: ({ user }) => [
        productCollection
    ],
    views: customViews
};

export default function App() {

    return <FireCMSCloudApp
        projectId={projectId}
        appConfig={appConfig}
    />;
}
