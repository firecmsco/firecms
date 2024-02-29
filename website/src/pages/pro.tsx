import React from "react";
import Layout from "@theme/Layout";

import HeroButtons from "../partials/home/HeroButtons";
import { Panel } from "../partials/general/Panel";
import ProTeaser from "../partials/home/ProTeaser";
import { ProInfo } from "../partials/pro/ProInfo";
import { ProDeveloperFeatures } from "../partials/pro/ProDeveloperFeatures";
import { HeroPro } from "../partials/pro/HeroPro";
import { UnlimitedUsers } from "../partials/pro/UnlimitedUsers";
import { SampleProDemo } from "../SampleProDemo";

function ProPage() {

    return (
        <Layout
            title={"Features - FireCMS"}
            description="FireCMS includes all the features you need to kickstart your project and all the customization options you may need.">

            <div className="flex flex-col min-h-screen">

                <main className="flex-grow">
                    <HeroPro
                        height={"300px"}
                        color={"dark"}
                    />

                    <ProInfo/>

                    <SampleProDemo/>

                    <UnlimitedUsers/>

                    <ProDeveloperFeatures/>

                    <Panel color={"gray"} includePadding={true}>
                        <HeroButtons/>
                    </Panel>

                    <ProTeaser/>
                </main>
            </div>

        </Layout>
    );
}

export default ProPage;

