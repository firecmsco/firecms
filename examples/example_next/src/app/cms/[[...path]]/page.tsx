"use client";
import { App } from "@/app/cms/App";
import { BrowserRouter } from "react-router-dom";


export default function CMS() {
    return <BrowserRouter basename={"/cms"}>
        <App/>
    </BrowserRouter>;
}
