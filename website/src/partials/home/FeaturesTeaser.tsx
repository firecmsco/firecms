import React from "react";

// @ts-ignore
import featuresBg from "@site/static/img/features-bg.png";
// @ts-ignore
import featuresElement from "@site/static/img/features-element.png";

// @ts-ignore
import ReactLogo from "@site/static/img/reactjs-icon.svg";
// @ts-ignore
import FireCMSLogo from "@site/static/img/firecms_logo.svg";
// @ts-ignore
import FirebaseLogo from "@site/static/img/firebase.svg";
// @ts-ignore
import pricePreview from "@site/static/img/price.png";

import SettingsIcon from "@site/static/img/icons/settings.svg";

// @ts-ignore
import editingDemoVideo from "@site/static/img/editing_demo.mp4";
// @ts-ignore
import editingDemoDarkVideo from "@site/static/img/editing_demo_dark.mp4";
// @ts-ignore
import customFieldVideo from "@site/static/img/custom_fields.mp4";
// @ts-ignore
import customFieldDarkVideo from "@site/static/img/custom_fields_dark.mp4";

import { useColorMode } from "@docusaurus/theme-common";
import { lightningIcon } from "../icons";
import { TwoColumns } from "../general/TwoColumns";

function FeaturesTeaser() {

    const { colorMode } = useColorMode();
    const isDarkTheme = colorMode === "dark";

    return (
        <section className="relative">

            <TwoColumns
                left={
                    <div className={"text-xl"}>

                        <div className={"flex items-center mb-3 "}>

                            <div
                                className="flex items-center justify-center text-white w-10 h-10 bg-gray-800 rounded-full shadow flex-shrink-0 mr-3">
                                {lightningIcon}
                            </div>

                            <h3 className="h3 m-0">
                                Advanced Editing Features
                            </h3>

                        </div>

                        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-200">
                            FireCMS offers both flexibility and an excellent
                            user experience. Edit your collections and entities
                            using a user-friendly <b>spreadsheet view and
                            effective
                            forms</b>.
                        </p>

                        <p className="text-gray-600 dark:text-gray-200">
                            Generate Attractive Views from Your Schemas
                            Automatically
                        </p>
                        <p className="text-gray-600 dark:text-gray-200">
                            FireCMS creates CRUD views based on your
                            configurations with ease. It's simple to set up for
                            common cases and just as easy to extend and
                            customize to fit your specific needs.
                        </p>
                    </div>
                }
                right={<>
                    <div className="relative flex flex-col p-4">
                        <video
                            key={`demo_video_${isDarkTheme}`}
                            style={{
                                maxWidth: 540,
                                aspectRatio: 508 / 589
                            }}
                            className={"rounded-xl border border-solid dark:border-gray-800 border-gray-200 border-gray-200"}
                            width="100%" loop autoPlay muted>
                            <source
                                src={isDarkTheme ? editingDemoDarkVideo : editingDemoVideo}
                                type="video/mp4"/>
                        </video>

                    </div>
                </>}
            />

            <TwoColumns
                reverseSmall={true}
                left={<>
                    <div className="relative flex flex-col p-4">
                        <video
                            className={"rounded-xl border border-solid dark:border-gray-800 border-gray-200 border-gray-200"}
                            style={{
                                maxWidth: 540,
                                aspectRatio: 538 / 592
                            }}
                            width="100%" loop autoPlay muted>
                            <source
                                src={isDarkTheme ? customFieldDarkVideo : customFieldVideo}
                                type="video/mp4"/>
                        </video>
                    </div>
                </>}
                right={
                    <>

                        <div
                            className={"flex items-center mb-3"}>

                            <div
                                className="flex items-center justify-center text-white w-10 h-10 bg-gray-800 rounded-full shadow flex-shrink-0 ">
                                <SettingsIcon/>
                            </div>
                            <h3 className="h3 m-0 ml-3 ">
                                Simple and Flexible Customization
                            </h3>

                        </div>

                        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-200">
                            FireCMS offers developers an easy way to adapt the
                            platform to their specific needs while keeping the
                            <b>initial setup simple</b>. Our practical defaults
                            can be
                            conveniently <b>overridden or expanded</b>.
                        </p>
                        <p className="text-xl text-gray-600 dark:text-gray-200">
                            Effortlessly integrate your custom form fields as
                            React components and preview widgets. Moreover, you
                            can create detailed views related to your entities
                            or within the main navigation for a truly customized
                            experience.
                        </p>

                    </>
                }
            />

        </section>
    );
}

export default FeaturesTeaser;
