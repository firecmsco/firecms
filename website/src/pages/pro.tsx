import React from "react";
import Layout from "@theme/Layout";

import { Hero } from "../partials/general/Hero";
import HeroButtons from "../partials/home/HeroButtons";
import { Panel } from "../partials/general/Panel";
import EnterpriseTeaser from "../partials/home/EnterpriseTeaser";
import { FormInfo } from "../partials/pro/FormInfo";
import { ProDeveloperFeatures } from "../partials/pro/ProDeveloperFeatures";
import { HeroCenter } from "../partials/general/HeroCenter";

function ProPage() {

    return (
        <Layout
            title={"Features - FireCMS"}
            description="FireCMS includes all the features you need to kickstart your project and all the customization options you may need.">

            <div className="flex flex-col min-h-screen">

                <main className="flex-grow">
                    <HeroCenter
                        height={"400px"}
                        color={"dark"}
                        title={
                            <>
                                <span
                                    className="block lg:inline">FireCMS <b>PRO</b></span>
                            </>}
                        subtitleColor={"gray"}
                        subtitle={
                            <>
                                <p className="max-w-7xl text-2xl md:text-5xl font-bold tracking-tight"
                                   style={{ lineHeight: 1.35 }}>
                                    FireCMS PRO is aimed at companies and teams that need to
                                    manage complex projects and require advanced features and
                                    support.
                                </p>
                            </>
                        }
                    />

                    <FormInfo/>

                    <ProDeveloperFeatures/>

                    <Panel color={"gray"} includePadding={true}>
                        <HeroButtons/>
                    </Panel>

                    <EnterpriseTeaser/>
                </main>
            </div>

        </Layout>
    );
}

export default ProPage;

