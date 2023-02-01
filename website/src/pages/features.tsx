import React from "react";
import Layout from "@theme/Layout";

import Features from "../partials/features/Features";
import { Hero } from "../partials/general/Hero";
import { DeveloperFeatures } from "../partials/features/DeveloperFeatures";

function FeaturesPage() {

    return (
        <Layout
            title={"Features - FireCMS"}
            description="FireCMS includes all the features you need to kickstart your project and all the customization options you may need">

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
                                <p>Easily Create, Edit and Publish with
                                    FireCMS</p>
                            </>}
                        // cta={<a
                        //     href="mailto:hello@firecms.co?subject=FireCMS%20consulting"
                        //     rel="noopener noreferrer"
                        //     target="_blank"
                        //     className={CTAButtonMixin}>
                        //     Get in touch
                        // </a>}
                    />

                    <Features/>

                    <DeveloperFeatures/>

                </main>
            </div>

        </Layout>
    );
}

export default FeaturesPage;

