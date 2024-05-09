import React from "react";
import Layout from "@theme/Layout";

import HeroDataTalk from "../partials/datatalk/HeroDataTalk";
import DataStorageOptions from "../partials/datatalk/DataStorageOptions";
import {FocusOnBusiness} from "../partials/datatalk/FocusOnBusiness";
import {QuotesSection} from "../partials/Quotes";
import GetStarted from "../partials/datatalk/GetStarted";
import {Features} from "../partials/datatalk/Features";
import {VisualFeatures} from "../partials/datatalk/VisualFeatures";

function DataEnhancement() {

    return (
        <Layout
            title="DataTalk | The Ultimate AI Assistant that understand your data">
            <HeroDataTalk/>
            <DataStorageOptions/>
            <FocusOnBusiness/>
            <QuotesSection/>
            <VisualFeatures/>
            <GetStarted/>
            <Features/>
        </Layout>
    );
}

export default DataEnhancement;
