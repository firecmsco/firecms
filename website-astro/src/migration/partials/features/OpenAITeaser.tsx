import React from "react";
import { useColorMode } from "@docusaurus/theme-common";

import { CTAButtonMixin, CTACaret, defaultBorderMixin } from "../styles";
import { Panel } from "../general/Panel";
import { TwoColumns } from "../general/TwoColumns";
import useBaseUrl from "@docusaurus/useBaseUrl";

import clsx from "clsx";

function OpenAITeaser() {

    const { colorMode } = useColorMode();
    const isDarkTheme = colorMode === "dark";

    return (
        <Panel color={"light"}>

            <TwoColumns
                left={
                    <div>

                        <p className="text-secondary uppercase font-bold font-mono">
                            Advanced editing
                        </p>


                        <div className={"flex items-center mb-4"}>
                            <div className="flex items-center justify-center text-white w-10 h-10 bg-gray-900 rounded-full shadow flex-shrink-0 mr-4">
                                <img src="/img/icons/magic.svg" alt="Magic" className="w-6 h-6"/>
                            </div>

                            <h2 className="m-0">
                                <span>AI </span>
                                <span className="text-primary">Integration</span>
                            </h2>
                        </div>

                        <div className="mt-3 text-xl sm:mt-4 md:text-2xl">
                            <p>
                                FireCMS with AI integration offers a
                                powerful
                                autofill
                                feature that can save you time and increase the
                                accuracy
                                of your data entry.
                            </p>
                            <p>
                                Try it in your project and data <b>for
                                free</b> and experience the power of the
                                latest GPT
                                models to enhance your data entry and streamline
                                your
                                business processes.
                            </p>
                        </div>

                        <div
                            className="mt-5 sm:mt-8">
                            <a href={useBaseUrl("openai/")}
                               className={CTAButtonMixin}>
                                About this integration
                                <CTACaret/>
                            </a>

                        </div>
                    </div>
                }
                right={<>

                    <div
                        style={{
                            aspectRatio: 550 / 692,
                            maxHeight: "692px",
                            maxWidth: "550px"
                        }}
                        data-aos="fade-up"
                        className={" flex content-center justify-center"}>
                        <video
                            key={isDarkTheme ? "dark" : "light"}
                            className={clsx("pointer-events-none rounded-2xl border", defaultBorderMixin)}
                            width="100%"
                            loop autoPlay muted>
                            <source
                                src={isDarkTheme ? "/img/data/books_dark.mp4" : "/img/data/books_light.mp4"}
                                type="video/mp4"/>
                        </video>
                    </div>


                </>}/>
        </Panel>
    );
}

export default OpenAITeaser;
