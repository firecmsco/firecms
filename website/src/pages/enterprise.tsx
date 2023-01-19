import React from "react";


import Layout from "@theme/Layout";
import { EnterpriseHero } from "../partials/enterprise/EnterpriseHero";
import { EnterpriseFeatures } from "../partials/enterprise/EnterpriseFeatures";

function Enterprise(){
    return (
        <Layout title="Enterprise" description="Enterprise">
            <div className="flex flex-col min-h-screen overflow-hidden ">

                <main className="flex-grow">

                    <div style={{height: "350px"}}/>

                    <EnterpriseHero />
                    <EnterpriseFeatures />
                    {/*<EnterprisePricing />*/}
                    {/*<EnterpriseContact />*/}

                </main>

            </div>
        </Layout>
    );
}

export default Enterprise;
