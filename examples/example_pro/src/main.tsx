import React from "react"
import ReactDOM from "react-dom/client"
import "./index.css"
import { App } from "./FirestoreApp/App";
import { FireCMSRouter } from "@firecms/core";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <FireCMSRouter basePath={"/"}>
            <App/>
        </FireCMSRouter>
    </React.StrictMode>
)
