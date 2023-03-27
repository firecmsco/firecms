import React from "react";
import { BrowserFrame } from "../BrowserFrame";
import { TwoColumns } from "../general/TwoColumns";
import { useColorMode } from "@docusaurus/theme-common";

export function AutofillFeature() {

    const { colorMode } = useColorMode();
    const isDarkTheme = colorMode === "dark";
    return (
        <TwoColumns
            left={<>

                <p className="text-xl text-gray-600 dark:text-gray-200">
                    Our FireCMS OpenAI plugin includes an autofill feature that saves time and
                    increases accuracy.
                </p>

                <p className="text-base text-gray-600 dark:text-gray-200">
                    With the autofill feature, you can quickly fill in
                    repetitive or frequently used information, such as your
                    name, address, or email address, with just a few clicks or
                    taps. This helps to reduce errors and typos and saves you
                    time when filling out forms or submitting information.
                </p>
            </>}
            right={<>

                <div
                    style={{
                        aspectRatio: 550 / 750,
                        maxHeight: "750px",
                        maxWidth: "550px"
                    }}
                    data-aos="fade-up"
                    className={" flex content-center justify-center"}>
                    <video
                        className={"rounded-xl border border-solid dark:border-gray-800 border-gray-200"}
                        width="100%"
                        loop autoPlay muted>
                        <source
                            src={isDarkTheme ? "/img/data/data_enhancement_dark.mp4" : "/img/data/data_enhancement_light.mp4"}
                            type="video/mp4"/>
                    </video>
                </div>

                {/*<video*/}
                {/*    className={"rounded-xl border border-solid dark:border-gray-800 border-gray-200 border-gray-200"}*/}
                {/*    style={{*/}
                {/*        aspectRatio: 750 / 551,*/}
                {/*        minHeight: "700px",*/}
                {/*        // height: "750px",*/}
                {/*        maxWidth: "100%"*/}
                {/*    }}*/}
                {/*    width="100%" loop autoPlay muted>*/}
                {/*    <source*/}
                {/*        src={isDarkTheme ? "/img/data/data_enhancement_dark.mp4": "/img/data/data_enhancement_light.mp4"}*/}
                {/*        type="video/mp4"/>*/}
                {/*</video>*/}
            </>}/>
    );
}
