import React from "react"
import ReactDOM from "react-dom/client"
import "./index.css"
import SampleApp from "./SampleApp/SampleApp";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <SampleApp/>
    </React.StrictMode>
)
