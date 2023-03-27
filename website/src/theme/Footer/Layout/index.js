import React from "react";
import Layout from "@theme-original/Footer/Layout";
import { Newsletter } from "../../../partials/general/Newsletter";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { EnterpriseTeaser } from "../../../partials/general/EnterpriseTeaser";
import { useLocation } from "@docusaurus/router";

export default function LayoutWrapper(props) {

    const { pathname } = useLocation();
    const includeEnterpriseTeaser = !pathname.startsWith("/enterprise");

    return (
        <>
            {includeEnterpriseTeaser && <EnterpriseTeaser/>}
            <Newsletter/>
            <Layout {...props} />
        </>
    );
}
