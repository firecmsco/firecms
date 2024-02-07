import React from "react"
import ReactDOM from "react-dom/client"
import "./index.css"
import RTDBApp from "./RTDBApp/RTDBApp"

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <RTDBApp/>
    </React.StrictMode>
)
