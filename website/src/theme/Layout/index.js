import React, { useEffect } from "react";
import Layout from "@theme-original/Layout";
import { PagesBackground } from "../../partials/PagesBackground";
import docsearch from '@docsearch/js';
import siteConfig from '@generated/docusaurus.config';

import '@docsearch/css';
import '../../css/custom.css';

export default function LayoutWrapper(props) {

    useEffect(() => {
        docsearch({
            container: '#docsearch',
            appId: siteConfig.customFields.docSearchAppId,
            apiKey: siteConfig.customFields.docSearchApiKey,
            indexName: "firecms",
        });
    }, []);

    return (
        <>
            <PagesBackground/>
            <Layout {...props} />
        </>
    );
}
