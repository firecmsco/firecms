import React from "react";
import Layout from "@theme/Layout";

import Head from "@docusaurus/Head";
import HeroHome from "../partials/home/HeroHome";
import { TechSplash } from "../partials/home/TechSplash";
import { ManageYour } from "../partials/home/ManageYour";
import FeaturesPanels from "../partials/home/FeaturesPanels";
import FirebaseTeaser from "../partials/home/OpenSourceDetails";
import FirebaseIntro from "../partials/home/FirebaseIntro";
import { Companies } from "../partials/home/Companies";
import { UITeaser } from "../partials/home/UITeaser";
import FeaturesTeaser from "../partials/home/FeaturesTeaser";
import { DeveloperFeatures } from "../partials/features/DeveloperFeatures";
import { UsageExamples } from "../partials/UsageExamples";
import { QuotesSection } from "../partials/Quotes";
import { organizationSchema, softwareApplicationSchema } from "../partials/markup";
import { ImportDataIntro } from "../partials/home/ImportDataIntro";
import { clarityScript } from "../partials/clarity_head";

function Home() {

    return (
        <Layout
            title={"FireCMS"}
            description="Headless CMS based on Firestore/Firebase, React and tailwindcss, and completely open-source">
            <Head>
                <title>FireCMS - Firestore/Firebase headless CMS</title>
                <meta property="og:title" content="FireCMS - Firestore/Firebase headless CMS"/>
                <meta property="og:description"
                      content="Headless CMS based on Firestore/Firebase, React and tailwindcss, and completely open-source"/>
                <meta property="og:image" content="/img/firecms_logo.svg"/>
                <script type="application/ld+json">
                    {JSON.stringify(softwareApplicationSchema)}
                </script>
                <script type="application/ld+json">
                    {JSON.stringify(organizationSchema)}
                </script>
                <script type="text/javascript">
                    {clarityScript}
                </script>
            </Head>

            <HeroHome/>

            <main className={"bg-white max-w-[100vw] overflow-x-hidden"}>

                <FirebaseIntro/>

                <UsageExamples/>

                <ManageYour/>

                <QuotesSection/>

                <Companies/>

                <UITeaser/>

                <FeaturesTeaser/>

                <DeveloperFeatures/>

                <TechSplash/>

                <FeaturesPanels/>

                <ImportDataIntro/>

                <FirebaseTeaser/>

            </main>

        </Layout>
    );
}

export default Home;

