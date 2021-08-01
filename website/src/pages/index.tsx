import React, { useEffect } from "react";
import Layout from "@theme/Layout";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

import HeroHome from "../partials/HeroHome";
import FeaturesHome from "../partials/Features";
import FeaturesBlocks from "../partials/FeaturesBlocks";
import Testimonials from "../partials/Testimonials";

import Separator from "../partials/Separator";
import FirebaseIntro from "../partials/FirebaseIntro";

import AOS from "aos";
import "aos/dist/aos.css";
import "../css/tailwind.css";

function Home() {
    const context = useDocusaurusContext();
    const { siteConfig = {} } = context;

    useEffect(() => {
        AOS.init();
    }, []);

    return (
        <Layout
            title={`${siteConfig.title}`}
            description="Awesome Firestore/Firebase-based  headless CMS/admin tool">

            <div className="flex flex-col min-h-screen overflow-hidden">

                <main className="flex-grow">
                    <HeroHome/>

                    <Separator/>

                    <FirebaseIntro/>
                    <FeaturesHome/>
                    <Separator/>

                    <FeaturesBlocks/>
                    <Separator/>

                    <Testimonials/>

                </main>

            </div>
        </Layout>
    );
}

export default Home;
