import React, { useEffect } from "react";
import Layout from "@theme-original/Layout";
import { PagesBackground } from "../../partials/general/PagesBackground";
import docsearch from "@docsearch/js";
import siteConfig from "@generated/docusaurus.config";

import "@docsearch/css";

import AOS from "aos";
import "aos/dist/aos.css";

import "../../css/tailwind.css";
import "../../css/custom.css";

import { useLocation } from "@docusaurus/router";
import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";

export default function LayoutWrapper(props) {

    const { pathname } = useLocation();

    const documentEnabled = ExecutionEnvironment.canUseDOM ? document : undefined
    const [darkMode, setDarkMode] = React.useState(documentEnabled ? document.documentElement.getAttribute("data-theme") === "dark" : true);

    useEffect(() => {
        if (ExecutionEnvironment.canUseDOM) {
            AOS.init();
        }
    }, [ExecutionEnvironment.canUseDOM, documentEnabled]);

    useEffect(() => {
        if (ExecutionEnvironment.canUseDOM) {
            const mode = document.documentElement.getAttribute("data-theme");
            setDarkMode(mode === "dark");
        }
    }, [ExecutionEnvironment.canUseDOM, documentEnabled]);

    useEffect(() => {
        if (!ExecutionEnvironment.canUseDOM) return;
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(function (mutation) {
                if (mutation.type === "attributes"
                    && mutation.attributeName === "data-theme") {
                    mutation.target.getAttribute("data-theme") === "dark" ? setDarkMode(true) : setDarkMode(false);
                }
            });
        });
        observer.observe(document.documentElement, {
            attributes: true,
            childList: false,
            subtree: false
        });
        return () => {
            observer.disconnect();
        };
    }, [ExecutionEnvironment.canUseDOM, documentEnabled]);

    // should show algolia docsearch
    useEffect(() => {
        if (pathname.startsWith("/docs/")) {
            docsearch({
                container: "#docsearch",
                appId: siteConfig.customFields.docSearchAppId,
                apiKey: siteConfig.customFields.docSearchApiKey,
                indexName: "firecms",
            });
        }
    }, [pathname]);

    return (
        <>
            <PagesBackground darkMode={darkMode}/>
            <Layout {...props} />
        </>
    );
}
