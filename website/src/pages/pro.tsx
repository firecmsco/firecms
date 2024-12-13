import React from "react";
import Layout from "@theme/Layout";
import { Panel } from "../partials/general/Panel";
import { ProInfo } from "../partials/pro/ProInfo";
import { ProDeveloperFeatures } from "../partials/pro/ProDeveloperFeatures";
import { HeroPro } from "../partials/pro/HeroPro";

import { PublicFacingApps } from "../partials/pro/PublicFacingApps";
import ProFeaturesPanels from "../partials/pro/ProFeaturesPanels";
import HeroProButtons from "../partials/home/HeroProButtons";
import { UITeaser } from "../partials/home/UITeaser";
import { ImportDataIntro } from "../partials/home/ImportDataIntro";
import Head from "@docusaurus/Head";
import { clarityScript } from "../partials/clarity_head";

function ProPage() {

    return (
        <Layout
            title={"PRO - FireCMS"}
            description="FireCMS PRO is the CMS aimed at companies and agencies that need a high degree of customization and support.">
            <Head>
                <meta property="og:title" content="PRO - FireCMS"/>
                <meta property="og:description"
                      content="FireCMS PRO is the CMS aimed at companies and agencies that need a high degree of customization and support."/>
                <meta property="og:image" content="/img/firecms_logo.svg"/>
                <script type="text/javascript">
                    {clarityScript}
                </script>
            </Head>
            <div className="flex flex-col min-h-screen">

                <main className="flex-grow">
                    <HeroPro
                        height={"300px"}
                    />

                    <ProInfo/>


                    <ProFeaturesPanels/>

                    <Panel color={"light_gray"} includeMargin={false}>
                        <div
                            className={"max-w-7xl text-2xl md:text-5xl font-bold tracking-tight uppercase font-mono"}>
                            <p>
                                FireCMS PRO was crafted through collaboration with various <strong>companies</strong>,
                                out of the
                                need to have a CMS that could be used in <strong>different scenarios</strong> and that
                                could be easily customized to fit different needs.
                            </p>
                        </div>
                    </Panel>

                    <PublicFacingApps/>

                    <ImportDataIntro/>

                    <UITeaser/>

                    <ProDeveloperFeatures/>

                    <Panel color={"gray"} includePadding={true} innerClassName={"flex flex-col items-center"}>
                        <h2 className={"mb-3 uppercase font-mono text-center mx-auto"}>
                            LEARN MORE ABOUT FIRECMS PRO
                        </h2>
                        <HeroProButtons/>
                        <div className="text-sm text-center text-gray-300 mb-4">
                            Try out FireCMS PRO completely for <b>FREE</b>!
                        </div>
                        <div className={"flex flex-col items-center"}>
                            <div
                                className={"items-center select-all font-mono text-gray-800 p-4 px-6 bg-gray-200 border-gray-300 border-solid w-fit text-md font-bold inline-flex rounded-md"}>
                                yarn create firecms-app --pro
                            </div>
                        </div>
                    </Panel>

                </main>
            </div>

        </Layout>
    );
}

export default ProPage;

