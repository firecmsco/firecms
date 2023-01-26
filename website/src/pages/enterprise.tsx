import React from "react";

import Layout from "@theme/Layout";
import { EnterpriseHero } from "../partials/enterprise/EnterpriseHero";
import { EnterpriseFeatures } from "../partials/enterprise/EnterpriseFeatures";
import {
    EnterpriseArchitectures
} from "../partials/enterprise/EnterpriseArchitectures";

function Enterprise() {
    return (
        <Layout title="Enterprise" description="Enterprise">
            <div className="flex flex-col min-h-screen">

                <main className="flex-grow">

                    <EnterpriseHero/>
                    <EnterpriseFeatures/>
                    <EnterpriseArchitectures/>
                    {/*<EnterpriseContact />*/}

                </main>

            </div>
        </Layout>
    );
}

export default Enterprise;
