import React, { useEffect } from "react";
import Layout from "@theme/Layout";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";

import AOS from "aos";
import "aos/dist/aos.css";
import "../css/tailwind.css";
import Head from "@docusaurus/Head";
import Features from "../partials/Features";

// import { Newsletter } from "../partials/Newsletter";

function FeaturesPage() {

    return (
        <Layout
            title={"FireCMS"}
            description="Awesome headless CMS based Firestore/Firebase and React, and completely open-source">
            <Head>
                <title>FireCMS - Firestore/Firebase headless CMS</title>
            </Head>
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

