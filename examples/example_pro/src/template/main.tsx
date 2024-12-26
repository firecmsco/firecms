import React from "react"
import ReactDOM from "react-dom/client"
import { FireCMSRouter } from "@firecms/core";
import { App } from "./App"
import "./index.css"

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <FireCMSRouter>
            <App/>
        </FireCMSRouter>
    </React.StrictMode>
)
