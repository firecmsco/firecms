import React from "react"
import { FireCMS3App } from "@firecms/firebase";
import { customization } from "./index";

function App() {
    return <FireCMS3App
        projectId={"[REPLACE_WITH_PROJECT_ID]"}
        customization={customization}
    />;
}

export default App
