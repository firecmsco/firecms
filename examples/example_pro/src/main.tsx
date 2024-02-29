import React from "react"
import ReactDOM from "react-dom/client"
import "./index.css"
import { BrowserRouter } from "react-router-dom"
import BareboneTableApp from "./BareboneTableApp/BareboneTableApp"

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <BrowserRouter basename={"/"}>
            <BareboneTableApp/>
        </BrowserRouter>
    </React.StrictMode>
)
