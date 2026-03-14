import { buildCollection, CMSView } from "@rebasepro/core";
import { ExampleCMSView } from "./ExampleCMSView";
import { RebaseAppConfig, RebaseCloudApp } from "@rebasepro/cloud";

const projectId = "YOUR_PROJECT_ID";

const customViews: CMSView[] = [{
    slug: "additional",
    name: "Additional view",
    description: "This is an example of an additional view that is defined by the user",
    // This can be any React component
    view: <ExampleCMSView />
}];

const productCollection = buildCollection<any>({
    name: "Product",
    slug: "products",
    dbPath: "products",
    properties: {
        name: {
            name: "Name",
            validation: { required: true },
            dataType: "string"
        }
    }
});

const appConfig: RebaseAppConfig = {
    version: "1",
    collections: ({ user }) => [
        productCollection
    ],
    views: ({ user }) => customViews
};

export default function App() {

    return <RebaseCloudApp
        projectId={projectId}
        appConfig={appConfig}
    />;
}
