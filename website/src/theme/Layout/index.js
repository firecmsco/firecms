import React, { useEffect } from "react";
import clsx from "clsx";

import Layout from "@theme-original/Layout";
import docsearch from "@docsearch/js";
import siteConfig from "@generated/docusaurus.config";

import "@docsearch/css";

import AOS from "aos";
import "aos/dist/aos.css";

import "../../css/tailwind.css";
import "../../css/custom.css";

import { useLocation } from "@docusaurus/router";
import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";
import { defaultBorderMixin } from "../../partials/styles";

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

    function isDocs() {
        return pathname.startsWith("/docs/");
    }

// should show algolia docsearch
    useEffect(() => {
        if (isDocs()) {
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
            <div
                className={clsx("pointer-events-none fixed top-0 left-0 right-0 w-[84rem] h-full max-w-full mx-auto border-x border-y-0 border-solid", defaultBorderMixin)}/>
            {/*{isDocs() && <div className={"h-20"}/>}*/}
            <Layout {...props} />
        </>
    );
}
