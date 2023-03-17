import React from "react";
import Layout from "@theme/Layout";
import { Hero } from "../partials/general/Hero";
import { AutofillFeature } from "../partials/data_enhancement/AutofillFeature";
// import { NLPIntegration } from "../partials/data_enhancement/NLPIntegration";
// import { CustomizationOptions } from "../partials/data_enhancement/CustomizationOptions";
// import { Testimonials } from "../partials/data_enhancement/Testimonials";
// import { Contact } from "../partials/data_enhancement/Contact";
import { CTAButtonMixin } from "../partials/utils";

function DataEnhancement() {
    return (
        <Layout title="CMS with OpenAI Integration | Autofill Feature | Natural Language Processing | Customization Options">
            <Hero
                title={
                    <>
                        <span className="block lg:inline">OpenAI</span>
                        <span className="block text-primary lg:inline">Integration</span>
                    </>
                }
                subtitle={
                    <>
                        <p>
                            Our CMS with OpenAI integration offers a powerful autofill feature that can save you time and increase the accuracy of your data entry. It also includes natural language processing capabilities and a wide range of customization options to suit your specific business needs.
                        </p>
                        <p>
                            Sign up now and experience the power of OpenAI to enhance your data entry and streamline your business processes.
                        </p>
                    </>
                }
                cta={<a href="mailto:hello@firecms.co?subject=FireCMS%20consulting"
                        rel="noopener noreferrer"
                        target="_blank"
                        className={CTAButtonMixin}>
                    Get started
                </a>}
            />
            <AutofillFeature />
            {/*<NLPIntegration />*/}
            {/*<CustomizationOptions />*/}
            {/*<Testimonials />*/}
            {/*<Contact />*/}
        </Layout>
    );
}

export default DataEnhancement;
