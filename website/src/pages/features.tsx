import React from "react";
import Layout from "@theme/Layout";

import Features from "../partials/features/Features";
import { Hero } from "../partials/general/Hero";
import HeroButtons from "../partials/home/HeroButtons";
import { Panel } from "../partials/general/Panel";
import ProTeaser from "../partials/home/ProTeaser";
import { IntroText } from "../partials/features/IntroText";
import { FormInfo } from "../partials/features/FormInfo";
import { EnterpriseFeatures } from "../partials/enterprise/EnterpriseFeatures";
import { EnterpriseArchitectures } from "../partials/enterprise/EnterpriseArchitectures";
import { SchemaEditorIntro } from "../partials/features/SchemaEditorIntro";
import OpenAITeaser from "../partials/features/OpenAITeaser";
import Head from "@docusaurus/Head";
import { clarityScript } from "../partials/clarity_head";

function FeaturesPage() {

    return (
        <Layout
            title={"Features - FireCMS"}
            description="FireCMS includes all the features you need to kickstart your project and all the customization options you may need.">
            <Head>
                <meta property="og:title" content="FireCMS - Firestore/Firebase headless CMS"/>
                <meta property="og:description"
                      content="FireCMS includes all the features you need to kickstart your project and all the customization options you may need."/>
                <meta property="og:image" content="/img/firecms_logo.svg"/>
                <script type="text/javascript">
                    {clarityScript}
                </script>
            </Head>

            <div className="flex flex-col min-h-screen">

                <main className="flex-grow">
                    <Hero
                        title={
                            <>
                                <span
                                    className="block lg:inline">Features</span>
                            </>}
                        subtitle={
                            <>
                                <p>
                                    Easily Create, Edit, and Publish with a CMS that
                                    both <b>content managers and developers will
                                    love</b>.

                                </p>
                            </>
                        }
                    />

                    <Features/>

                    <IntroText/>

                    <FormInfo/>


                    <SchemaEditorIntro/>

                    <EnterpriseFeatures/>
                    <EnterpriseArchitectures/>
                    <OpenAITeaser/>

                    <Panel color={"light"} includePadding={true}>
                        <HeroButtons/>
                    </Panel>

                    <ProTeaser/>
                </main>
            </div>

        </Layout>
    );
}

export default FeaturesPage;

