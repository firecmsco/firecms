import React from "react";
// @ts-ignore
import editingDemoDarkVideo from "@site/static/img/data_talk.mp4";

import { useColorMode } from "@docusaurus/theme-common";
import { defaultBorderMixin } from "../styles";
import { Panel } from "../general/Panel";
import clsx from "clsx";
import { LinedSpace } from "../layout/LinedSpace";
import { MainHeroBackground } from "../general/MainHeroBackground";
import HeroButtons from "./HeroButtons";
import DataTalkLogo from "@site/static/img/logos/datatalk.svg";

function HeroDataTalk({}) {

    const { colorMode } = useColorMode();
    const isDarkTheme = colorMode === "dark";

    const video = <div
        className={"flex flex-col items-center content-center justify-center rounded-md -m-px py-2"}>
        <video
            style={{
                aspectRatio: 1
            }}
            key={isDarkTheme ? "dark" : "light"}
            className={clsx("rounded-2xl border", defaultBorderMixin)}
            width="100%"
            loop autoPlay muted>
            <source src={editingDemoDarkVideo}
                    type="video/mp4"/>
        </video>
    </div>;

    const titleDiv = <>
      <h2
        className={clsx("m-0 text-center block text-5xl md:text-3xl font-extrabold tracking-tight leading-none uppercase text-white",
          "px-12 md:px-18 py-4 md:py-12",
          "border-0 border-b",
          defaultBorderMixin)}>

        <DataTalkLogo className="justify-center w-48 h-auto m-4"/>
        <div className={"block"}>
                <span
                  style={{
                    // mixBlendMode: "color-dodge",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    backgroundImage: "linear-gradient(to right, #EC4C51, #FA5574, #9543C1, #9543C1)"
                  }}
                  className="font-extrabold text-transparent bg-clip-text text-3xl md:text-4xl">Data Talk</span>
        </div>
        <span>The Ultimate AI Assistant that understands your </span>
        <span
          className={"text-2xl md:text-3xl"}
          style={{color: "#FFA000"}}>Data</span>
        <br/><br/>
        <span
          className={clsx("font-mono text-center uppercase m-0 text-xl px-4 md:px-8 py-4 md:py-6 border-0 border-t text-white", defaultBorderMixin)}>
          Start using natural language to be your own Business Intelligence, Data Analyst, Data scientist and Developer.
          Talk directly to the data using our AI
        </span>
        <HeroButtons/>
      </h2>
    </>;

  return (
    <div
      className={clsx("w-full relative border-0 border-b -mt-20 bg-black bg-opacity-80 dark:bg-gray-900 dark:bg-opacity-90", defaultBorderMixin)}>
      <MainHeroBackground/>
      <Panel includeMargin={false}
             includePadding={false}
             color={"transparent"}
                   className={"border-t-0"}>
                <div className={"h-20 "}/>
                <div className="flex flex-wrap w-full">
                    <div className={clsx("w-full lg:w-1/2 border-0 border-r", defaultBorderMixin)}>
                        <LinedSpace/>
                        {titleDiv}
                    </div>
                    <div className="w-full lg:w-1/2">
                        {video}
                    </div>
                </div>
                <LinedSpace position={"top"}/>
            </Panel>
        </div>
    );
}

export default HeroDataTalk;
