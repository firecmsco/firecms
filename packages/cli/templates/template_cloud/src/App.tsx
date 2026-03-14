import React from "react"
import { RebaseCloudApp } from "@rebasepro/cloud";
import appConfig from "./index";

function App() {
    return <RebaseCloudApp
        projectId={"[REPLACE_WITH_PROJECT_ID]"}
        appConfig={appConfig}
    />;
}

export default App
