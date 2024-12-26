import React from "react"
import ReactDOM from "react-dom/client"
import { FireCMSRouter } from "@firecms/core";
import "./index.css"
import App from "./App";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <FireCMSRouter basePath={"/"}>
            <App/>
        </FireCMSRouter>
    </React.StrictMode>
)
