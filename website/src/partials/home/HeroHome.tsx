import React from "react";
import HeroButtons from "./HeroButtons";

// @ts-ignore
import darkModeVideo from "@site/static/img/dark_mode.mp4";
import { BrowserFrame } from "../BrowserFrame";

// const LazyThreeJSAnimationShader = React.lazy(() => import("../shape/ThreeJSAnimationShader"));

function HeroHome({}) {

    const video = <div
        // data-aos="fade-up"
        data-aos="fade-up"
        className="sm:px-24 md:px-32 flex content-center justify-center">
        <video
            style={{
                aspectRatio: 512 / 384
            }}
            className={"max-w-3xl my-16 rounded-xl border border-solid dark:border-gray-800 border-gray-200"}
            width="100%"
            loop autoPlay muted>
            <source src={darkModeVideo} type="video/mp4"/>
        </video>
    </div>;

    const titleDiv = <div className="px-16 md:px-32 my-4 ">

        <div className="text-center mt-20 lg:mt-40">
            <h1 className="block tracking-tight text-5xl md:text-6xl font-extrabold tracking-tight leading-none">
                <div className={"block"}>
                <span
                    data-aos="zoom-y-out"
                    data-aos-delay="100">Your </span>
                    <span
                        data-aos="zoom-y-out"
                        data-aos-delay="200"
                        style={{
                            // mixBlendMode: "color-dodge",
                            WebkitBackgroundClip: "text",
                            backgroundClip: "text",
                            backgroundImage: "linear-gradient(to right, #EC4C51, #FA5574, #9543C1, #9543C1)"
                        }}
                        className="font-extrabold text-transparent bg-clip-text text-7xl md:text-8xl">CMS</span>
                </div>
                <span
                    data-aos="zoom-y-out"
                    data-aos-delay="300">based on </span>
                <span
                    data-aos="zoom-y-out"
                    data-aos-delay="400"
                    className={"text-5xl md:text-7xl "}
                    style={{ color: "#FFA000" }}>Firebase</span>

            </h1>

            <h2 className={"text-3xl"}>
                The missing piece for your project
            </h2>

            <div className="mt-8 mb-8 flex justify-center">
                <HeroButtons/>
            </div>

        </div>

    </div>;

    return (
        <section className="relative my-16" style={{
            isolation: "isolate"
        }}>

            <div
                className={"col-span-7 "}>
                {titleDiv}
            </div>

            <div className={"col-span-5 "}>
                {video}
            </div>


        </section>
    );
}

export default HeroHome;
