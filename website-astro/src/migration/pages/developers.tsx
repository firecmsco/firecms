import React from "react";
// import Layout from "@theme/Layout";
import Layout from "../components/Layout.tsx";
// import Head from "@docusaurus/Head";
import { Hero } from "../partials/general/Hero";
import { Panel } from "../partials/general/Panel";
import { TwoColumns } from "../partials/general/TwoColumns";
import { UITeaser } from "../partials/home/UITeaser";
import { EnterpriseArchitectures } from "../partials/enterprise/EnterpriseArchitectures";

// @ts-ignore
import { StartHacking } from "../partials/home/StartHacking";
import { defaultBorderMixin } from "../partials/styles";
import { TechSplash } from "../partials/home/TechSplash";
import { CustomFields } from "../partials/features/CustomFields";
import { DataTalkBatch } from "../partials/home/DataTalkBatch";
import SimpleCodeBlock from "../components/SimpleCodeBlock";

function DevelopersPage() {
    return (
        <Layout
            title={"For Developers - FireCMS"}
            description="FireCMS helps developers rapidly build internal tools, CRUD interfaces, and back-offices without the frontend hassle">
            {/* Head meta removed */}
            <div className="flex flex-col min-h-screen">
                <main className="flex-grow">
                    <Hero
                        subtitleColor={"dark_gray"}
                        title={
                            <>
                                <span className="block lg:inline font-mono uppercase">FireCMS for Developers</span>

                            </>
                        }
                        subtitle={
                            <>
                                <p>
                                    Build powerful internal tools, CRUD interfaces, amazing GUIs and back-offices
                                    <b> without the frontend hassle</b>. Focus on your core application logic.
                                </p>
                                <iframe
                                    src="https://ghbtns.com/github-btn.html?user=firecmsco&repo=firecms&type=star&count=true&size=large"
                                    frameBorder="0"
                                    scrolling="0"
                                    width="170"
                                    height="30" title="GitHub"></iframe>

                                {/*<a href="https://github.com/firecmsco/firecms" target="_blank"*/}
                                {/*   rel="noopener noreferrer">*/}

                                {/*    <img src="https://img.shields.io/github/stars/firecmsco/firecms?style=social"*/}
                                {/*         alt="GitHub Stars"*/}
                                {/*         style={{ height: "40px;" }}/>*/}
                                {/*</a>*/}
                            </>
                        }
                    />

                    <Panel color={"dark_gray"} includeMargin={false} includePadding={false}>

                        <TwoColumns
                            reverseSmall={true}
                            animation={false}
                            className={"py-8 p-4"}
                            // className={"p-4 md:p-8"}
                            left={<div
                                className="relative flex-col font-mono overflow-x-hidden">

                        <pre className={"bg-gray-900 mt-8 p-4 rounded"}
                             dangerouslySetInnerHTML={{ __html: priceCodeDemo }}></pre>

                                <div
                                    className={"p-1 flex justify-center"}>
                                    <img loading="lazy"
                                         className=""
                                         src="/img/price.png"
                                         width="500"
                                         alt="Price textfield preview"
                                    />
                                </div>
                            </div>
                            }
                            right={<div className={"p-4"}>

                                <div
                                    className={"flex items-center mb-3"}>
                                    <h3 className="m-0 font-mono uppercase">
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

                    <UITeaser/>

                    <Panel color={"gray"} includeMargin={false} includePadding={false}>
                        <TwoColumns
                            animation={false}
                            className={"py-8"}
                            // className={"p-4 md:p-8"}
                            left={
                                <div className={"p-4"}>
                                    <div className={"flex items-center mb-3"}>

                                        <h3 className="m-0 font-mono uppercase">
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

                                </div>
                            </>
                        }/>

                    </Panel>

                    <Panel color={"dark_gray"} includePadding={true}>
                        <div className="max-w-5xl mx-auto">
                            <h2 className="text-3xl font-bold mb-8 text-center">Why Developers Choose FireCMS</h2>
                            <div className="grid md:grid-cols-2 gap-8 mb-12">
                                <div className="p-6 rounded-xl border border-gray-700 bg-gray-800">
                                    <h3 className="text-xl font-mono uppercase mb-3">Type-Safe Schema
                                        Definitions</h3>
                                    <p className="text-gray-300 leading-relaxed mb-4">
                                        Define your data models in TypeScript for complete type safety. Your schemas
                                        become the single source of truth for both your admin panel and application.
                                    </p>
                                    <SimpleCodeBlock language="typescript" code={`const productsCollection = buildCollection({
    name: "Products",
    path: "products",
    properties: {
      name: {
        dataType: "string",
        name: "Name",
        validation: { required: true }
      },
      price: {
        dataType: "number",
        name: "Price",
        validation: { required: true, min: 0 }
      },
      // other properties...
    }
});`} />
                                </div>
                                <div className="p-6 rounded-xl border border-gray-700 bg-gray-800">
                                    <h3 className="text-xl font-mono uppercase mb-3">Real-time Data Updates</h3>
                                    <p className="text-gray-300 leading-relaxed mb-4">
                                        FireCMS leverages Firestore&#39;s real-time capabilities. Any changes to your
                                        data
                                        are immediately reflected in the CMS without extra configuration.
                                    </p>
                                    <SimpleCodeBlock language="typescript" code={`import { useCollectionFetch } from "@firecms/core";

function MyComponent() {
    const { data, loading, error } = useCollectionFetch("products");

    // data is automatically updated when changes occur in Firestore
    return (
      <div>
        {data && data.map(product => (
          <div key={product.id}>{product.name}</div>
        ))}
      </div>
    );
}`} />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="p-6 rounded-xl border border-gray-700 bg-gray-800">
                                    <h3 className="text-xl font-mono uppercase mb-3">Custom React Components</h3>
                                    <p className="text-gray-300 leading-relaxed mb-4">
                                        Extend the CMS with your own React components. Create custom property fields,
                                        entity views,
                                        or navigation items that perfectly fit your project needs.
                                    </p>
                                    <SimpleCodeBlock language="typescript" code={`const PriceField = ({ property, value, setValue }) => {
    return (
      <div className="custom-price-field">
        <input
          type="number"
          value={value || ""}
          onChange={(e) => setValue(Number(e.target.value))}
          min={0}
        />
        <span className="currency">$</span>
      </div>
    );
};

// Use in your schema
const productsCollection = buildCollection({
    // ...
    properties: {
      price: {
        dataType: "number",
        name: "Price",
        Field: PriceField
      }
}
});`} />
                                </div>
                                <div className="p-6 rounded-xl border border-gray-700 bg-gray-800">
                                    <h3 className="text-xl font-mono uppercase mb-3">Custom Logic & Hooks</h3>
                                    <p className="text-gray-300 leading-relaxed mb-4">
                                        Implement business logic with hooks and callbacks. Validate, transform, or
                                        enhance
                                        your data at any point in the CRUD lifecycle.
                                    </p>
                                    <SimpleCodeBlock language="typescript" code={`const productCallbacks = {
    onPreSave: ({
      collection,
      path,
      entityId,
      values,
      status
    }) => {
      // Generate slug from name
      if (values.name && !values.slug) {
        values.slug = values.name
          .toLowerCase()
          .replace(/\s+/g, '-');
      }
      
      // Add timestamp
      values.updatedAt = new Date();
      
      return values;
    },
    
    // Additional callbacks available:
    // onSaveSuccess, onDelete, etc.
};`} />
                                </div>
                            </div>
                        </div>
                    </Panel>

                    <TechSplash/>

                    <Panel color={"gray"} includePadding={true}>
                        <div className="max-w-5xl mx-auto text-center">
                            <h2 className="text-3xl font-bold mb-8">Technical Architecture</h2>
                            <p className="text-xl mb-12">
                                FireCMS is built on React and integrates directly with Google Cloud Platform.
                                It&#39;s designed to be extensible, performant, and easy to customize.
                            </p>

                            <div className="grid md:grid-cols-3 gap-8 mb-12">
                                <div className={"p-6 rounded-xl border shadow-sm " + defaultBorderMixin}>
                                    <h3 className="text-xl font-mono uppercase mb-3">React + TypeScript</h3>
                                    <p className="text-gray-200 leading-relaxed">
                                        Built with modern React and full TypeScript support, ensuring type safety
                                        throughout your project.
                                    </p>
                                </div>
                                <div className={"p-6 rounded-xl border shadow-sm " + defaultBorderMixin}>
                                    <h3 className="text-xl font-mono uppercase mb-3">Firebase Integration</h3>
                                    <p className="text-gray-200 leading-relaxed">
                                        Direct integration with Firebase/Firestore for authentication, storage,
                                        and real-time database capabilities.
                                    </p>
                                </div>
                                <div className={"p-6 rounded-xl border shadow-sm " + defaultBorderMixin}>
                                    <h3 className="text-xl font-mono uppercase mb-3">Extensible Design</h3>
                                    <p className="text-gray-200 leading-relaxed">
                                        Plugin architecture allows for custom views, fields, and authentication
                                        mechanisms to extend functionality.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Panel>


                    <CustomFields/>

                    <EnterpriseArchitectures/>

                    <Panel color={"dark_gray"} includePadding={true}>
                        <h2 className="text-3xl font-bold mb-8 text-center">Simple deployment to FireCMS Cloud</h2>
                        <div className={"mt-8 mb-12 bg-gray-900 rounded-xl p-6 border " + defaultBorderMixin}>
                            <div className="flex items-center mb-3">
                                <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                                <div className="text-gray-400 text-sm"></div>
                            </div>
                            <div className="font-mono">
                                <span className="text-green-500">&gt;</span>
                                <span className="text-white ml-2">firecms deploy</span>
                                <span
                                    className={`ml-1 inline-block w-2 h-5 bg-white animate-pulse`}></span>
                            </div>
                        </div>
                    </Panel>
                    <Panel color={"dark_gray"} includePadding={true}>
                        <StartHacking/>
                    </Panel>
                </main>
            </div>
        </Layout>
    );
}

export default DevelopersPage;

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
