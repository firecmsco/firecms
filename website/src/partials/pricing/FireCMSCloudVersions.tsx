import React from "react";
import { ContainerMixin, ContainerPaddingMixin, CTACaret, defaultBorderMixin } from "../styles";
import clsx from "clsx";
import { LinedSpace } from "../layout/LinedSpace";
import { Tip } from "./Tip";

export function FireCMSCloudVersions() {

    const communityTier = (
        <div
            className={clsx("bg-white w-full max-w-xl lg:max-w-none h-full p-6 border rounded-lg  flex flex-col", defaultBorderMixin)}>

            <h3 className={"text-3xl md:text-4xl font-bold text-gray-500 uppercase my-2"}>
                Community
            </h3>

            <p className={"text-lg mb-4 font-bold h-16"}>
                MIT licensed first-class CMS/admin panel
            </p>

            <div className={"my-4 text-gray-700 w-full"}>
                <span className={"text-3xl font-bold "}>€0 user/month</span>
            </div>

            <div className={"grow mt-4"}>
                <ul className={"pl-4"}>
                    <li className={"list-disc ml-2"}>
                        <Tip tip={"Easily connect to your Firebase and MongoDB Atlas databases."}>
                            Seamless integration with Firebase and MongoDB Atlas
                        </Tip>
                    </li>
                    <li className={"list-disc ml-2"}><Tip tip={"Plus too many to count validation options"}>Access to a
                        40+ first class components library</Tip></li>
                    <li className={"list-disc ml-2"}><Tip
                        tip={"Customize your forms with React components"}>Custom form fields and custom views</Tip>
                    </li>
                    <li className={"list-disc ml-2"}><Tip tip={"Enjoy a robust, lightweight editor"}>Notion-style Markdown editor </Tip>
                    </li>
                    <li className={"list-disc ml-2"}><Tip tip={"Change your logo, theme, colors, fonts, home page, form fields, custom views..."}>Full CMS customization</Tip></li>
                </ul>
            </div>

        </div>
    );

    const cloud = (
        <div
            className={clsx("bg-white w-full max-w-xl lg:max-w-none h-full p-6 rounded-lg flex flex-col outline-none ring-2 ring-primary ring-opacity-75 ring-offset-2 ring-offset-transparent")}>

            <h3 className={"text-3xl md:text-4xl font-bold   my-2"}>
                FireCMS Cloud
            </h3>
            <p className={"text-lg mb-4 font-bold h-16"}>
                Perfect for projects that just need a working solution
            </p>

            <div className={" mt-4 w-full"}>
                {/*<span className={"text-2xl block font-bold line-through"}>€11.99 user/month</span>*/}
                <span className={"text-3xl font-bold text-primary"}>€9.99 user/month</span>
            </div>

            <div className={"flex flex-row gap-4 my-6"}>

                <a
                    className={"h-fit text-sm btn btn-sm py-2 px-3 text-white bg-primary  hover:bg-blue-700  hover:text-white uppercase border-solid rounded "}
                    href="http://app.firecms.co"
                    rel="noopener noreferrer"
                    target="_blank"
                >
                    One month free trial
                    <CTACaret/>
                </a>
            </div>

            <div className={"grow"}>
                <ul className={"pl-4"}>
                    <li className={"list-disc ml-2"}><Tip tip={"Always up to date, including your own custom code"}>Fully managed service</Tip></li>
                    <li className={"list-disc ml-2"}>Everything in the community version</li>
                    <li className={"list-disc ml-2"}><Tip tip={"Customise your views, form fields, navigation routes, custom views and more, using module federation"}>Custom code</Tip></li>
                    <li className={"list-disc ml-2"}><Tip tip={"Instantly search through your data with powerful query capabilities."}>Local text search</Tip></li>
                    <li className={"list-disc ml-2"}><Tip tip={"Create as many data collections as you need."}>Unlimited collections</Tip></li>
                    <li className={"list-disc ml-2"}><Tip tip={"Easily migrate or backup your data."}>Data import and export</Tip></li>
                    <li className={"list-disc ml-2"}><Tip tip={"Personalize the appearance of your CMS to match your brand."}>Theme and logo customization</Tip></li>
                    <li className={"list-disc ml-2"}><Tip tip={"Leverage AI to generate smart content."}>GPT-4 content generation</Tip></li>
                    <li className={"list-disc ml-2"}><Tip tip={"Utilize additional databases for extended functionality."}>Secondary databases</Tip></li>
                    <li className={"list-disc ml-2"}><Tip tip={"Ensure application security with AppCheck integration."}>AppCheck</Tip></li>
                    <li className={"list-disc ml-2"}><Tip tip={"Fine-tune user permissions and roles for your team."}>User and role management</Tip></li>
                </ul>
            </div>

        </div>
    );

    const proTier = (
        <div
            className={clsx("bg-white w-full max-w-xl lg:max-w-none h-full p-6 border rounded-lg  flex flex-col", defaultBorderMixin)}>

            <h3 className={"text-3xl md:text-4xl font-bold  text-gray-700 uppercase my-2"}>
                Pro
            </h3>
            <p className={"text-lg mb-4 font-bold h-16"}>
                Perfect for startups, enterprise or agencies.
            </p>
            <div className={"mt-4  text-gray-800 w-full"}>
                <span className={"text-3xl font-bold "}>€49.99 project/month</span>
            </div>
            <div className={"w-fit my-6 flex flex-row gap-2"}>
                <div
                    className={"rounded-lg w-fit h-fit font-regular m-auto gap-1 text-ellipsis px-4 py-1.5 text-sm font-semibold"}
                    style={{
                        backgroundColor: "rgb(255, 214, 110)",
                        color: "rgb(59, 37, 1)"
                    }}>
                    TRY OUT FOR FREE
                </div>
                <a className={clsx("btn px-4 py-2  uppercase rounded border-solid text-base dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-900 dark:hover:border-gray-800 ")}
                   href="/pro">
                    More info
                </a>
            </div>

            <div className={"grow"}>
                <ul className={"pl-4"}>
                    <li className={"list-disc ml-2"}><Tip tip={"Easily design and infer data schemas for your project."}>Schema editor and data inference</Tip></li>
                    <li className={"list-disc ml-2"}><Tip tip={"Manage complex data migrations with advanced tools."}>Advanced data import and export</Tip></li>
                    <li className={"list-disc ml-2"}><Tip tip={"Manage complex data migrations with advanced tools."}>Data import and export</Tip></li>
                    <li className={"list-disc ml-2"}><Tip tip={"Edit content seamlessly with an intuitive Notion-like interface."}>Notion-style editor</Tip></li>
                    <li className={"list-disc ml-2"}><Tip tip={"Instantly search through your data with powerful query capabilities."}>Local text search</Tip></li>
                    <li className={"list-disc ml-2"}><Tip tip={"Fine-tune user permissions and roles for your team."}>User and role management</Tip></li>
                    <li className={"list-disc ml-2"}><Tip tip={"Implement tailored authentication methods and precise access controls."}>Custom authentication and access control</Tip></li>
                    <li className={"list-disc ml-2"}><Tip tip={"Extend functionality with our full range of plugins."}>Access to all FireCMS plugins</Tip></li>
                    <li className={"list-disc ml-2"}><Tip tip={"Fully customize your CMS components to suit your needs."}>Full CMS components customization</Tip></li>
                    <li className={"list-disc ml-2"}><Tip tip={"Get faster assistance with our priority support."}>Priority support</Tip></li>
                    <li className={"list-disc ml-2"}><Tip tip={"Influence the development of future features through roadmap prioritization."}>Roadmap prioritization</Tip></li>
                </ul>
            </div>

        </div>
    );

    return <section
        className={clsx(defaultBorderMixin, "flex flex-col text-gray-900 items-center justify-center text-lg border-0 border-t bg-gray-100 z-10")}>

        <div className={clsx(ContainerMixin, ContainerPaddingMixin, defaultBorderMixin, "flex flex-col gap-8 border-r border-l border-t-0 border-b-0")}>
            <div className={"max-w-4xl mx-auto"}>
                <p className={"max-w-6xl mx-auto mt-0 mb-8"}>
                    <strong>FireCMS Cloud</strong> offers a complete, end-to-end
                    solution for businesses that require the highest level of
                    support and security. With dedicated hosting, advanced features, and
                    expert support, you&#39;ll have everything you need to take your project
                    to the next level.
                </p>
            </div>
            <div
                className="flex flex-col items-center md:grid md:grid-cols-3 gap-4 w-full mx-auto"
            >
                {communityTier}
                {cloud}
                {proTier}
            </div>

            {/*<ThreeColumns*/}
            {/*    left={freeTier}*/}
            {/*    center={plusTier}*/}
            {/*    right={proTier}*/}
            {/*/>*/}

        </div>
        <LinedSpace position={"top"} size={"medium"}/>
    </section>;

}
