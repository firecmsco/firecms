import React from "react";
import Layout from "@theme/Layout";

import Head from "@docusaurus/Head";
import HeroHome from "../partials/home/HeroHome";
import { TechSplash } from "../partials/home/TechSplash";
import FirebaseTeaser from "../partials/home/OpenSourceDetails";
import DatakiIntro from "../partials/home/DatakiIntro";
import FireCMSIntro from "../partials/home/FireCMSIntro";
import { DeveloperFeatures } from "../partials/features/DeveloperFeatures";
import { QuotesSection } from "../partials/Quotes";
import { organizationSchema, softwareApplicationSchema } from "../partials/markup";
import { ImportDataIntro } from "../partials/home/ImportDataIntro";
// import { clarityScript } from "../partials/clarity_head";
import { LaunchInSteps } from "../partials/home/LaunchInSteps";
import { BuiltFor } from "../partials/home/BuiltFor";
import { SchemaEditorShowcase } from "../partials/home/SchemaEditorShowcase";
import { DataTalkIntro } from "../partials/home/DataTalkIntro";
import { ClientLogos } from "../partials/ClientLogos";

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
                <meta property="og:image" content="https://firecms.co/img/firecms_logo.svg"/>
                <link rel="canonical" href="https://firecms.co"/>
                <script type="application/ld+json">
                    {JSON.stringify(softwareApplicationSchema)}
                </script>
                <script type="application/ld+json">
                    {JSON.stringify(organizationSchema)}
                </script>
                {/*<script type="text/javascript">*/}
                {/*    {clarityScript}*/}
                {/*</script>*/}
            </Head>

            <main className={"max-w-[100vw] bg-gray-950 relative"}>

                <HeroHome/>

                <FireCMSIntro/>

                <LaunchInSteps/>

                <QuotesSection/>
                <ClientLogos/>

                <BuiltFor/>

                <SchemaEditorShowcase/>

                <DataTalkIntro/>

                <ImportDataIntro/>

                <TechSplash/>

                <DeveloperFeatures/>

                <FirebaseTeaser/>

                <DatakiIntro/>

            </main>

        </Layout>
    );
}

export default Home;

