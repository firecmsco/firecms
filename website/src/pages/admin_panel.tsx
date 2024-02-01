import React from "react";

import Layout from "@theme/Layout";
import { EnterpriseHero } from "../partials/enterprise/EnterpriseHero";
import { EnterpriseFeatures } from "../partials/enterprise/EnterpriseFeatures";
import { EnterpriseArchitectures } from "../partials/enterprise/EnterpriseArchitectures";
import { CTAOutlinedButtonWhiteMixin } from "../partials/styles";
import { Panel } from "../partials/general/Panel";

function AdminPanel() {
    return (
        <Layout title="Your admin panel" description="Customize FireCMS to exactly met the needs of your business">
            <div className="flex flex-col min-h-screen">

                <main className="flex-grow">

                    <EnterpriseHero/>
                    <EnterpriseFeatures/>
                    <EnterpriseArchitectures/>
                    <Panel color={"primary"} centered={true}>
                        <h2 className="h3 text-center mb-4">
                            Happy to help you build your next product
                        </h2>
                        <a href="mailto:hello@firecms.co?subject=FireCMS%20consulting"
                           rel="noopener noreferrer"
                           target="_blank"
                           className={CTAOutlinedButtonWhiteMixin + " mb-8"}>
                            Get in touch
                        </a>
                    </Panel>
                </main>

            </div>
        </Layout>
    );
}

export default AdminPanel;
