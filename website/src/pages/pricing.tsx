import React from "react";

import Layout from "@theme/Layout";
import { Hero } from "../partials/general/Hero";
import { VersionsComparison } from "../partials/pricing/VersionsComparison";
import { CLIInstructions } from "../partials/pricing/CLIInstructions";
import { FireCMSCloudVersions } from "../partials/pricing/FireCMSCloudVersions";
import { PricingQuote } from "../partials/pricing/PricingQuote";

function FeaturesPage() {
    const schemaMarkup = {
        "@context": "http://schema.org",
        "@type": "Product",
        "name": "FireCMS",
        "description": "Experience the power of FireCMS today completely for free. Try FireCMS Cloud for a fully-managed, full-service solution, or FireCMS PRO for a self-hosted version with additional features.",
        "offers": [
            {
                "@type": "Offer",
                "url": "https://firecms.co",
                "priceCurrency": "USD",
                "price": "0.00",
                "priceValidUntil": "2025-12-31",
                "itemCondition": "http://schema.org/NewCondition",
                "availability": "http://schema.org/InStock",
                "seller": {
                    "@type": "Organization",
                    "name": "FireCMS"
                }
            },
            {
                "@type": "Offer",
                "url": "https://firecms.co/pro",
                "priceCurrency": "USD",
                "price": "9.99",
                "priceValidUntil": "2025-12-31",
                "itemCondition": "http://schema.org/NewCondition",
                "availability": "http://schema.org/InStock",
                "seller": {
                    "@type": "Organization",
                    "name": "FireCMS"
                }
            }
        ]
    };
    return (
        <Layout
            title={"Pricing - FireCMS"}
            description="Self-hosted version and free Cloud tier, adaptive pricing for everyone">

            <script type="application/ld+json">
                {JSON.stringify(schemaMarkup)}
            </script>

            <Hero
                color={"primary"}
                title={
                    <>
                        <span className="block lg:inline">Pricing</span>
                    </>}
                subtitle={
                    <>
                        <p>
                            Experience the power of FireCMS today completely for <b>free</b>.
                        </p>
                        <p>
                            Try <b>FireCMS
                            Cloud</b> for a fully-managed, full-service solution, or <b>FireCMS PRO</b> for a
                            self-hosted
                            version with additional features.
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

            {/*<VersionsToggle value={version} onSelect={setVersion}/>*/}

            <FireCMSCloudVersions/>

            <CLIInstructions/>
<PricingQuote/>
            <VersionsComparison/>


        </Layout>
    );
}

export default FeaturesPage;

