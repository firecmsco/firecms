import React from "react";

// @ts-ignore
import featuresBg from "@site/static/img/features-bg.png";
// @ts-ignore
import featuresElement from "@site/static/img/features-element.png";

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
import { arrowIcon } from "../icons";

import TickIcon from "@site/static/img/icons/check.svg";
import { TwoColumns } from "../general/TwoColumns";
import { Panel } from "../general/Panel";

export function DeveloperFeatures() {

    const { colorMode } = useColorMode();
    const isDarkTheme = colorMode === "dark";

    return (
        <Panel color={"gray"} includeMargin={false}>

            <p className="text-center text-secondary uppercase font-bold ">
                For developers
            </p>

            <TwoColumns
                reverseSmall={true}
                animation={false}
                left={<div
                    className=" relative flex-col font-mono">

                    <SyntaxHighlighter
                        className={"max-w-xs overflow-x-auto sm:max-w-full overflow-y-hidden border border-solid dark:border-gray-800 border-gray-200"}
                        language={"typescript"}
                        showLineNumbers={false}
                        wrapLines={true}
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
                }
                right={<div className="lg:pr-4 lg:pr-12 xl:pr-16">

                    <div
                        className={"flex items-center mb-3"}>

                        <div
                            className="flex items-center justify-center text-white w-10 h-10 bg-gray-800 rounded-full shadow flex-shrink-0 ">
                            {arrowIcon}
                        </div>
                        <h3 className="h3 m-0 ml-3 ">
                            Easy schema definition
                        </h3>

                    </div>

                    <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-200">
                        Define your schemas and choose from
                        multiple form widgets and validation
                        options.
                    </p>

                    <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-200">
                        Use advanced features like conditional logic
                        for your fields, references to other
                        collections, markdown or file uploads
                    </p>

                    <p className="text-xl text-gray-600 dark:text-gray-200">
                        FireCMS provides a powerful schema
                        definition API that allows you to
                        customise your forms and views.
                    </p>
                    <p className="text-xl text-gray-600 dark:text-gray-200">
                        You can also use the schema definition
                        API to create custom views and
                        components.
                    </p>
                    <p className="italic text-base text-gray-600 dark:text-gray-200">
                        * Some features can only be enabled by
                        using the self-hosted version, but will be
                        available in FireCMS Cloud version soon.
                    </p>

                </div>
                }/>

            <TwoColumns
                animation={false}
                left={
                    <>
                        <div className={"flex items-center mb-3"}>

                            <div
                                className="flex items-center justify-center text-white w-10 h-10 bg-gray-800 rounded-full shadow flex-shrink-0 mr-3">
                                <TickIcon/>
                            </div>

                            <h3 className="h3 m-0">
                                Built for every project
                            </h3>

                        </div>
                        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-200">
                            FireCMS is a headless CMS built to work
                            with every existing Firebase/Firestore
                            project. It does not
                            enforce any data structure.
                        </p>
                        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-200">
                            Use the integrated hooks and callbacks to
                            integrate your business logic in multiple
                            ways.
                        </p>

                        <p className="italic text-base text-gray-600 dark:text-gray-200">
                            * Some features can only be enabled by
                            using the self-hosted version, but will be
                            available in the FireCMS Cloud version soon.
                        </p>
                    </>
                } right={
                <>
                    <div
                        className="relative flex-col font-mono">
                        <SyntaxHighlighter
                            className={"max-w-xs overflow-x-auto sm:max-w-full overflow-y-hidden border border-solid dark:border-gray-800 border-gray-200"}
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
                </>
            }/>


        </Panel>
    );
}
