import React from "react";

import Layout from "@theme/Layout";
import { Hero } from "../partials/general/Hero";
import { VersionsComparison } from "../partials/pricing/VersionsComparison";
import { SelfHosted } from "../partials/pricing/SelfHosted";
import { FireCMSCloudVersions } from "../partials/pricing/FireCMSCloudVersions";
import { VersionsToggle } from "../partials/pricing/VersionsToggle";

function FeaturesPage() {

    const [version, setVersion] = React.useState<"cloud" | "self-hosted">("cloud");

    return (
        <Layout
            title={"Pricing - FireCMS"}
            description="Free self-hosted version and free Cloud tier, adaptive pricing for everyone">

            <Hero
                title={
                    <>
                        <span className="block lg:inline">Pricing</span>
                    </>}
                subtitle={
                    <>
                        <p>Experience the power of our CMS platform with a
                            free, <b>self-hosted</b> option or upgrade to <b>FireCMS
                                Cloud</b> for a premium, full-service solution.
                        </p>
                    </>}
                // cta={<a
                //     href="mailto:hello@firecms.co?subject=FireCMS%20consulting"
                //     rel="noopener noreferrer"
                //     target="_blank"
                //     className={CTAButtonMixin}>
                //     Get in touch
                // </a>}
            />

            <VersionsToggle value={version} onSelect={setVersion}/>

            {version === "cloud" && <FireCMSCloudVersions/>}
            {version === "self-hosted" && <SelfHosted/>}
            <VersionsComparison/>


        </Layout>
    );
}

export default FeaturesPage;

