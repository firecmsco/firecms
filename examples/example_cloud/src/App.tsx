import React from "react"
import { FireCMSCloudApp } from "@firecms/cloud";
import appConfig from "./index";

function App() {
    return <FireCMSCloudApp
        projectId={"firecms-demo-27150"}
        appConfig={appConfig}
    />;
}

export default App
