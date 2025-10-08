import React from "react";

// @ts-ignore
const settingsIcon = "/img/icons/settings.svg";
// @ts-ignore
const editingDemoVideo = "/img/editing_demo.mp4";
// @ts-ignore
const editingDemoDarkVideo = "/img/editing_demo_dark.mp4";
// @ts-ignore
const customFieldDarkVideo = "/img/custom_fields_dark.mp4";
import { useColorMode } from "@docusaurus/theme-common";

import { lightningIcon } from "../icons";
import { TwoColumns } from "../general/TwoColumns";
import { CTACaret, CTAOutlinedButtonMixin, defaultBorderMixin } from "../styles";
import clsx from "clsx";
import { Panel } from "../general/Panel";

function FeaturesTeaser() {

    const { colorMode } = useColorMode();
    const isDarkTheme = colorMode === "dark";

    return (<>
            <Panel color={"light"}>

                <TwoColumns
                    includeBorder={false}
                    left={
                        <div className={""}>
                            <div className={clsx("text-xl ")}>

                                <div className={"flex items-center mb-3"}>

                                    <h3 className="m-0 uppercase">
                                        Unmatched Editing Experience
                                    </h3>

                                </div>

                                <p className="text-xl md:text-2xl">
                                    FireCMS offers both flexibility and an excellent
                                    user experience. Edit your collections and
                                    entities
                                    using a user-friendly <b>spreadsheet view and
                                    effective
                                    forms</b>.
                                </p>

                            </div>

                            <a
                                className={CTAOutlinedButtonMixin + " w-fit"}
                                href="https://demo.firecms.co"
                                rel="noopener noreferrer"
                                target="_blank"
                            >
                                Try the demo
                                <CTACaret/>
                            </a>
                        </div>
                    }
                    right={<>
                        <div>
                            <video
                                key={`demo_video_${isDarkTheme}`}
                                style={{
                                    pointerEvents: "none",
                                    maxWidth: 540,
                                    aspectRatio: 508 / 589
                                }}
                                className={clsx("rounded-2xl border", defaultBorderMixin)}
                                width="100%" loop autoPlay muted>
                                <source
                                    src={isDarkTheme ? editingDemoDarkVideo : editingDemoVideo}
                                    type="video/mp4"/>
                            </video>

                        </div>
                    </>}
                />
            </Panel>
            <Panel color={"light"}>
                <TwoColumns
                    reverseSmall={true}
                    left={<>
                        <div className={clsx("flex justify-center")}>
                            <video
                                className={clsx("rounded-2xl border", defaultBorderMixin)}
                                style={{
                                    pointerEvents: "none",
                                    maxWidth: 540,
                                    aspectRatio: 538 / 513
                                }}
                                width="100%" loop autoPlay muted>
                                <source
                                    src={customFieldDarkVideo}
                                    type="video/mp4"/>
                            </video>
                        </div>
                    </>}
                    right={
                        <div>

                            <div
                                className={"flex items-center mb-3 "}>
                                <h3 className="m-0 uppercase">
                                    Flexible Customization
                                </h3>

                            </div>

                            <p className="text-xl md:text-2xl ">
                                FireCMS offers an easy way to adapt the
                                platform to their specific needs while keeping the <b>initial setup simple</b>. Our
                                practical defaults can be conveniently <b>overridden or expanded</b>.
                            </p>

                        </div>
                    }
                />

            </Panel>
        </>
    );
}

export default FeaturesTeaser;
