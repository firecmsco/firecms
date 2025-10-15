import React from "react";
import Layout from "../components/Layout.tsx";

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
