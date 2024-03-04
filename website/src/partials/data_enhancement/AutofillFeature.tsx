import React from "react";
import { TwoColumns } from "../general/TwoColumns";
import { useColorMode } from "@docusaurus/theme-common";

// @ts-ignore
import demoDark from "@site/static/img/data/product_demo_dark.mp4";
// @ts-ignore
import demoLight from "@site/static/img/data/product_demo_light.mp4";
import clsx from "clsx";
import { defaultBorderMixin } from "../styles";
import { Panel } from "../general/Panel";

export function AutofillFeature() {

    const { colorMode } = useColorMode();
    const isDarkTheme = colorMode === "dark";
    return (
        <Panel color={"lighter"}>
            <TwoColumns
                left={<>
                    <div
                        style={{
                            aspectRatio: 550 / 692,
                            maxHeight: "692px",
                            maxWidth: "550px"
                        }}
                        data-aos="fade-up"
                        className={" flex content-center justify-center items-center"}>
                        <video
                            key={isDarkTheme ? "dark" : "light"}
                            className={clsx("rounded-xl border border-solid", defaultBorderMixin)}
                            width="100%"
                            loop autoPlay muted>
                            <source
                                src={isDarkTheme ? demoDark : demoLight}
                                type="video/mp4"/>
                        </video>
                    </div>

                </>}
                right={<>
                    <h2 className={"h2 gradient-text uppercase"}>
                        Fill in Details for Nike Air Max 90
                    </h2>
                    <p className="text-xl">
                        Define a prompt to guide the autofill feature according to
                        your needs. Consider scenarios such as adding a <b>new
                        product</b> to your ecommerce store catalog.
                    </p>
                    <p className="text-xl">
                        ...or drafting a <b>compelling article</b>
                    </p>
                    <p className="text-xl">
                        ...or designing the curriculum of a <b>course</b>
                    </p>
                    <p className="text-xl">
                        ...or <b>any creative endeavor</b> you can imagine
                    </p>

                    <p className="text-base">
                        The ChatGPT plugin for FireCMS leverages OpenAI's
                        state-of-the-art GPT model to generate content that meets
                        your requirements. Feel free to edit the generated content
                        and save it to your database as needed.
                    </p>
                </>}/>
        </Panel>
    );
}
