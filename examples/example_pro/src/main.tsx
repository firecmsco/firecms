import React from "react"
import ReactDOM from "react-dom/client"
import "./index.css"
import { BrowserRouter } from "react-router-dom"
import SimpleApp from "./SimpleApp/SimpleApp"

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <BrowserRouter basename={"/"}>
            <SimpleApp/>
        </BrowserRouter>
    </React.StrictMode>
)
