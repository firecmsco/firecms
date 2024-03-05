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

function FeaturesPage() {

    return (
        <Layout
            title={"Features - FireCMS"}
            description="FireCMS includes all the features you need to kickstart your project and all the customization options you may need.">

            <div className="flex flex-col min-h-screen">

                <main className="flex-grow">
                    <Hero
                        color={"secondary"}
                        title={
                            <>
                                <span
                                    className="block lg:inline">Features</span>
                            </>}
                        subtitle={
                            <>
                                <p>
                                    Empowering Your Content Management: Easily
                                    Create, Edit, and Publish with a CMS that
                                    both <b>content managers and developers will
                                    love</b>.

                                </p>
                            </>
                        }
                    />

                    <Features/>

                    <IntroText/>

                    <FormInfo/>

                    <Panel color={"light"} includePadding={true}>
                        <HeroButtons/>
                    </Panel>

                    <EnterpriseFeatures/>
                    <EnterpriseArchitectures/>

                    <ProTeaser/>
                </main>
            </div>

        </Layout>
    );
}

export default FeaturesPage;

