import React from "react";
import { ThreeColumns } from "../general/ThreeColumns";
import {
    ContainerMixin,
    CTAButtonMixin,
    CTACaret,
    CTAOutlinedButtonMixin
} from "../utils";

export function FireCMSCloudVersions() {

    const freeTier = (
        <div
            className="h-full max-w-sm p-6 border border-solid border-gray-200 rounded-lg shadow dark:border-gray-700 flex flex-col">

            <h3 className={"text-2xl md:text-4xl font-bold mb-4 text-center text-gray-700 dark:text-gray-300"}>
                Free
            </h3>
            <div className={"grow"}>
                <p className={"text-lg mb-4"}>
                    Try FireCMS and upgrade to a paid plan when you
                    need more features.
                </p>
                <ul>
                    <li className={"ml-8 list-disc"}>Unlimited projects</li>
                    <li className={"ml-8 list-disc"}>Unlimited collections</li>
                    <li className={"ml-8 list-disc"}>All available form fields</li>
                    <li className={"ml-8 list-disc"}>Schema editor and inference from data</li>
                    <li className={"ml-8 list-disc"}>Advanced data import and export</li>
                    <li className={"ml-8 list-disc"}>Default roles</li>
                    <li className={"ml-8 list-disc"}>3 users</li>
                </ul>
            </div>
            <div className={"text-center mt-4 text-gray-600 dark:text-gray-400 w-full"}>
                <span className={"text-2xl font-bold "}>€0 user/month</span>
            </div>

        </div>
    );

    const plusTier = (
        <div
            className="h-full max-w-sm p-6 rounded-lg flex flex-col outline-none ring-2 ring-primary ring-opacity-75 ring-offset-2 ring-offset-transparent">

            <h3 className={"text-2xl md:text-4xl font-bold mb-4 text-center text-gray-700 dark:text-gray-300 text-primary"}>
                Plus
            </h3>
            <div className={"grow"}>
                <p className={"text-lg mb-4"}>
                    Perfect for small teams and startups.
                </p>
                <ul>
                    <li className={"ml-8 list-disc"}>Everything in the free tier</li>
                    <li className={"ml-8 list-disc"}>Unlimited users and roles</li>
                    <li className={"ml-8 list-disc"}>Unlimited data export</li>
                    <li className={"ml-8 list-disc"}>Theme and logo customization</li>
                    <li className={"ml-8 list-disc"}>Custom user roles</li>
                    <li className={"ml-8 list-disc"}>GPT-4 content generation</li>
                </ul>
            </div>
            <div className={"text-center mt-4 w-full"}>
                {/*<span className={"text-2xl block font-bold line-through"}>€11.99 user/month</span>*/}
                <span className={"text-2xl font-bold text-primary"}>€10.99 user/month</span>
            </div>

        </div>
    );

    const proTier = (
        <div
            className="h-full max-w-sm p-6 border border-solid border-gray-200 rounded-lg shadow dark:border-gray-700 flex flex-col">

            <h3 className={"text-2xl md:text-4xl font-bold mb-4 text-center text-gray-700 dark:text-gray-300"}>
                Pro
            </h3>
            <div className={"grow"}>
                <p className={"text-lg mb-4"}>
                    Perfect for large teams and enterprises.
                </p>
                <ul>
                    <li className={"ml-8 list-disc"}>Everything in PLUS</li>
                    <li className={"ml-8 list-disc"}>Custom fields and custom views</li>
                    <li className={"ml-8 list-disc"}>SAML SSO</li>
                    <li className={"ml-8 list-disc"}>Custom domain</li>
                    <li className={"ml-8 list-disc"}>Priority support</li>
                    <li className={"ml-8 list-disc"}>Roadmap prioritization</li>
                </ul>
            </div>
            <div className={"text-center mt-4 text-primary w-full"}>
                <a
                    className={CTAOutlinedButtonMixin}
                    href="mailto:hello@firecms.co?subject=FireCMS%20Cloud%20Pro"
                    rel="noopener noreferrer"
                    target="_blank"
                >
                    Talk to us
                </a>
            </div>

        </div>
    );

    return <section
        className={ContainerMixin + " flex flex-col items-center my-16 text-lg"}>


        <h2 className={"text-3xl md:text-4xl font-bold mb-4 text-center"}>
            Full no-code solution
        </h2>

        <p>
            <strong>FireCMS Cloud</strong> offers a complete, end-to-end
            solution for businesses that require the highest level of
            support and security. With dedicated hosting, advanced features, and
            expert support, you'll have everything you need to take your project
            to the next level.
        </p>


        <ThreeColumns
            left={freeTier}
            center={plusTier}
            right={proTier}
        />

        <a
            className={CTAButtonMixin}
            href="http://app.firecms.co"
            rel="noopener noreferrer"
            target="_blank"
        >
            Go to FireCMS Cloud
            <CTACaret/>
        </a>
    </section>;

}

