import React from "react";
import Layout from "../components/Layout.tsx";
import { AutofillFeature } from "../partials/data_enhancement/AutofillFeature";
// import { NLPIntegration } from "../partials/data_enhancement/NLPIntegration";
// import { CustomizationOptions } from "../partials/data_enhancement/CustomizationOptions";
// import { Testimonials } from "../partials/data_enhancement/Testimonials";
// import { Contact } from "../partials/data_enhancement/Contact";
import { DataEnhancementUseCases } from "../partials/data_enhancement/DataEnhancementUseCases";
import { DataEnhancementHero } from "../partials/data_enhancement/DataEnhancementHero";
import { Translations } from "../partials/data_enhancement/Translations";
import { DataStructure } from "../partials/data_enhancement/DataStructure";

function DataEnhancement() {

    return (
        <Layout
            title="CMS with ChatGPT Integration | Autofill Feature | Natural Language Processing | Customization Options">

            <DataEnhancementHero/>

            <DataEnhancementUseCases/>
            <AutofillFeature/>
            <DataStructure/>
            <Translations/>
        </Layout>
    );
}

export default DataEnhancement;
