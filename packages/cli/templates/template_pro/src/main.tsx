import React from "react"
import ReactDOM from "react-dom/client"

import { App } from "./App"
import "./index.css"
import { ErrorBoundary, FireCMSRouter } from "@firecms/core";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <ErrorBoundary>
            <FireCMSRouter>
                <App/>
            </FireCMSRouter>
        </ErrorBoundary>
    </React.StrictMode>
)
