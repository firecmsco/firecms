import React from "react"
import { FireCMSApp } from "@firecms/cloud";
import appConfig from "./index";

function App() {
    return <FireCMSApp
        projectId={"[REPLACE_WITH_PROJECT_ID]"}
        appConfig={appConfig}
    />;
}

export default App
