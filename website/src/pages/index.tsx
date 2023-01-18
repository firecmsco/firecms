import React, { useEffect } from "react";
import Layout from "@theme/Layout";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";

import AOS from "aos";
import "aos/dist/aos.css";
import "../css/tailwind.css";
import Head from "@docusaurus/Head";

import { FireCMSCloudIntro } from "../partials/home/FireCMSCloudIntro";
import { TechSplash } from "../partials/home/TechSplash";
import { ManageYour } from "../partials/home/ManageYour";
import HeroHome from "../partials/home/HeroHome";
import FeaturesPanels from "../partials/home/FeaturesPanels";
import FirebaseTeaser from "../partials/home/OpenSourceDetails";
import FirebaseIntro from "../partials/home/FirebaseIntro";
import { Companies } from "../partials/home/Companies";
import Features from "../partials/Features";

// import { Newsletter } from "../partials/Newsletter";

function Home() {
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
            title={"FireCMS"}
            description="Awesome headless CMS based Firestore/Firebase and React, and completely open-source">
            <Head>
                <title>FireCMS - Firestore/Firebase headless CMS</title>
            </Head>
            <div className="flex flex-col min-h-screen overflow-hidden ">

                <main className="flex-grow">

                    <HeroHome/>

                    <ManageYour/>

                    {/*<Separator/>*/}
                    <FirebaseIntro/>

                    {/*<FireCMSCloudIntro/>*/}

                    <FeaturesPanels/>

                    <TechSplash/>
                    <Companies/>

                    <Features/>
                    <FirebaseTeaser/>


                </main>

            </div>
        </Layout>
    );
}

export default Home;

