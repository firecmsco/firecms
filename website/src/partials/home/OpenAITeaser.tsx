import React from "react";
// @ts-ignore
import featuresBg from "@site/static/img/features-bg.png";
// @ts-ignore
import featuresElement from "@site/static/img/features-element.png";

// @ts-ignore
import ReactLogo from "@site/static/img/reactjs-icon.svg";
// @ts-ignore
import FirebaseLogo from "@site/static/img/firebase.svg";

import { useColorMode } from "@docusaurus/theme-common";

import { CTAButtonMixin, CTACaret, CTAOutlinedButtonMixin } from "../utils";
import { Panel } from "../general/Panel";
import { TwoColumns } from "../general/TwoColumns";
import useBaseUrl from "@docusaurus/useBaseUrl";

function OpenAITeaser() {

    const { colorMode } = useColorMode();
    const isDarkTheme = colorMode === "dark";

    return (
        <Panel color={"gray"}>

            <TwoColumns
                left={
                    <div>

                        <h1 className="text-4xl tracking-tight font-extrabold md:text-5xl">
                            <span>ChatGPT</span>
                            <span
                                className="text-primary">Integration</span>
                        </h1>
                        <div className="mt-3 text-xl sm:mt-4 md:text-2xl">
                            <p>
                                FireCMS with ChatGPT integration offers a
                                powerful
                                autofill
                                feature that can save you time and increase the
                                accuracy
                                of your data entry.
                            </p>
                            <p>
                                Sign up now and experience the power of the
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
                                Learn more
                            </a>

                            <a href={useBaseUrl("docs/openai/")}
                               className={CTAOutlinedButtonMixin + " sm:ml-4 ml-2"}>
                                Get started
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
                            className={"rounded-xl border border-solid dark:border-gray-800 border-gray-200"}
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
