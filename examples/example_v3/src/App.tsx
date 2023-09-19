import React from "react"
import { FireCMS3App } from "@firecms/firebase_firecms_v3";
import { config } from "./index";

function App() {
    return <FireCMS3App
        projectId={"firecms-demo-27150"}
        signInOptions={[
            "password",
            "google.com"
            // 'anonymous',
            // 'phone',
            // 'facebook.com',
            // 'github.com',
            // 'twitter.com',
            // 'microsoft.com',
            // 'apple.com'
        ]}
        config={config}
    />;

}

export default App
