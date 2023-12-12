import React from "react"
import { FireCMS3App } from "firecms";
import appConfig from "./index";

function App() {
    return <FireCMS3App
        projectId={"[REPLACE_WITH_PROJECT_ID]"}
        appConfig={appConfig}
    />;
}

export default App
