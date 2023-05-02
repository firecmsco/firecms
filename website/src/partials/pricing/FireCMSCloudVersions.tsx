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
                    <li>Unlimited projects</li>
                    <li>Unlimited collections</li>
                    <li>All available form fields</li>
                    <li>Schema editor and inference from data</li>
                    <li>3 default roles</li>
                    <li>3 users</li>
                </ul>
            </div>
            <div className={"text-center mt-4 text-primary w-full"}>
                <span className={"text-2xl font-bold "}>€0 user/month</span>
            </div>

        </div>
    );

    const plusTier = (
        <div
            className="h-full max-w-sm p-6 border border-solid border-primary rounded-lg shadow-lg flex flex-col">

            <h3 className={"text-2xl md:text-4xl font-bold mb-4 text-center text-gray-700 dark:text-gray-300"}>
                Plus
            </h3>
            <div className={"grow"}>
                <p className={"text-lg mb-4"}>
                    Perfect for small teams and startups.
                </p>
                <ul>
                    <li>Everything in the free tier</li>
                    <li>Text search</li>
                    <li>Custom user roles</li>
                    <li>Custom fields</li>
                </ul>
            </div>
            <div className={"text-center mt-4  w-full"}>
                <span className={"text-sm block"}>All the features in the Plus tier are <b>free</b> during the beta phase</span>
                <span className={"text-2xl block font-bold line-through"}>€12 user/month</span>
                <span className={"text-2xl font-bold text-primary"}>€0 user/month</span>
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
                    <li>Everything in PLUS</li>
                    <li>SAML SSO</li>
                    <li>AI content generation</li>
                    <li>Custom domain</li>
                    <li>Theme and logo customization</li>
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

