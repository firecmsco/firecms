import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom";

import { App } from "./App"
import "./index.css"
import { ErrorBoundary } from "@firecms/core";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <ErrorBoundary>
            <BrowserRouter>
                <App/>
            </BrowserRouter>
        </ErrorBoundary>
    </React.StrictMode>
)
