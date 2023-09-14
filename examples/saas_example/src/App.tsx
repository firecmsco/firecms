import React from "react"
import { FireCMS3App } from "@firecms/firebase_firecms_v3";
import { config } from "./index";

export const firebaseConfig = {
    apiKey: "AIzaSyBzt-JvcXvpDrdNU7jYX3fC3v0EAHjTKEw",
    authDomain: "demo.firecms.co",
    databaseURL: "https://firecms-demo-27150.firebaseio.com",
    projectId: "firecms-demo-27150",
    storageBucket: "firecms-demo-27150.appspot.com",
    messagingSenderId: "837544933711",
    appId: "1:837544933711:web:75822ffc0840e3ae01ad3a",
    measurementId: "G-8HRE8MVXZJ"
};

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
        collections={(params) => []}
        views={config.views}
        firebaseConfig={firebaseConfig}
        fields={config.fields}
    />;

}

export default App
