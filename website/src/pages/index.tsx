import React, { useEffect, useState } from "react";
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
        updateDarkModeClass();
    }, [window]);

    function updateDarkModeClass() {
        if (document.documentElement?.dataset?.theme === "dark" && !document.documentElement.classList.contains("dark")) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }

    useMutationObservable(document.documentElement, (mutations) => {
        mutations.forEach(function(mutation) {
            if (mutation.type == "attributes" && mutation.attributeName === "data-theme") {
                updateDarkModeClass();
            }
        });
    });


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

function useMutationObservable(targetEl, cb, config = { attributes: true, childList: false, subtree: false }) {
    useEffect(() => {
        const observer = new MutationObserver(cb);
        observer.observe(targetEl, config);
        return () => {
                observer.disconnect();
        };
    }, [targetEl, config]);
}
