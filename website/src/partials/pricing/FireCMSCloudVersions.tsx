import React from "react";
import { ContainerMixin, ContainerPaddingMixin, CTAButtonMixin, CTACaret, defaultBorderMixin } from "../styles";
import clsx from "clsx";
import { LinedSpace } from "../layout/LinedSpace";

export function FireCMSCloudVersions() {

    const freeTier = (
        <div
            className={clsx("bg-white w-full max-w-xl lg:max-w-none h-full p-6 border rounded-lg dark:border-gray-700 flex flex-col", defaultBorderMixin)}>

            <h3 className={"text-3xl md:text-4xl font-bold  text-center text-gray-700 uppercase my-2"}>
                Free
            </h3>
            <p className={"text-lg mb-4 font-bold text-center"}>
                Try FireCMS and upgrade to a paid plan when you
                need more features.
            </p>
            <div className={"grow"}>
                <ul>
                    <li className={"list-disc"}>Unlimited projects</li>
                    <li className={"list-disc"}>Unlimited collections</li>
                    <li className={"list-disc"}>All available form fields</li>
                    <li className={"list-disc"}>Custom form fields and custom views</li>
                    <li className={"list-disc"}>Access to a 40+ first class components library</li>
                    <li className={"list-disc"}>Schema editor and data inference</li>
                    <li className={"list-disc"}>Advanced data import and export</li>
                    <li className={"list-disc"}>Default roles</li>
                    <li className={"list-disc"}>3 users</li>
                </ul>
            </div>
            <div className={"text-center mt-4 text-gray-600 w-full"}>
                <span className={"text-2xl font-bold "}>€0 user/month</span>
            </div>

        </div>
    );

    const plusTier = (
        <div
            className={clsx("bg-white w-full max-w-xl lg:max-w-none h-full p-6 rounded-lg flex flex-col outline-none ring-2 ring-primary ring-opacity-75 ring-offset-2 ring-offset-transparent")}>

            <h3 className={"text-3xl md:text-4xl font-bold text-center text-primary uppercase my-2"}>
                Plus
            </h3>
            <p className={"text-lg mb-4 font-bold text-center"}>
                Perfect for startups and larger companies
            </p>
            <div className={"grow"}>
                <ul>
                    <li className={"list-disc"}>Everything in the free tier</li>
                    <li className={"list-disc"}>Local text search</li>
                    <li className={"list-disc"}>Secondary databases</li>
                    <li className={"list-disc"}>Unlimited users and roles</li>
                    <li className={"list-disc"}>Unlimited data export</li>
                    <li className={"list-disc"}>Theme and logo customization</li>
                    <li className={"list-disc"}>Custom user roles</li>
                    <li className={"list-disc"}>GPT-4 content generation</li>
                    <li className={"list-disc"}>AppCheck</li>
                </ul>
            </div>

            <div
                className={"rounded-lg w-fit h-fit font-regular m-auto gap-1 text-ellipsis px-4 py-1.5 text-sm font-semibold"}
                style={{
                    backgroundColor: "rgb(255, 214, 110)",
                    color: "rgb(59, 37, 1)"
                }}>
                ONE MONTH FREE TRIAL
            </div>
            <div className={"text-center mt-4 w-full"}>
                {/*<span className={"text-2xl block font-bold line-through"}>€11.99 user/month</span>*/}
                <span className={"text-2xl font-bold text-primary"}>€9.99 user/month</span>
            </div>

        </div>
    );

    const proTier = (
        <div
            className={clsx("bg-white w-full max-w-xl lg:max-w-none h-full p-6 border rounded-lg  flex flex-col", defaultBorderMixin)}>

            <h3 className={"text-3xl md:text-4xl font-bold text-center text-gray-700 uppercase my-2"}>
                Pro
            </h3>
            <p className={"text-lg mb-4 font-bold text-center"}>
                Perfect for startups, companies or agencies.
            </p>
            <div className={"grow"}>
                <ul>
                    <li className={"list-disc"}>Everything in PLUS</li>
                    <li className={"list-disc"}>Self-hosted</li>
                    <li className={"list-disc"}>Custom authentication and access control</li>
                    <li className={"list-disc"}>Access to all the plugins</li>
                    <li className={"list-disc"}>SAML SSO</li>
                    <li className={"list-disc"}>Custom domain</li>
                    <li className={"list-disc"}>Full CMS components customization</li>
                    <li className={"list-disc"}>Priority support</li>
                    <li className={"list-disc"}>Roadmap prioritization</li>
                </ul>
            </div>
            <div className={"w-fit m-auto mt-8 flex flex-row gap-2 items-center"}>
                <div
                    className={"rounded-lg w-fit h-fit font-regular m-auto gap-1 text-ellipsis px-4 py-1.5 text-sm font-semibold"}
                    style={{
                        backgroundColor: "rgb(255, 214, 110)",
                        color: "rgb(59, 37, 1)"
                    }}>
                    TRY OUT FOR FREE
                </div>
                <a className={clsx("btn px-4 py-2  uppercase rounded border-solid text-base dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-900 dark:hover:border-gray-800 text-center")}
                   href="/pro">
                    More info
                </a>
            </div>
            <div className={"mt-4 text-center text-gray-600 w-full"}>
                <span className={"text-2xl font-bold "}>Starting at €49.99/month</span>
            </div>
        </div>
    );

    return <section
        className={clsx(defaultBorderMixin, "flex flex-col text-gray-900 items-center justify-center text-lg border-0 border-t bg-gray-50")}>

        <div className={clsx(ContainerMixin, ContainerPaddingMixin, "flex flex-col items-center gap-8")}>

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

            <div
                className="flex flex-col items-center lg:grid lg:grid-cols-3 gap-4 w-full mx-auto"
            >
                {freeTier}
                {plusTier}
                {proTier}
            </div>

            {/*<ThreeColumns*/}
            {/*    left={freeTier}*/}
            {/*    center={plusTier}*/}
            {/*    right={proTier}*/}
            {/*/>*/}

            <a
                className={CTAButtonMixin}
                href="http://app.firecms.co"
                rel="noopener noreferrer"
                target="_blank"
            >
                Go to FireCMS Cloud
                <CTACaret/>
            </a>
        </div>
        <LinedSpace position={"top"} size={"medium"}/>
    </section>;

}

