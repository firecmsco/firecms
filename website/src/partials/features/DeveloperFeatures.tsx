import React from "react";

// @ts-ignore
import pricePreview from "@site/static/img/price.png";

import { useColorMode } from "@docusaurus/theme-common";

import { TwoColumns } from "../general/TwoColumns";
import { Panel } from "../general/Panel";
import clsx from "clsx";
import { ContainerInnerPaddingMixin, CTAOutlinedButtonWhiteMixin, defaultBorderMixin } from "../styles";
import CodeBlock from "@theme/CodeBlock";
import Link from "@docusaurus/Link";

// @ts-ignore
import customFieldDarkVideo from "@site/static/img/custom_fields_dark.mp4";

export function DeveloperFeatures() {
    const { colorMode } = useColorMode();
    const isDarkTheme = colorMode === "dark";

    return (
        <>
            <Panel color="dark_gray" includePadding={false}
                   header={<p
                       className={clsx("text-center text-secondary uppercase font-mono font-bold border-0 border-b", ContainerInnerPaddingMixin, defaultBorderMixin)}>
                       For developers
                   </p>}>
                <div className="lg:max-w-5xl mx-auto py-16 p-4 max-w-full">
                    <div className="mb-16 max-w-full">
                        <TwoColumns
                            animation={false}
                            left={
                                <div className="pb-8">
                                    <h3 className="text-2xl font-mono uppercase mb-3">Type-Safe Schema Definitions</h3>
                                    <p className="text-gray-300 leading-relaxed mb-4">
                                        Define your data models in TypeScript for complete type safety. Your schemas
                                        become the single source of truth for both your admin panel and application.
                                    </p>
                                    <CodeBlock language="typescript"
                                               className={"bg-gray-900 text-gray-200 overflow-x-auto max-w-full"}>
                                        {`const productCollection = buildCollection({
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
    }
  }
});`}
                                    </CodeBlock>
                                </div>
                            }
                            right={
                                <>
                                    <h3 className="text-2xl font-mono uppercase mb-3">Custom React Components</h3>
                                    <p className="text-gray-300 leading-relaxed mb-4">
                                        Extend the CMS with your own React components. Create custom property fields,
                                        entity views, or navigation items that perfectly fit your project needs.
                                    </p>
                                    <div className="p-1 flex justify-center">
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
                                </>
                            }
                        />
                    </div>

                    <div className="text-center">
                        <h3 className="text-2xl font-mono uppercase mb-4">Focus on Your Core Application Logic</h3>
                        <p className="text-lg mb-6">
                            Build powerful internal tools, CRUD interfaces, and back-offices
                            without the frontend hassle. FireCMS works with every existing project
                            and doesn&#39;t enforce any data structure.
                        </p>
                        <Link
                            to="/developers"
                            className={CTAOutlinedButtonWhiteMixin + " w-full lg:w-auto "}>
                            Explore Developer Features
                        </Link>
                    </div>
                </div>
            </Panel>
        </>
    );
}
