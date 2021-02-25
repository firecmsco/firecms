import React, { useEffect, useState } from "react";
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
import { ThreeJSAnimationShader } from "../shape/ThreeJSAnimationShader";

function Home() {
    const context = useDocusaurusContext();
    const { siteConfig = {} } = context;

    const [scroll, setScroll] = useState(window.pageYOffset);

    useEffect(() => {
        const listener = () => {
            setScroll(window.pageYOffset);
        };
        window.addEventListener("scroll", listener);
        return () => {
            window.removeEventListener("scroll", listener);
        };
    }, []);

    useEffect(() => {
        AOS.init();
    }, []);

    return (
        <Layout
            title={`${siteConfig.title}`}
            description="Awesome Firestore based CMS">
            <div className="flex flex-col min-h-screen overflow-hidden">

                <main className="flex-grow">

                    <HeroHome scroll={scroll}/>

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
