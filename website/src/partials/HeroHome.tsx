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
        top: 0,
        zIndex: -10
    }}/>;

    const video = <div
        data-aos="fade-up"
        data-aos-delay="400"
        className="xl:max-w-3xl px-8 sm:px-16 md:px-24 xl:px-4">
        <video
            className={"rounded-xl border-solid dark:border-gray-800 border-gray-200"}
            width="100%" loop autoPlay muted>
            <source src={darkModeVideo} type="video/mp4"/>
        </video>
    </div>;

    const titleDiv = <div
        className="sm:px-6 px-16 my-4 xl:my-8">

        <div className="text-center xl:text-right">
            <h1
                className="block text-5xl md:text-6xl font-extrabold tracking-tight leading-none"
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
                        // mixBlendMode: "color-dodge",
                        WebkitBackgroundClip: "text",
                        backgroundClip: "text",
                        backgroundImage: "linear-gradient(to right, #EC4C51, #FA5574, #9543C1, #9543C1)"
                    }}
                    className="text-8xl font-extrabold text-8xl md:text-9xl text-transparent bg-clip-text">CMS</span>
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


            <div className="xl:grid xl:grid-cols-12 xl:my-24 md:my-16 my-8 ">

                <div className={"col-span-7"}>
                {titleDiv}
                </div>

                <div className={"col-span-5"}>
                {video}
                </div>

            </div>

        </section>
    );
}

export default HeroHome;
