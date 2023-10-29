import React from "react"
import { FireCMS3App } from "@firecms/firebase";
import { customization } from "./index";

function App(): React.ReactElement {
    return <FireCMS3App
        projectId={"firecms-demo-27150"}
        customization={customization}
    />;

}

export default App
