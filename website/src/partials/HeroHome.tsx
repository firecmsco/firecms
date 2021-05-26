import React, { useEffect, useState } from "react";
import useBaseUrl from "@docusaurus/useBaseUrl";
import useThemeContext from "@theme/hooks/useThemeContext";
import { ThreeJSAnimationShader } from "../shape/ThreeJSAnimationShader";
import HeroButtons from "./HeroButtons";

function HeroHome({  }) {

    const [scroll, setScroll] = useState(typeof window !== "undefined"
        ? window?.pageYOffset
        : 0);

    useEffect(() => {
        const listener = () => {
            if (typeof window !== "undefined")
                setScroll(window?.pageYOffset ?? 0);
        };
        if (typeof window !== "undefined")
            window.addEventListener("scroll", listener);
        return () => {
            if (typeof window !== "undefined")
                window.removeEventListener("scroll", listener);
        };
    }, []);

    return (
        <section className="relative" style={{
            isolation: "isolate"
        }}>

            <ThreeJSAnimationShader scroll={scroll}/>

            <div
                className="flex items-center justify-center px-4 sm:px-6 lg:mt-44 md:mt-40 mt-32">

                <div className="text-center ">
                    <h1
                        className="block text-5xl md:text-6xl font-extrabold leading-tighter tracking-tighter mb-3"
                        // data-aos="zoom-y-out"
                        // style={{
                        //     opacity: .9,
                        //     mixBlendMode: "color-dodge"
                        // }}
                    >
                            <span
                                className="block">Your Firestore</span>
                        <span className="block">based</span>
                    </h1>

                    <h1
                        className="block text-5xl md:text-6xl font-extrabold leading-tighter tracking-tighter mb-3"
                        data-aos="zoom-y-out"
                        data-aos-delay="100"
                        style={{
                            mixBlendMode: "color-dodge"
                        }}
                    >
                        <span
                            className="block text-purple-600 text-8xl md:text-9xl">CMS</span>
                    </h1>

                    <div className="max-w-3xl mx-auto mt-14"
                        // data-aos="zoom-y-out"
                        // data-aos-delay="200"
                    >
                    <HeroButtons/>
                    </div>

                </div>

            </div>

        </section>
    );
}

export default HeroHome;
