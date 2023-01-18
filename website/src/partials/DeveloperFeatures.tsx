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

import SyntaxHighlighter from "react-syntax-highlighter";
import {
    atomOneLight,
    dracula
} from "react-syntax-highlighter/dist/esm/styles/hljs";
import { arrowIcon, tickIcon } from "./icons";

export function DeveloperFeatures() {

    const { colorMode } = useColorMode();
    const isDarkTheme = colorMode === "dark";

    return (
        <section className="relative">

            <div className="relative max-w-6xl mx-auto">
                <div className="pt-12">

                    <div
                        className="flex flex-col-reverse ">
                        <div
                            className="max-w-xl md:max-w-none md:w-full mx-auto md:col-span-7 lg:col-span-6 md:mt-6"
                        >

                            <div
                                className="custom-code-block relative flex-col font-mono">

                                <SyntaxHighlighter
                                    className={"border border-solid dark:border-gray-800 border-gray-200"}
                                    language={"typescript"}
                                    showLineNumbers={false}
                                    style={isDarkTheme ? dracula : atomOneLight}
                                >
                                    {
                                        `const price = buildProperty({
    name: "Price",
    description: "Price with range validation",
    dataType: "number",
    validation: {
        required: true,
        requiredMessage:
         "You must set a price between 0 and 1000",
        min: 0,
        max: 1000
    }
});`}
                                </SyntaxHighlighter>
                                <div
                                    className={"p-1 flex justify-center"}>
                                    <img
                                        className=""
                                        src={pricePreview}
                                        width="500"
                                        alt="Element"
                                    />
                                </div>
                            </div>


                        </div>

                        <div
                            className="flex items-center max-w-xl md:max-w-none md:w-full mx-auto md:col-span-5 lg:col-span-6 mb-8 md:mb-0 md:order-1"
                        >
                            <div className="md:pr-4 lg:pr-12 xl:pr-16 mb-8">

                                <div
                                    className={"flex items-center mb-3"}>

                                    <h3 className="h3 m-0 mr-3 ">
                                        Easy schema definition
                                    </h3>

                                    <div
                                        className="flex items-center justify-center text-white w-8 h-8 bg-gray-800 rounded-full shadow flex-shrink-0 ">
                                        {arrowIcon}
                                    </div>
                                </div>

                                <p className="text-xl text-gray-600 dark:text-gray-200">
                                    Define your schemas and choose from
                                    multiple form widgets and validation
                                    options.
                                </p>

                                <p className="text-xl text-gray-600 dark:text-gray-200">
                                    Use advanced features like conditional logic
                                    for your fields, references to other
                                    collections, markdown or file uploads
                                </p>

                                <p className="text-base text-gray-600 dark:text-gray-200">
                                    FireCMS provides a powerful schema
                                    definition API that allows you to
                                    customise your forms and views.
                                </p>
                                <p className="text-base text-gray-600 dark:text-gray-200">
                                    You can also use the schema definition
                                    API to create custom views and
                                    components.
                                </p>

                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative max-w-6xl mx-auto">
                <div className="pt-12">

                    <div className="">
                        <div
                            className="flex items-center max-w-xl md:max-w-none md:w-full mx-auto md:col-span-7 lg:col-span-6 md:mt-6"
                        >
                            <div className="md:pr-4 lg:pr-10 xl:pr-12 mb-8">
                                <div className={"flex items-center mb-3"}>

                                    <div
                                        className="flex items-center justify-center text-white w-8 h-8 bg-gray-800 rounded-full shadow flex-shrink-0 mr-3">
                                        {tickIcon}
                                    </div>

                                    <h3 className="h3 m-0">
                                        Built for every project
                                    </h3>

                                </div>
                                <p className="text-xl text-gray-600 dark:text-gray-200">
                                    FireCMS is a headless CMS built to work
                                    with every existing Firebase/Firestore
                                    project. It does not
                                    enforce any data structure.
                                </p>
                                <p className="text-xl text-gray-600 dark:text-gray-200">
                                    Use the integrated hooks and callbacks to
                                    integrate your business logic in multiple
                                    ways.
                                </p>
                            </div>

                        </div>

                        <div
                            className="max-w-xl md:max-w-none md:w-full mx-auto md:col-span-5 lg:col-span-6 mb-8 md:mb-0 md:order-1"
                        >
                            <div
                                className="relative flex flex-col">

                                <div
                                    className="custom-code-block relative flex-col font-mono">
                                    <SyntaxHighlighter
                                        className={"border border-solid dark:border-gray-800 border-gray-200"}
                                        language={"typescript"}
                                        showLineNumbers={false}
                                        style={isDarkTheme ? dracula : atomOneLight}
                                    >
                                        {`const productCollection = buildCollection({
    name: "Product",
    properties: {
        name: {
            dataType: "string",
            name: "Name",
            defaultValue: "Default name"
        },
        uppercase: {
            dataType: "string",
            name: "Uppercase Name",
            readOnly: true
        }
    }
});

const productCallbacks = buildEntityCallbacks({
    onPreSave: ({ values }) => {
        values.uppercase = values.name.toUpperCase();
        return values;
    }
});`}
                                    </SyntaxHighlighter>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>


        </section>
    );
}
