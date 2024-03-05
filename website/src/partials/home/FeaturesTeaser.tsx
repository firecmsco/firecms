import React from "react";


import SettingsIcon from "@site/static/img/icons/settings.svg";

// @ts-ignore
import editingDemoVideo from "@site/static/img/editing_demo.mp4";
// @ts-ignore
import editingDemoDarkVideo from "@site/static/img/editing_demo_dark.mp4";
// @ts-ignore
import customFieldDarkVideo from "@site/static/img/custom_fields_dark.mp4";

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

                                    <div
                                        className="flex items-center justify-center text-white w-10 h-10 gradient-bg rounded-full shadow flex-shrink-0 mr-3">
                                        {lightningIcon}
                                    </div>

                                    <h3 className="h3 m-0 gradient-text uppercase">
                                        Advanced Editing Features
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

                                <p>
                                    FireCMS creates CRUD views based on your
                                    configurations with ease. It's simple to set up
                                    for
                                    common cases and just as easy to extend and
                                    customize to fit your specific needs.
                                </p>

                                <p>
                                    FireCMS imposes no data structure restrictions, allowing
                                    seamless integration with any project right from the start.
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
                                    maxWidth: 540,
                                    aspectRatio: 508 / 589
                                }}
                                className={clsx("rounded-xl border", defaultBorderMixin)}
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
                                className={clsx("rounded-xl border", defaultBorderMixin)}
                                style={{
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

                                <div
                                    className="flex items-center justify-center text-white w-10 h-10 gradient-bg rounded-full shadow flex-shrink-0 ">
                                    <SettingsIcon/>
                                </div>
                                <h3 className="h3 m-0 ml-3 gradient-text uppercase">
                                    Simple and Flexible Customization
                                </h3>

                            </div>

                            <p className="text-xl md:text-2xl ">
                                FireCMS offers developers an easy way to adapt the
                                platform to their specific needs while keeping the <b>initial setup simple</b>. Our
                                practical defaults can be conveniently <b>overridden or expanded</b>.
                            </p>
                            <p className="text-xl ">
                                Effortlessly integrate your custom form fields as
                                React components and preview widgets. Moreover, you
                                can create detailed views related to your entities
                                or within the main navigation for a truly customized
                                experience.
                            </p>

                        </div>
                    }
                />

            </Panel>
        </>
    );
}

export default FeaturesTeaser;
