import React, { useEffect } from "react";
import Layout from "@theme/Layout";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";

import AOS from "aos";
import "aos/dist/aos.css";
import "../css/tailwind.css";
import Head from "@docusaurus/Head";
import Features from "../partials/home/Features";

// import { Newsletter } from "../partials/Newsletter";

function FeaturesPage() {
    const context = useDocusaurusContext();
    const { siteConfig = {} } = context;

    const documentEnabled = ExecutionEnvironment.canUseDOM ? document : undefined

    useEffect(() => {
        if (ExecutionEnvironment.canUseDOM) {
            AOS.init();
        }
    }, [ExecutionEnvironment.canUseDOM, documentEnabled]);

    return (
        <Layout
            title={"Features - FireCMS"}
            description="FireCMS includes all the features you need to kickstart your project and all the customization options you may need">
            <div className="flex flex-col min-h-screen overflow-hidden ">

                <main className="flex-grow">

                    <div style={{height: "350px"}}/>

                    <Features/>

                </main>

            </div>
        </Layout>
    );
}

export default FeaturesPage;

