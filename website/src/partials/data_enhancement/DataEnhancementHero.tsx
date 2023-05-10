import React from "react";

import { useColorMode } from "@docusaurus/theme-common";
import { CTAButtonMixin, CTACaret, CTAOutlinedButtonMixin } from "../utils";
import { TwoColumns } from "../general/TwoColumns";

export function DataEnhancementHero() {

    const { colorMode } = useColorMode();
    const isDarkTheme = colorMode === "dark";

    return <TwoColumns
        left={
            <div>

                <h1 className="text-4xl tracking-tight font-extrabold md:text-6xl">
                    <span className="block">ChatGPT</span>
                    <span
                        className="block text-primary">Integration</span>
                </h1>
                <div className="mt-3 text-xl sm:mt-4 md:text-2xl">
                    <p>
                        Discover the power of FireCMS with ChatGPT integration,
                        now available for you to try out for <b>FREE</b>! Experience a
                        game-changing autofill feature that not only saves you
                        time but also increases the accuracy of your data entry.
                    </p>
                    <p>
                        Sign up now and experience the power of the latest GPT
                        models to enhance your data entry and streamline your
                        business processes.
                    </p>
                </div>

                <div
                    className="mt-5 sm:mt-8">
                    <a href="/docs/openai"
                       rel="noopener noreferrer"
                       target="_blank"
                       className={CTAButtonMixin}>
                        Get started
                        <CTACaret/>
                    </a>

                    <p
                        className={"mt-4"}>
                        <a
                            className={" text-inherit"}
                            rel="noopener noreferrer"
                            target="_blank"
                            href={"https://app.firecms.co/subscriptions"}
                        >
                            Go to subscriptions management
                        </a>
                    </p>
                </div>
            </div>
        }
        right={<>

            <div
                style={{
                    flexDirection: "column",
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

                <a href="https://demo.firecms.co/c/books"
                   rel="noopener noreferrer"
                   target="_blank">
                    Check this demo online
                </a>
            </div>


        </>}/>;
}
