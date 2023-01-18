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

// @ts-ignore
import editingDemoVideo from "@site/static/img/editing_demo.mp4";
// @ts-ignore
import editingDemoDarkVideo from "@site/static/img/editing_demo_dark.mp4";
// @ts-ignore
import customFieldVideo from "@site/static/img/custom_fields.mp4";
// @ts-ignore
import customFieldDarkVideo from "@site/static/img/custom_fields_dark.mp4";

import { useColorMode } from "@docusaurus/theme-common";
import { lightningIcon, settingsIcon } from "./icons";

function Features() {

    const { colorMode } = useColorMode();
    const isDarkTheme = colorMode === "dark";

    return (
        <section className="relative">

            {/*<h1 className={"max-w-6xl mx-auto mb-4"}>*/}
            {/*    Batteries included*/}
            {/*</h1>*/}
            <div className="relative mx-auto text-xl">


                <div className="p-4 max-w-6xl mx-auto my-16">

                    <div className="lg:grid lg:grid-cols-12 lg:gap-6">
                        <div
                            className="flex items-center max-w-xl lg:max-w-none lg:w-full mx-auto  lg:col-span-6 lg:mt-6"
                            data-aos="fade-right"
                        >
                            <div className="lg:pr-4 lg:pr-12 xl:pr-16 mb-8">

                                <div className={"flex items-center mb-3"}>

                                    <div
                                        className="flex items-center justify-center text-white w-8 h-8 bg-gray-800 rounded-full shadow flex-shrink-0 mr-3">
                                        {lightningIcon}
                                    </div>

                                    <h3 className="h3 m-0">
                                        Powerful editing
                                    </h3>

                                </div>

                                <p className="text-xl text-gray-600 dark:text-gray-200">
                                    FireCMS provides all the flexibility you
                                    need with the best UX.
                                    Edit your collections and entities using
                                    both a <b>spreadsheet
                                    view</b> and <b>powerful forms</b>.
                                </p>

                                <p className="text-base text-gray-600 dark:text-gray-200">
                                    Map your collections and document schemas to
                                    beautiful views generated automatically
                                </p>
                                <p className="text-base text-gray-600 dark:text-gray-200">
                                    FireCMS generates CRUD views based on your
                                    configuration. It is
                                    easy to set up for the straight forward
                                    cases and easy to
                                    extend and customise.
                                </p>
                            </div>

                        </div>


                        <div
                            className="max-w-xl lg:max-w-none lg:w-full mx-auto  lg:col-span-6 mb-8 lg:mb-0 lg:order-1"
                            data-aos="fade-left"
                        >
                            <div className="relative flex flex-col p-4">
                                <video
                                    key={`demo_video_${isDarkTheme}`}
                                    style={{
                                        maxHeight: 600,
                                        aspectRatio: 508 / 589
                                    }}
                                    className={"rounded-xl border border-solid dark:border-gray-800 border-gray-200 border-gray-200"}
                                    width="100%" loop autoPlay muted>
                                    <source
                                        src={isDarkTheme ? editingDemoDarkVideo : editingDemoVideo}
                                        type="video/mp4"/>
                                </video>

                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative max-w-6xl mx-auto p-4">

                <div
                    className="flex flex-col-reverse lg:grid lg:grid-cols-12 lg:gap-6">
                    <div
                        className="max-w-xl lg:max-w-none lg:w-full mx-auto  lg:col-span-6 lg:mt-6"
                        data-aos="fade-right"
                    >
                        <div className={" lg:pr-8"}>
                            <video
                                className={"rounded-xl border border-solid dark:border-gray-800 border-gray-200 border-gray-200"}
                                style={{
                                    maxHeight: 589,
                                    aspectRatio: 516 / 492
                                }}
                                width="100%" loop autoPlay muted>
                                <source
                                    src={isDarkTheme ? customFieldDarkVideo : customFieldVideo}
                                    type="video/mp4"/>
                            </video>
                        </div>

                    </div>

                    <div
                        className="flex items-center max-w-xl lg:max-w-none lg:w-full mx-auto lg:col-span-6 mb-8 lg:mb-0 lg:order-1"
                        data-aos="fade-left"
                        data-aos-delay="220"
                    >
                        <div className="lg:pr-4 lg:pr-12 xl:pr-16 mb-8">

                            <div
                                className={"flex items-center mb-3"}>

                                <div
                                    className="flex items-center justify-center text-white w-8 h-8 bg-gray-800 rounded-full shadow flex-shrink-0 ">
                                    {settingsIcon}
                                </div>
                                <h3 className="h3 m-0 ml-3 ">
                                    Easy to customise
                                </h3>

                            </div>

                            <p className="text-xl text-gray-600 dark:text-gray-200">
                                FireCMS allows developers to extend it
                                in any way they need, while
                                keeping it extremely simple to kickstart a
                                new project. We use <b>sensible defaults
                                that can be overridden or extended</b>.
                            </p>
                            <p className="text-xl text-gray-600 dark:text-gray-200">
                                Integrate your own custom form fields as
                                React components, as well as preview
                                widgets.
                                You can also define complete views related
                                to your entities or in the main navigation.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div
                className="relative bg-gray-200 dark:bg-gray-800 p-4 py-16 md:p-16 flex flex-col items mt-16">
                <div className={"max-w-6xl mx-auto"}>
                    <p className={"h2"}>
                        FireCMS is used by companies of all sizes
                    </p>
                    <p className={"text-xl"}>
                        It comes with a
                        set of features that will help you build your
                        application <strong>faster</strong>.
                    </p>
                    <p className={"text-base"}>
                        FireCMS allows users to
                        manage and publish content to their websites or
                        applications. But not only... it can be used
                        internally in teams to manage data and workflows.
                        With FireCMS, users can create and edit documents,
                        upload and manage media files, and manage users and
                        permissions.
                    </p>
                    <p className={"text-base"}>
                        FireCMS does not enforce any data structure on your
                        side,
                        and works out of the box with any project.
                    </p>
                </div>
            </div>

{/*            <div className="relative max-w-6xl mx-auto p-4">*/}
{/*                <div className="pt-12 lg:pt-20">*/}

{/*                    <div*/}
{/*                        className="flex flex-col-reverse lg:grid lg:grid-cols-12 lg:gap-6">*/}
{/*                        <div*/}
{/*                            className="max-w-xl lg:max-w-none lg:w-full mx-auto  lg:col-span-6 lg:mt-6 lg:pr-8"*/}
{/*                            data-aos="fade-right"*/}
{/*                            data-aos-delay="90"*/}
{/*                        >*/}

{/*                            <div*/}
{/*                                className="custom-code-block relative flex-col font-mono">*/}

{/*                                <SyntaxHighlighter*/}
{/*                                    className={"border border-solid dark:border-gray-800 border-gray-200"}*/}
{/*                                    language={"typescript"}*/}
{/*                                    showLineNumbers={false}*/}
{/*                                    style={isDarkTheme ? dracula : atomOneLight}*/}
{/*                                >*/}
{/*                                    {*/}
{/*                                        `const price = buildProperty({*/}
{/*    name: "Price",*/}
{/*    description: "Price with range validation",*/}
{/*    dataType: "number",*/}
{/*    validation: {*/}
{/*        required: true,*/}
{/*        requiredMessage:*/}
{/*         "You must set a price between 0 and 1000",*/}
{/*        min: 0,*/}
{/*        max: 1000*/}
{/*    }*/}
{/*});`}*/}
{/*                                </SyntaxHighlighter>*/}
{/*                                <div*/}
{/*                                    className={"p-1 flex justify-center"}>*/}
{/*                                    <img*/}
{/*                                        className=""*/}
{/*                                        src={pricePreview}*/}
{/*                                        width="500"*/}
{/*                                        alt="Element"*/}
{/*                                    />*/}
{/*                                </div>*/}
{/*                            </div>*/}


{/*                        </div>*/}

{/*                        <div*/}
{/*                            className="flex items-center max-w-xl lg:max-w-none lg:w-full mx-auto  lg:col-span-6 mb-8 lg:mb-0 lg:order-1"*/}
{/*                            data-aos="fade-left"*/}
{/*                            data-aos-delay="190"*/}
{/*                        >*/}
{/*                            <div className="lg:pr-4 lg:pr-12 xl:pr-16 mb-8">*/}

{/*                                <div*/}
{/*                                    className={"flex items-center mb-3"}>*/}

{/*                                    <div*/}
{/*                                        className="flex items-center justify-center text-white w-8 h-8 bg-gray-800 rounded-full shadow flex-shrink-0 ">*/}
{/*                                        {arrowIcon}*/}
{/*                                    </div>*/}
{/*                                    <h3 className="h3 m-0 ml-3 ">*/}
{/*                                        Easy schema definition*/}
{/*                                    </h3>*/}

{/*                                </div>*/}

{/*                                <p className="text-xl text-gray-600 dark:text-gray-200">*/}
{/*                                    Define your schemas and choose from*/}
{/*                                    multiple form widgets and validation*/}
{/*                                    options.*/}
{/*                                </p>*/}

{/*                                <p className="text-xl text-gray-600 dark:text-gray-200">*/}
{/*                                    Use advanced features like conditional logic*/}
{/*                                    for your fields, references to other*/}
{/*                                    collections, markdown or file uploads*/}
{/*                                </p>*/}

{/*                                <p className="text-base text-gray-600 dark:text-gray-200">*/}
{/*                                    FireCMS provides a powerful schema*/}
{/*                                    definition API that allows you to*/}
{/*                                    customise your forms and views.*/}
{/*                                </p>*/}
{/*                                <p className="text-base text-gray-600 dark:text-gray-200">*/}
{/*                                    You can also use the schema definition*/}
{/*                                    API to create custom views and*/}
{/*                                    components.*/}
{/*                                </p>*/}
{/*                                <p className="italic text-base text-gray-600 dark:text-gray-200">*/}
{/*                                    * Some features can only be enabled by*/}
{/*                                    using the self-hosted version, but will be*/}
{/*                                    available in the cloud version soon.*/}
{/*                                </p>*/}

{/*                            </div>*/}
{/*                        </div>*/}
{/*                    </div>*/}
{/*                </div>*/}
{/*            </div>*/}

{/*            <div className="relative max-w-6xl mx-auto p-4">*/}
{/*                <div className="pt-12 lg:pt-20">*/}

{/*                    <div className="lg:grid lg:grid-cols-12 lg:gap-6">*/}
{/*                        <div*/}
{/*                            className="flex items-center max-w-xl lg:max-w-none lg:w-full mx-auto  lg:col-span-6 lg:mt-6"*/}
{/*                            data-aos="fade-right"*/}
{/*                            data-aos-delay="120"*/}
{/*                        >*/}
{/*                            <div className="lg:pr-4 lg:pr-10 xl:pr-12 mb-8">*/}
{/*                                <div className={"flex items-center mb-3"}>*/}

{/*                                    <div*/}
{/*                                        className="flex items-center justify-center text-white w-8 h-8 bg-gray-800 rounded-full shadow flex-shrink-0 mr-3">*/}
{/*                                        {tickIcon}*/}
{/*                                    </div>*/}

{/*                                    <h3 className="h3 m-0">*/}
{/*                                        Built for every project*/}
{/*                                    </h3>*/}

{/*                                </div>*/}
{/*                                <p className="text-xl text-gray-600 dark:text-gray-200">*/}
{/*                                    FireCMS is a headless CMS built to work*/}
{/*                                    with every existing Firebase/Firestore*/}
{/*                                    project. It does not*/}
{/*                                    enforce any data structure.*/}
{/*                                </p>*/}
{/*                                <p className="text-xl text-gray-600 dark:text-gray-200">*/}
{/*                                    Use the integrated hooks and callbacks to*/}
{/*                                    integrate your business logic in multiple*/}
{/*                                    ways.*/}
{/*                                </p>*/}

{/*                                <p className="italic text-base text-gray-600 dark:text-gray-200">*/}
{/*                                    * Some features can only be enabled by*/}
{/*                                    using the self-hosted version, but will be*/}
{/*                                    available in the cloud version soon.*/}
{/*                                </p>*/}
{/*                            </div>*/}

{/*                        </div>*/}

{/*                        <div*/}
{/*                            className="max-w-xl lg:max-w-none lg:w-full mx-auto  lg:col-span-6 mb-8 lg:mb-0 lg:order-1"*/}
{/*                            data-aos="fade-left"*/}
{/*                            data-aos-delay="120"*/}
{/*                        >*/}
{/*                            <div*/}
{/*                                className="relative flex flex-col">*/}

{/*                                <div*/}
{/*                                    className="custom-code-block relative flex-col font-mono">*/}
{/*                                    <SyntaxHighlighter*/}
{/*                                        className={"border border-solid dark:border-gray-800 border-gray-200"}*/}
{/*                                        language={"typescript"}*/}
{/*                                        showLineNumbers={false}*/}
{/*                                        style={isDarkTheme ? dracula : atomOneLight}*/}
{/*                                    >*/}
{/*                                        {`const productCollection = buildCollection({*/}
{/*    name: "Product",*/}
{/*    properties: {*/}
{/*        name: {*/}
{/*            dataType: "string",*/}
{/*            name: "Name",*/}
{/*            defaultValue: "Default name"*/}
{/*        },*/}
{/*        uppercase: {*/}
{/*            dataType: "string",*/}
{/*            name: "Uppercase Name",*/}
{/*            readOnly: true*/}
{/*        }*/}
{/*    }*/}
{/*});*/}

{/*const productCallbacks = buildEntityCallbacks({*/}
{/*    onPreSave: ({ values }) => {*/}
{/*        values.uppercase = values.name.toUpperCase();*/}
{/*        return values;*/}
{/*    }*/}
{/*});`}*/}
{/*                                    </SyntaxHighlighter>*/}
{/*                                </div>*/}

{/*                            </div>*/}
{/*                        </div>*/}
{/*                    </div>*/}
{/*                </div>*/}
{/*            </div>*/}


        </section>
    );
}

export default Features;
