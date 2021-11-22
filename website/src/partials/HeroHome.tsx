import React, { Suspense } from "react";
import HeroButtons from "./HeroButtons";
import BrowserOnly from "@docusaurus/BrowserOnly";

// @ts-ignore
import darkModeVideo from "@site/static/img/dark_mode.mp4";

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

    const video = <div
        data-aos="fade-up"
        data-aos-delay="400"
        className="max-w-3xl px-8 sm:px-16 md:px-24 xl:px-4">
        <video
            className={"rounded-xl shadow-md border-gray-200"}
            width="100%" loop autoPlay muted>
            <source src={darkModeVideo} type="video/mp4"/>
        </video>
    </div>;

    const titleDiv = <div
        className="sm:px-6 px-16 my-4 xl:my-16">

        <div className="text-center xl:text-right">
            <h1
                className="block text-5xl md:text-6xl font-extrabold leading-tighter tracking-tighter"
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

            <div className="mt-8 mb-16 flex justify-center xl:justify-end"
            >
                <HeroButtons/>
            </div>

        </div>

    </div>;
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


            <div className="xl:grid xl:grid-cols-2 xl:my-24 md:my-16 my-8 ">

                {titleDiv}

                {video}

            </div>

        </section>
    );
}

export default HeroHome;
