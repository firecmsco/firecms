import React from "react";
import { ContainerMixin, ContainerPaddingMixin, CTACaret, defaultBorderMixin } from "../styles";
import clsx from "clsx";
import { LinedSpace } from "../layout/LinedSpace";

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

            <div className={"my-4 text-gray-800 w-full"}>
                <span className={"text-3xl font-bold "}>€0 user/month</span>
            </div>

            <div className={"grow mt-8"}>
                <ul className={"pl-4"}>
                    <li className={"list-disc"}>Seamless integration with Firebase and MongoDB Atlas</li>
                    <li className={"list-disc"}>Custom form fields and custom views</li>
                    <li className={"list-disc"}>Access to a 40+ first class components library</li>
                </ul>
            </div>

        </div>
    );

    const cloud = (
        <div
            className={clsx("bg-white w-full max-w-xl lg:max-w-none h-full p-6 rounded-lg flex flex-col outline-none ring-2 ring-primary ring-opacity-75 ring-offset-2 ring-offset-transparent")}>

            <h3 className={"text-3xl md:text-4xl font-bold  text-primary uppercase my-2"}>
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
                    <li className={"list-disc"}>Fully managed service</li>
                    <li className={"list-disc"}>Notion-style editor</li>
                    <li className={"list-disc"}>Local text search</li>
                    <li className={"list-disc"}>Unlimited collections</li>
                    <li className={"list-disc"}>Unlimited users and roles</li>
                    <li className={"list-disc"}>Data import and export</li>
                    <li className={"list-disc"}>Theme and logo customization</li>
                    <li className={"list-disc"}>GPT-4 content generation</li>
                    <li className={"list-disc"}>Secondary databases</li>
                    <li className={"list-disc"}>AppCheck</li>
                    <li className={"list-disc"}>User and role management</li>
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
            <div className={"mt-4  text-gray-600 w-full"}>
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
                    <li className={"list-disc"}>Schema editor and data inference</li>
                    <li className={"list-disc"}>Advanced data import and export</li>
                    <li className={"list-disc"}>Data import and export</li>
                    <li className={"list-disc"}>Notion-style editor</li>
                    <li className={"list-disc"}>Local text search</li>
                    <li className={"list-disc"}>User and role management</li>
                    <li className={"list-disc"}>Custom authentication and access control</li>
                    <li className={"list-disc"}>Access to all FireCMS plugins</li>
                    <li className={"list-disc"}>Full CMS components customization</li>
                    <li className={"list-disc"}>Priority support</li>
                    <li className={"list-disc"}>Roadmap prioritization</li>
                </ul>
            </div>

        </div>
    );

    return <section
        className={clsx(defaultBorderMixin, "flex flex-col text-gray-900 items-center justify-center text-lg border-0 border-t bg-gray-50")}>

        <div className={clsx(ContainerMixin, ContainerPaddingMixin, "flex flex-col gap-8")}>

            <div className={"max-w-4xl mx-auto"}>
                <h2 className={"mb-3 uppercase font-mono"}>
                    Full no-code/low-code solution
                </h2>

                <p className={"max-w-6xl mx-auto"}>
                    <strong>FireCMS Cloud</strong> offers a complete, end-to-end
                    solution for businesses that require the highest level of
                    support and security. With dedicated hosting, advanced features, and
                    expert support, you'll have everything you need to take your project
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

