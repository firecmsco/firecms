import React, { Suspense } from "react";
import HeroButtons from "./HeroButtons";
import BrowserOnly from "@docusaurus/BrowserOnly";

const LazyThreeJSAnimationShader = React.lazy(() => import("../shape/ThreeJSAnimationShader"));


function HeroHome({}) {


    const fallback = <canvas style={{
        height: "800px",
        width: "100vh",
        maxHeight: "800px",
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
                {() => (
                    <Suspense fallback={fallback}>
                        <LazyThreeJSAnimationShader/>
                    </Suspense>
                )}
            </BrowserOnly>

            {/*<div className="grid grid-cols-1 md:grid-cols-2">*/}

                <div
                    className="flex items-center justify-center px-4 sm:px-6 lg:mt-44 md:mt-40 mt-32">

                    <div className="text-center">
                        <h1
                            className="block text-5xl md:text-6xl font-extrabold leading-tighter tracking-tighter mb-3"
                        >
                            <span
                                data-aos="zoom-y-out"
                                data-aos-delay="50"
                                className="block">Your </span>
                            <span
                                data-aos="zoom-y-out"
                                data-aos-delay="100"
                                className="block">Firestore-based </span>

                            <span
                                data-aos="zoom-y-out"
                                data-aos-delay="150"
                                style={{
                                    mixBlendMode: "color-dodge"
                                }}
                                className="block text-5xl md:text-6xl font-extrabold leading-tighter tracking-tighter mb-3 block text-purple-600 text-8xl md:text-9xl">CMS</span>
                        </h1>

                        <div className="max-w-3xl mx-auto mt-14"
                        >
                            <HeroButtons/>
                        </div>

                    </div>

                </div>
            {/*</div>*/}

        </section>
    );
}

export default HeroHome;
