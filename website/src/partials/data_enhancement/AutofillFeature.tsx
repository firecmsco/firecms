import React from "react";
import { BrowserFrame } from "../BrowserFrame";
import { TwoColumns } from "../general/TwoColumns";
import { useColorMode } from "@docusaurus/theme-common";

// @ts-ignore
import demoDark from "@site/static/img/data/product_demo_dark.mp4";
// @ts-ignore
import demoLight from "@site/static/img/data/product_demo_light.mp4";

export function AutofillFeature() {

    const { colorMode } = useColorMode();
    const isDarkTheme = colorMode === "dark";
    return (
        <TwoColumns
            left={<>
                <div
                    style={{
                        aspectRatio: 550 / 750,
                        maxHeight: "750px",
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
                            src={isDarkTheme ? demoDark : demoLight}
                            type="video/mp4"/>
                    </video>
                </div>

            </>}
            right={<>
                <h2 className={"h2"}>Fill in the details of the Nike Air Max
                    270 </h2>
                <p className="text-xl text-gray-600 dark:text-gray-200">
                    Use a prompt to indicate how you would like the autofill
                    feature to work. Imagine you have an ecommerce store and
                    you want to add a new product to your catalog.
                </p>
                <p>
                    ...or you are writing an article
                </p>
                <p>
                    ...or creating a course on Sustainability
                </p>
                <p>
                    ...or anything you can think of
                </p>

                <p className="text-base text-gray-600 dark:text-gray-200">
                    The OpenAI plugin for FireCMS will use the latest GPT model
                    from OpenAI to generate the content for you. You can then
                    edit the generated content and save it to your database.
                </p>
            </>}/>
    );
}
