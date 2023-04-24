import React from "react";
import HeroButtons from "./HeroButtons";

// @ts-ignore
import darkModeVideo from "@site/static/img/full_screen_dark.mp4";
// @ts-ignore
import lightModeVideo from "@site/static/img/full_screen_light.mp4";
import { BrowserFrame } from "../BrowserFrame";
import { useColorMode } from "@docusaurus/theme-common";
import { ContainerMixin } from "../utils";

// const LazyThreeJSAnimationShader = React.lazy(() => import("../shape/ThreeJSAnimationShader"));

function HeroHome({}) {

    const { colorMode } = useColorMode();
    const isDarkTheme = colorMode === "dark";

    const video = <div
        className={ContainerMixin + " flex flex-col items-center px-8 sm:px-16 content-center justify-center"}>
        <video
            key={isDarkTheme ? "dark" : "light"}
            style={{
                aspectRatio: 1440 / 587
            }}
            className={"my-4 rounded-xl border border-solid dark:border-gray-800 border-gray-200"}
            width="100%"
            loop autoPlay muted>
            <source src={isDarkTheme ? darkModeVideo : lightModeVideo}
                    type="video/mp4"/>
        </video>
    </div>;

    const titleDiv = <div className="px-16 md:px-32 my-4 ">

        <div className="text-center mt-16 lg:mt-28">
            <h1 className="block tracking-tight text-5xl md:text-6xl font-extrabold tracking-tight leading-none uppercase">
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
                The AI enabled Content Management System
            </h2>

            <HeroButtons/>

        </div>

    </div>;

    return (
        <section className="relative my-12 mb-16" style={{
            isolation: "isolate"
        }}>

            {titleDiv}

            {video}

        </section>
    );
}

export default HeroHome;
