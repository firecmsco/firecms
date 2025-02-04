import React from "react";

// @ts-ignore
import pricePreview from "@site/static/img/price.png";

import { useColorMode } from "@docusaurus/theme-common";

// @ts-ignore
// import SyntaxHighlighter from "react-syntax-highlighter";
// @ts-ignore
// import { dracula } from "react-syntax-highlighter/dist/esm/styles/hljs";

import { TwoColumns } from "../general/TwoColumns";
import { Panel } from "../general/Panel";
import clsx from "clsx";
import { ContainerInnerPaddingMixin, defaultBorderMixin } from "../styles";

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
                    className={"py-16 p-4"}
                    // className={"p-4 md:p-8"}
                    left={<div
                        className="relative flex-col font-mono overflow-x-hidden">

                        <pre className={"bg-gray-900 mt-8 p-4 rounded"}
                             dangerouslySetInnerHTML={{ __html: priceCodeDemo }}></pre>

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
                    right={<div className={"p-4"}>

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

                    </div>}/>
            </Panel>

            <Panel color={"gray"} includeMargin={false} includePadding={false}>
                <TwoColumns
                    animation={false}
                    className={"py-16"}
                    // className={"p-4 md:p-8"}
                    left={
                        <div className={"p-4"}>
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

                        <pre className={"bg-gray-900 mt-8 p-4 rounded"}
                             dangerouslySetInnerHTML={{ __html: builtForEveryProjectCode }}></pre>

                            {/*                            <SyntaxHighlighter*/}
                            {/*                                className={clsx("md:p-4 max-w-md sm:max-w-full overflow-y-hidden border border-solid", defaultBorderMixin)}*/}
                            {/*                                language={"typescript"}*/}
                            {/*                                showLineNumbers={false}*/}
                            {/*                                style={dracula}*/}
                            {/*                            >*/}
                            {/*                                {`const productCollection = buildCollection({*/}
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
                            {/*    */}
                            {/*const productCallbacks = buildEntityCallbacks({*/}
                            {/*    onPreSave: ({ values }) => {*/}
                            {/*        values.uppercase = values.name.toUpperCase();*/}
                            {/*        return values;*/}
                            {/*    }*/}
                            {/*});`}*/}
                            {/*                            </SyntaxHighlighter>*/}
                        </div>
                    </>
                }/>


            </Panel>
        </>
    );
}

const priceCodeDemo = `<span class="token keyword">const</span> price <span class="token operator">=</span> <span class="token function">buildProperty</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
    <span class="token literal-property property">name</span><span class="token operator">:</span> <span class="token string">"Price"</span><span class="token punctuation">,</span>
    <span class="token literal-property property">description</span><span class="token operator">:</span> <span class="token string">"Price with range validation"</span><span class="token punctuation">,</span>
    <span class="token literal-property property">dataType</span><span class="token operator">:</span> <span class="token string">"number"</span><span class="token punctuation">,</span>
    <span class="token literal-property property">validation</span><span class="token operator">:</span> <span class="token punctuation">{</span>
        <span class="token literal-property property">required</span><span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>
        <span class="token literal-property property">requiredMessage</span><span class="token operator">:</span> <span class="token string">"Price must be between 0 and 1000"</span><span class="token punctuation">,</span>
        <span class="token literal-property property">min</span><span class="token operator">:</span> <span class="token number">0</span><span class="token punctuation">,</span>
        <span class="token literal-property property">max</span><span class="token operator">:</span> <span class="token number">1000</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>`
;

const builtForEveryProjectCode = `<span class="token keyword">const</span> productCollection <span class="token operator">=</span> <span class="token function">buildCollection</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
    <span class="token literal-property property">name</span><span class="token operator">:</span> <span class="token string">"Product"</span><span class="token punctuation">,</span>
    <span class="token literal-property property">properties</span><span class="token operator">:</span> <span class="token punctuation">{</span>
        <span class="token literal-property property">name</span><span class="token operator">:</span> <span class="token punctuation">{</span>
            <span class="token literal-property property">dataType</span><span class="token operator">:</span> <span class="token string">"string"</span><span class="token punctuation">,</span>
            <span class="token literal-property property">name</span><span class="token operator">:</span> <span class="token string">"Name"</span><span class="token punctuation">,</span>
            <span class="token literal-property property">defaultValue</span><span class="token operator">:</span> <span class="token string">"Default name"</span>
        <span class="token punctuation">}</span><span class="token punctuation">,</span>
        <span class="token literal-property property">uppercase</span><span class="token operator">:</span> <span class="token punctuation">{</span>
            <span class="token literal-property property">dataType</span><span class="token operator">:</span> <span class="token string">"string"</span><span class="token punctuation">,</span>
            <span class="token literal-property property">name</span><span class="token operator">:</span> <span class="token string">"Uppercase Name"</span><span class="token punctuation">,</span>
            <span class="token literal-property property">readOnly</span><span class="token operator">:</span> <span class="token boolean">true</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    
<span class="token keyword">const</span> productCallbacks <span class="token operator">=</span> <span class="token function">buildEntityCallbacks</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
    <span class="token function-variable function">onPreSave</span><span class="token operator">:</span> <span class="token punctuation">(</span><span class="token parameter"><span class="token punctuation">{</span> values <span class="token punctuation">}</span></span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">{</span>
        values<span class="token punctuation">.</span>uppercase <span class="token operator">=</span> values<span class="token punctuation">.</span>name<span class="token punctuation">.</span><span class="token function">toUpperCase</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">return</span> values<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>`;
