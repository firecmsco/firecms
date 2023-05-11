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
import DashboardIcon from "@site/static/img/icons/dashboard.svg";
import LightingIcon from "@site/static/img/icons/lighting.svg";

// @ts-ignore
import editingDemoVideo from "@site/static/img/editing_demo.mp4";
// @ts-ignore
import editingDemoDarkVideo from "@site/static/img/editing_demo_dark.mp4";
// @ts-ignore
import customFieldVideo from "@site/static/img/custom_fields.mp4";
// @ts-ignore
import inlineEditingVideo from "@site/static/img/inline_table_editing.mp4";
// @ts-ignore
import customFieldDarkVideo from "@site/static/img/custom_fields_dark.mp4";

import { useColorMode } from "@docusaurus/theme-common";
import { TwoColumns } from "../general/TwoColumns";
import { ContainerMixin, ContainerSmallMixin } from "../utils";
import { BrowserFrame } from "../BrowserFrame";

function Features() {

    const { colorMode } = useColorMode();
    const isDarkTheme = colorMode === "dark";

    return (
        <>


            <section className={"relative mx-auto p-4 md:p-8 my-16 max-w-5xl"}>

                <div
                    className="max-w-5xl md:max-w-5xl md:w-full mx-auto md:col-span-9 md:pr-4 md:pr-8 flex justify-center flex-col h-full mb-16"
                >
                    <BrowserFrame>
                        <video
                            width="100%" loop autoPlay muted>
                            <source src={inlineEditingVideo}
                                    type="video/mp4"/>
                        </video>
                    </BrowserFrame>
                </div>

                <div className={"flex items-center mb-3 max-w-5xl"}>

                    <div
                        className="flex items-center justify-center text-white w-10 h-10 bg-gray-800 rounded-full shadow flex-shrink-0 mr-3">
                        <LightingIcon height={12} width={12}/>
                    </div>

                    <h3 className="h3 m-0">
                        Inline editing
                    </h3>

                </div>

                <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-200">
                    FireCMS provides all the flexibility you
                    need with the best UX.
                    Edit your collections and entities using
                    both a <b>spreadsheet
                    view</b> and <b>powerful forms</b>.
                </p>

                <p className="text-xl text-gray-600 dark:text-gray-200">
                    Inline editing is very useful when you want to
                    quickly edit a few fields of a
                    document. For example, if you have a list of users,
                    you can quickly edit the
                    name of the user by clicking on the name and editing
                    it.
                </p>
            </section>
            <TwoColumns
                reverseSmall={true}
                right={
                    <>

                        <div className={"flex items-center mb-3 "}>

                            <div
                                className="flex items-center justify-center text-white w-10 h-10 bg-gray-800 rounded-full shadow flex-shrink-0 mr-3">
                                <DashboardIcon height={24} width={24}/>
                            </div>

                            <h3 className="h3 m-0">
                                Dedicated form view
                            </h3>

                        </div>

                        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-200">
                            FireCMS offers more than 20 built-in property
                            fields, from basic text fields to
                            complex ones, like multiple file uploads, sortable
                            arrays, references to
                            other collections, etc.
                        </p>

                        <p className="text-xl text-gray-600 dark:text-gray-200">
                            The form view opens by default in a convenient side
                            dialog that allows you
                            to maintain the context you are working on, when you
                            are done.
                        </p>
                        <p className="text-xl text-gray-600 dark:text-gray-200">
                            FireCMS is a React CMS, and it offers multiple
                            extension points where you can
                            define your custom views. Adding additional custom
                            view to your form view
                            can be really useful.

                        </p>
                    </>
                }
                left={<>
                    <div className="relative flex flex-col">
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
                reverseSmall={false}
                right={<>
                    <div className="relative flex flex-col">
                        <video
                            className={"rounded-xl border border-solid dark:border-gray-800 border-gray-200 border-gray-200"}
                            style={{
                                maxWidth: 540,
                                aspectRatio: 540 / 515
                            }}
                            width="100%" loop autoPlay muted>
                            <source
                                src={isDarkTheme ? customFieldDarkVideo : customFieldVideo}
                                type="video/mp4"/>
                        </video>
                    </div>
                </>}
                left={
                    <>

                        <div
                            className={"flex items-center mb-3"}>

                            <div
                                className="flex items-center justify-center text-white w-10 h-10 bg-gray-800 rounded-full shadow flex-shrink-0 ">
                                <SettingsIcon/>
                            </div>
                            <h3 className="h3 m-0 ml-3 ">
                                Easy to customise
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

                        <p className="text-xl text-gray-600 dark:text-gray-200">
                            You could add:
                            <li> A dashboard for your client</li>
                            <li> A preview of the blog article you are
                                writing
                            </li>
                            <li> A representation of how the content is
                                going to look like in your app or website.
                            </li>
                            <li> And everything you can imagine.</li>
                        </p>

                    </>
                }
            />
        </>
    );
}

export default Features;
