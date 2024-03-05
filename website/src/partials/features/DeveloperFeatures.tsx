import React from "react";

// @ts-ignore
import pricePreview from "@site/static/img/price.png";

import { useColorMode } from "@docusaurus/theme-common";

// @ts-ignore
import SyntaxHighlighter from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { arrowIcon } from "../icons";

import TickIcon from "@site/static/img/icons/check.svg";
import { TwoColumns } from "../general/TwoColumns";
import { Panel } from "../general/Panel";
import clsx from "clsx";
import { ContainerInnerPaddingMixin, defaultBorderMixin } from "../styles";

export function DeveloperFeatures() {

    const { colorMode } = useColorMode();
    const isDarkTheme = colorMode === "dark";

    return (<>
            <Panel color={"gray"} includeMargin={false} includePadding={false}>

                <p className={clsx("text-center text-secondary uppercase font-mono font-bold border-0 border-b", ContainerInnerPaddingMixin, defaultBorderMixin)}>
                    For developers
                </p>

                <TwoColumns
                    reverseSmall={true}
                    animation={false}
                    className={"p-8"}
                    left={<div
                        className="relative flex-col font-mono">

                        <SyntaxHighlighter
                            className={clsx("p-4 max-w-xs overflow-x-auto sm:max-w-full overflow-y-hidden border border-solid", defaultBorderMixin)}
                            language={"typescript"}
                            showLineNumbers={false}
                            wrapLines={true}
                            style={dracula}
                        >
                            {
                                `const price = buildProperty({
    name: "Price",
    description: "Price with range validation",
    dataType: "number",
    validation: {
        required: true,
        requiredMessage: "Price must be between 0 and 1000",
        min: 0,
        max: 1000
    }
});`}
                        </SyntaxHighlighter>
                        <div
                            className={"p-1 flex justify-center"}>
                            <img loading="lazy"
                                 className=""
                                 src={pricePreview}
                                 width="500"
                                 alt="Element"
                            />
                        </div>
                    </div>
                    }
                    right={<div className="p-8">

                        <div
                            className={"flex items-center mb-3"}>

                            <div
                                className="flex items-center justify-center text-white w-10 h-10 gradient-bg rounded-full shadow flex-shrink-0 ">
                                {arrowIcon}
                            </div>
                            <h3 className="h3 m-0 ml-3 ">
                                Easy schema definition
                            </h3>

                        </div>

                        <p className="text-xl md:text-2xl ">
                            Define your schemas and choose from
                            multiple form widgets and validation
                            options.
                        </p>

                        <p className="text-xl md:text-2xl ">
                            Use advanced features like conditional logic
                            for your fields, references to other
                            collections, markdown or file uploads
                        </p>

                        <p className="text-xl ">
                            FireCMS provides a powerful schema
                            definition API that allows you to
                            customise your forms and views.
                        </p>
                        <p className="text-xl ">
                            You can also use the schema definition
                            API to create custom views and
                            components.
                        </p>

                    </div>
                    }/>
            </Panel>

            <Panel color={"gray"} includeMargin={false} includePadding={false}>
                <TwoColumns
                    animation={false}
                    className={"p-8"}
                    left={
                        <div>
                            <div className={"flex items-center mb-3"}>

                                <div
                                    className="flex items-center justify-center text-white w-10 h-10 gradient-bg rounded-full shadow flex-shrink-0 mr-3">
                                    <TickIcon/>
                                </div>

                                <h3 className="h3 m-0">
                                    Built for every project
                                </h3>

                            </div>
                            <p className="text-xl md:text-2xl ">
                                FireCMS is a headless CMS built to work
                                with every existing Firebase/Firestore
                                project. It does not
                                enforce any data structure.
                            </p>
                            <p className="text-xl md:text-2xl ">
                                Use the integrated hooks and callbacks to
                                integrate your business logic in multiple
                                ways.
                            </p>

                        </div>
                    } right={
                    <>
                        <div
                            className="relative flex-col font-mono">
                            <SyntaxHighlighter
                                className={clsx("p-4 max-w-xs overflow-x-auto sm:max-w-full overflow-y-hidden border border-solid", defaultBorderMixin)}
                                language={"typescript"}
                                showLineNumbers={false}
                                style={dracula}
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
        </>
    );
}
