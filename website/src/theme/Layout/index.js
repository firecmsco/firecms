import React from "react";
import Layout from "@theme-original/Layout";
import { PagesBackground } from "../../partials/PagesBackground";

export default function LayoutWrapper(props) {
    return (
        <>
            <PagesBackground/>
            <Layout {...props} />
        </>
    );
}
