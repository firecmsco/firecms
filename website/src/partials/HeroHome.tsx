import React, { Suspense } from "react";
import HeroButtons from "./HeroButtons";
import BrowserOnly from "@docusaurus/BrowserOnly";

const LazyThreeJSAnimationShader = React.lazy(() => import("../shape/ThreeJSAnimationShader"));


function HeroHome({}) {


    const fallback = <canvas style={{
        height: "1000px",
        width: "100vh",
        maxHeight: "1000px",
        position: "fixed",
        transform: `translateY(60px)`,
        top: 0,
        zIndex: -10
    }}/>;
    return (
        <section className="relative" style={{
            isolation: "isolate"
        }}>

            <BrowserOnly
                fallback={fallback}>
                {() =>(
                    <Suspense fallback={fallback}>
                        <LazyThreeJSAnimationShader/>
                    </Suspense>
                )}
            </BrowserOnly>

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
