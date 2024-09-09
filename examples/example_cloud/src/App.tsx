import React from "react"
import { FireCMSCloudApp } from "@firecms/cloud";
import appConfig from "./index";

function App(): React.ReactElement {
    return <FireCMSCloudApp
        // backendApiHost={"http://127.0.0.1:5001/firecms-dev-2da42/europe-west3/api"}
        // backendApiHost={"https://api-kdoe6pj3qq-ey.a.run.app"}
        projectId={"firecms-demo-27150"}
        appConfig={appConfig}
    />;

}

export default App
