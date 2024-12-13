import React from "react";

// @ts-ignore
import pricePreview from "@site/static/img/price.png";

import { useColorMode } from "@docusaurus/theme-common";

// @ts-ignore
import SyntaxHighlighter from "react-syntax-highlighter";
// @ts-ignore
import { dracula } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { arrowIcon } from "../icons";

import TickIcon from "@site/static/img/icons/check.svg";
import { TwoColumns } from "../general/TwoColumns";
import { Panel } from "../general/Panel";
import clsx from "clsx";
import { ContainerInnerPaddingMixin, defaultBorderMixin } from "../styles";
import { LinedSpace } from "../layout/LinedSpace";

export function DeveloperFeatures() {

    const { colorMode } = useColorMode();
    const isDarkTheme = colorMode === "dark";

    return (<>
            <Panel color={"gray"} includeMargin={false} includePadding={false}
                   header={<p
                       className={clsx("text-center text-secondary uppercase font-mono font-bold border-0 border-b", ContainerInnerPaddingMixin, defaultBorderMixin)}>
                       For developers
                   </p>}>


                <TwoColumns
                    reverseSmall={true}
                    animation={false}
                    className={"py-16"}
                    // className={"p-4 md:p-8"}
                    left={<div
                        className="relative flex-col font-mono overflow-x-hidden">

                        <SyntaxHighlighter
                            className={clsx("md:p-4 max-w-md sm:max-w-full overflow-y-hidden border border-solid", defaultBorderMixin)}
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
                    right={<>

                        <div
                            className={"flex items-center mb-3"}>
                            <h3 className="m-0">
                                Easy schema definition
                            </h3>

                        </div>

                        <p className="text-xl md:text-2xl ">
                            Define your schemas and choose from
                            multiple form widgets and validation
                            options.
                        </p>

                        <p className="text-xl md:text-2xl ">
                            Integrate your own conditional logic
                            for your fields, references to other
                            collections, markdown, file uploads, and dozens of other features.
                        </p>

                    </>}/>
            </Panel>

            <Panel color={"gray"} includeMargin={false} includePadding={false} >
                <TwoColumns
                    animation={false}
                    className={"py-16"}
                    // className={"p-4 md:p-8"}
                    left={
                        <div>
                            <div className={"flex items-center mb-3"}>

                                <h3 className="m-0">
                                    Built for every project
                                </h3>

                            </div>
                            <p className="text-xl md:text-2xl ">
                                FireCMS is a headless CMS built to work
                                with every existing project. It does not
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
                            className="relative flex-col font-mono overflow-x-hidden">
                            <SyntaxHighlighter
                                className={clsx("md:p-4 max-w-md sm:max-w-full overflow-y-hidden border border-solid", defaultBorderMixin)}
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
