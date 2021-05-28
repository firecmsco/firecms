import React, { useEffect } from "react";
import Layout from "@theme/Layout";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import HeroHome from "../partials/HeroHome";
import FeaturesHome from "../partials/Features";
import FeaturesBlocks from "../partials/FeaturesBlocks";
import Testimonials from "../partials/Testimonials";

import AOS from "aos";
import "aos/dist/aos.css";
import "../css/tailwind.css";
import Separator from "../partials/Separator";
import FirebaseIntro from "../partials/FirebaseIntro";
import Head from '@docusaurus/Head';

function Home() {
    const context = useDocusaurusContext();
    const { siteConfig = {} } = context;

    useEffect(() => {
        AOS.init();
    }, []);

    return (
        <Layout
            title={`${siteConfig.title}`}
            description="Awesome Firestore based CMS">
            <Head>
                <script src="/__/firebase/8.6.2/firebase-app.js"></script>
                <script src="/__/firebase/8.6.2/firebase-analytics.js"></script>
                <script src="/__/firebase/init.js"></script>
            </Head>

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
