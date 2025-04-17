import React from "react";

// @ts-ignore
import schemaEditorVideo from "@site/static/img/schema_editor.webm";
// @ts-ignore
import editingDemoVideo from "@site/static/img/editing_demo.mp4";
// @ts-ignore
import editingDemoDarkVideo from "@site/static/img/editing_demo_dark.mp4";
// @ts-ignore
import customFieldDarkVideo from "@site/static/img/custom_fields_dark.mp4";
// @ts-ignore
import inlineEditingVideo from "@site/static/img/inline_table_editing.mp4";

import { useColorMode } from "@docusaurus/theme-common";
import { TwoColumns } from "../general/TwoColumns";
import { FeaturesCarousel } from "./FeaturesCarousel";
import { ContainerMixin, CTACaret, CTAOutlinedButtonMixin, defaultBorderMixin } from "../styles";
import clsx from "clsx";
import { Panel } from "../general/Panel";
import { UnbeatableUX } from "./UnbeatableUX";

function Features() {

    const { colorMode } = useColorMode();
    const isDarkTheme = colorMode === "dark";

    return (
        <>

            <Panel color={"light"}>
                <div className="max-w-6xl mx-auto text-center py-12 h-32">

                </div>
            </Panel>

            <Panel color={"lighter"}>
                <div
                    className={ContainerMixin + " -translate-y-44"}>
                    <video
                        style={{
                            pointerEvents: "none",
                        }}
                        className={"rounded-xl border " + defaultBorderMixin}
                        width="100%" loop autoPlay muted>
                        <source src={schemaEditorVideo} type="video/mp4"/>
                    </video>
                </div>

                {/*<div*/}
                {/*    className="max-w-5xl md:max-w-5xl md:w-full mx-auto md:col-span-9 md:pr-8 flex justify-center flex-col h-full mb-16">*/}
                {/*    <BrowserFrame>*/}
                {/*        <video*/}
                {/*            className={"pointer-events-none"}*/}
                {/*            width="100%" loop autoPlay muted>*/}
                {/*            <source src={inlineEditingVideo}*/}
                {/*                    type="video/mp4"/>*/}
                {/*        </video>*/}
                {/*    </BrowserFrame>*/}
                {/*</div>*/}

                <div
                    className={"mx-auto md:col-span-9 md:pr-8 flex justify-center flex-col h-full mb-8 -mt-24"}>
                    <div className={"flex items-center mb-3"}>

                        <h2 className="m-0 uppercase text-gray-700">
                            AirTable-like UI for your data
                        </h2>

                    </div>
                    <p className="text-xl md:text-2xl ">
                        FireCMS provides all the flexibility you
                        need with the best UX.
                        Edit your collections and entities using
                        both a <b>spreadsheet
                        view</b> and <b>powerful forms</b>.
                    </p>

                    <p className="text-xl ">
                        Inline editing is very useful when you want to
                        quickly edit a few fields of a
                        document. For example, if you have a list of users,
                        you can quickly edit the
                        name of the user by clicking on the name and editing
                        it.
                    </p>

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
            </Panel>


            <FeaturesCarousel/>

            <UnbeatableUX/>

            {/*<Panel color={"white"}>*/}
            {/*    <TwoColumns*/}
            {/*        reverseSmall={true}*/}
            {/*        right={*/}
            {/*            <div className={ContainerInnerPaddingMixin}>*/}

            {/*                <div className={"flex items-center mb-3 "}>*/}

            {/*                    <h3 className="m-0 ">*/}
            {/*                        Dedicated form view*/}
            {/*                    </h3>*/}

            {/*                </div>*/}

            {/*                <p className="text-xl md:text-2xl ">*/}
            {/*                    FireCMS offers more than 20 built-in property*/}
            {/*                    fields, from basic text fields to*/}
            {/*                    complex ones, like multiple file uploads, sortable*/}
            {/*                    arrays, references to*/}
            {/*                    other collections, etc.*/}
            {/*                </p>*/}

            {/*                <p className="text-xl ">*/}
            {/*                    The form view opens by default in a convenient side*/}
            {/*                    dialog that allows you*/}
            {/*                    to maintain the context you are working on, when you*/}
            {/*                    are done.*/}
            {/*                </p>*/}
            {/*                <p className="text-xl ">*/}
            {/*                    FireCMS is a React CMS, and it offers multiple*/}
            {/*                    extension points where you can*/}
            {/*                    define your custom views. Adding additional custom*/}
            {/*                    view to your form view*/}
            {/*                    can be really useful.*/}

            {/*                </p>*/}
            {/*            </div>*/}
            {/*        }*/}
            {/*        left={<div className={ContainerInnerPaddingMixin}>*/}
            {/*            <div className="relative flex flex-col">*/}
            {/*                <video*/}
            {/*                    key={`demo_video_${isDarkTheme}`}*/}
            {/*                    style={{*/}
            {/*                        maxWidth: 540,*/}
            {/*                        aspectRatio: 508 / 589*/}
            {/*                    }}*/}
            {/*                    className={clsx("pointer-events-none rounded-2xl border", defaultBorderMixin)}*/}
            {/*                    width="100%" loop autoPlay muted>*/}
            {/*                    <source*/}
            {/*                        src={isDarkTheme ? editingDemoDarkVideo : editingDemoVideo}*/}
            {/*                        type="video/mp4"/>*/}
            {/*                </video>*/}

            {/*            </div>*/}
            {/*        </div>}*/}
            {/*    />*/}
            {/*</Panel>*/}


            <Panel color={"lighter"}>
                <TwoColumns
                    reverseSmall={false}
                    right={<div>
                        <div className="relative flex flex-col">
                            <video
                                className={clsx("pointer-events-none rounded-2xl border", defaultBorderMixin)}
                                style={{
                                    maxWidth: 540,
                                    aspectRatio: 540 / 515
                                }}
                                width="100%" loop autoPlay muted>
                                <source
                                    src={customFieldDarkVideo}
                                    type="video/mp4"/>
                            </video>
                        </div>
                    </div>}
                    left={
                        <div>

                            <div
                                className={"flex items-center mb-3"}>

                                <h3 className="m-0 ">
                                    Easy to customise
                                </h3>

                            </div>

                            <p className="text-xl md:text-2xl ">
                                FireCMS offers an easy way to adapt the
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

                            <p className="text-xl ">
                                You could add:
                                <li> A <b>dashboard</b> for your client</li>
                                <li> A <b>preview</b> of the blog article you are
                                    writing
                                </li>
                                <li> A representation of how the content is
                                    going to look like in your <b>app or website</b>.
                                </li>
                                <li> And <b>anything</b> you can imagine.</li>
                            </p>

                        </div>
                    }
                />
            </Panel>
        </>
    );
}

export default Features;
