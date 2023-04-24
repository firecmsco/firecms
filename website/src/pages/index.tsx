import React from "react";
import Layout from "@theme/Layout";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

import Head from "@docusaurus/Head";
import { TechSplash } from "../partials/home/TechSplash";
import { ManageYour } from "../partials/home/ManageYour";
import HeroHome from "../partials/home/HeroHome";
import FeaturesPanels from "../partials/home/FeaturesPanels";
import FirebaseTeaser from "../partials/home/OpenSourceDetails";
import FirebaseIntro from "../partials/home/FirebaseIntro";
import { Companies } from "../partials/home/Companies";
import FeaturesTeaser from "../partials/home/FeaturesTeaser";
import EnterpriseTeaser from "../partials/home/EnterpriseTeaser";
import { FireCMSCloudIntro } from "../partials/home/FireCMSCloudIntro";
import OpenAITeaser from "../partials/home/OpenAITeaser";
import { IntroText } from "../partials/home/IntroText";

function Home() {
    const context = useDocusaurusContext();
    const { siteConfig = {} } = context;

    return (
        <Layout
            title={"FireCMS"}
            description="Awesome headless CMS based Firestore/Firebase and React, and completely open-source">
            <Head>
                <title>FireCMS - Firestore/Firebase headless CMS</title>
            </Head>
            <div className="flex flex-col min-h-screen overflow-hidden">

                <main className="flex-grow">

                    <HeroHome/>

                    <ManageYour/>

                    <FirebaseIntro/>
                    <OpenAITeaser/>

                    <IntroText/>
                    {/*<FireCMSCloudIntro/>*/}

                    <FeaturesPanels/>

                    <TechSplash/>
                    <Companies/>

                    <FeaturesTeaser/>
                    <EnterpriseTeaser/>

                    <FirebaseTeaser/>

                </main>

            </div>
        </Layout>
    );
}

export default Home;

