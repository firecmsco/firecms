import React from "react";

import { Hero } from "../partials/general/Hero";
import { Panel } from "../partials/general/Panel";
import HeroButtons from "../partials/home/HeroButtons";
import { AgencyLogos } from "../partials/home/AgencyLogos";
import ProTeaser from "../partials/home/ProTeaser";
import { defaultBorderMixin } from "../partials/styles";
import {
    AppSettingsAltIcon,
    BuildIcon,
    CheckCircleIcon,
    CloudUploadIcon,
    DashboardCustomizeIcon,
    GroupsIcon,
    HandshakeIcon,
    HandymanIcon,
    RocketLaunchIcon,
    SpeedIcon,
    StorefrontIcon,
    StyleIcon,
    VerifiedUserIcon,
    WebIcon
} from "@firecms/ui";
import { DeveloperFeatures } from "../partials/features/DeveloperFeatures";
import EasyToCustomize from "../partials/features/EasyToCustomize"; // Using existing image as placeholder

const AgencyCollaborationImage = "/img/users_table.png";

export default function AgenciesPage() {
    return (
        <main className="flex-grow">
            {/* Section 1: Hero */}
            <Hero
                title={
                    <>
                        <span className="block lg:inline">Deliver Exceptional Client Projects, Faster</span>
                    </>
                }
                subtitleColor={"gray"}
                subtitle={
                    <>
                        <p className="text-xl md:text-2xl mb-4">
                            Empower your agency to build robust, custom admin panels and CMS solutions
                            <b> efficiently</b>. Delight clients, streamline workflows, and boost profitability.
                        </p>
                    </>
                }
            />

            <AgencyLogos/>

            {/* Section 2: Agency Advantage */}
            <Panel color={"lighter"}>
                <div className="p-4">
                    <div className="flex items-center mb-4">
                        <HandshakeIcon className="mr-3 text-blue-600"/>
                        <h3 className="m-0 text-3xl font-bold">
                            Your Agency's Secret Weapon
                        </h3>
                    </div>
                    <p className="text-xl md:text-2xl mb-4">
                        Client demands are high, timelines are tight. Building custom back-office
                        solutions from scratch eats into margins and slows down delivery.
                    </p>
                    <p className="text-lg">
                        FireCMS provides a powerful, flexible foundation. Build bespoke admin interfaces
                        and CMS tailored to client needs in a fraction of the time, freeing up your
                        developers for complex features.
                    </p>
                </div>
                <div
                    className="rounded-xl border overflow-hidden">
                    <img
                        src={AgencyCollaborationImage}
                        alt="Screenshot of FireCMS showing data management"
                        className="h-full w-full object-cover"
                    />
                </div>
            </Panel>

            {/* Section 3: Benefits for Agencies */}
            <Panel color={"light"} includePadding={true}>
                <div className="max-w-5xl mx-auto text-center mb-12">
                    <h2 className="text-3xl font-bold mb-4">Accelerate Delivery, Enhance Value</h2>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-24">
                    {/* Card 1: Speed */}
                    <div className={"p-6 rounded-xl border bg-white " + defaultBorderMixin}>
                        <SpeedIcon className="w-10 h-10 mb-3 text-green-600"/>
                        <h3 className="text-xl font-bold mb-2">Rapid Development</h3>
                        <p className="text-gray-700">
                            Launch client admin panels significantly faster using pre-built components and
                            schema inference. Reduce boilerplate code.
                        </p>
                    </div>
                    {/* Card 2: Customization */}
                    <div className={"p-6 rounded-xl border bg-white " + defaultBorderMixin}>
                        <DashboardCustomizeIcon className="w-10 h-10 mb-3 text-indigo-600"/>
                        <h3 className="text-xl font-bold mb-2">Deep Customization</h3>
                        <p className="text-gray-700">
                            Tailor every aspect to client requirements – custom fields, views, logic, branding.
                            Deliver truly bespoke solutions.
                        </p>
                    </div>
                    {/* Card 3: Client Satisfaction */}
                    <div className={"p-6 rounded-xl border bg-white " + defaultBorderMixin}>
                        <GroupsIcon className="w-10 h-10 mb-3 text-purple-600"/>
                        <h3 className="text-xl font-bold mb-2">Client Empowerment</h3>
                        <p className="text-gray-700">
                            Provide clients with intuitive, easy-to-use interfaces they can manage themselves,
                            reducing your support load.
                        </p>
                    </div>
                </div>
            </Panel>

            <EasyToCustomize/>

            <AgencyClientShowcase/>

            {/* Section 4: Features for Agency Success */}
            <Panel color={"gray"}>
                <div className="max-w-5xl mx-auto py-16 px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Features Built for Agencies</h2>
                        <p className="text-xl">Tools to streamline your development process.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Feature Items */}
                        <div className={"p-5 rounded-lg border bg-gray-900 " + defaultBorderMixin}>
                            <div className="flex items-start space-x-3">
                                <BuildIcon className="w-6 h-6 text-white flex-shrink-0 mt-1"/>
                                <div>
                                    <h3 className="text-lg font-semibold mb-1">Reusable Components</h3>
                                    <p className="text-sm text-gray-100">Build custom fields and views once,
                                        reuse across client projects.</p>
                                </div>
                            </div>
                        </div>
                        <div className={"p-5 rounded-lg border bg-gray-900 " + defaultBorderMixin}>
                            <div className="flex items-start space-x-3">
                                <StyleIcon className="w-6 h-6 text-white flex-shrink-0 mt-1"/>
                                <div>
                                    <h3 className="text-lg font-semibold mb-1">White-Labeling Ready</h3>
                                    <p className="text-sm text-gray-100">Easily customize branding and themes to
                                        match client identity (especially with PRO).</p>
                                </div>
                            </div>
                        </div>
                        <div className={"p-5 rounded-lg border bg-gray-900 " + defaultBorderMixin}>
                            <div className="flex items-start space-x-3">
                                <VerifiedUserIcon className="w-6 h-6 text-white flex-shrink-0 mt-1"/>
                                <div>
                                    <h3 className="text-lg font-semibold mb-1">Granular Permissions</h3>
                                    <p className="text-sm text-gray-100">Define precise roles and access control
                                        for different client users.</p>
                                </div>
                            </div>
                        </div>
                        <div className={"p-5 rounded-lg border bg-gray-900 " + defaultBorderMixin}>
                            <div className="flex items-start space-x-3">
                                <RocketLaunchIcon className="w-6 h-6 text-white flex-shrink-0 mt-1"/>
                                <div>
                                    <h3 className="text-lg font-semibold mb-1">Fast Deployment</h3>
                                    <p className="text-sm text-gray-100">Integrates smoothly with Firebase/GCP
                                        or self-host for quick project setup.</p>
                                </div>
                            </div>
                        </div>
                        <div className={"p-5 rounded-lg border bg-gray-900 " + defaultBorderMixin}>
                            <div className="flex items-start space-x-3">
                                <CloudUploadIcon className="w-6 h-6 text-white flex-shrink-0 mt-1"/>
                                <div>
                                    <h3 className="text-lg font-semibold mb-1">Cloud or Self-Hosted</h3>
                                    <p className="text-sm text-gray-100">Choose the best hosting option based on
                                        client needs and budget.</p>
                                </div>
                            </div>
                        </div>
                        <div className={"p-5 rounded-lg border bg-gray-900 " + defaultBorderMixin}>
                            <div className="flex items-start space-x-3">
                                <SpeedIcon className="w-6 h-6 text-white flex-shrink-0 mt-1"/>
                                <div>
                                    <h3 className="text-lg font-semibold mb-1">Developer Friendly</h3>
                                    <p className="text-sm text-gray-100">Leverages React and TypeScript for a
                                        familiar and efficient dev experience.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Panel>

            <DeveloperFeatures/>

            {/* HeroButtons */}
            <Panel color={"light"} includePadding={true}>
                <HeroButtons analyticsLabel={"agencies"}/>
            </Panel>

            {/* ProTeaser */}
            <ProTeaser/>

        </main>
    );
}

const showcaseData = [
    {
        clientType: "E-commerce Store",
        challenge: "Needed a custom admin panel to manage products, orders, and customer data integrated with their existing Shopify backend.",
        solution: "Used FireCMS with custom actions and views to create a tailored interface, pulling data via APIs.",
        benefit: "Faster order processing and inventory management.",
        Icon: StorefrontIcon,
        color: "text-blue-600",
        bgColor: "bg-blue-50" // Added background color for visual distinction
    },
    {
        clientType: "SaaS Platform",
        challenge: "Required an internal tool for the support team to manage user accounts, subscriptions, and feature flags.",
        solution: "Deployed FireCMS connected to their Firestore database, using role-based access for different support tiers.",
        benefit: "Reduced support resolution time by 30%.",
        Icon: AppSettingsAltIcon,
        color: "text-purple-600",
        bgColor: "bg-purple-50" // Added background color
    },
    {
        clientType: "Content Marketing Site",
        challenge: "Client needed an easy way for non-technical marketers to update blog posts, case studies, and landing pages.",
        solution: "Set up FireCMS with predefined content schemas and markdown editors, enabling easy content updates.",
        benefit: "Empowered marketing team, freeing up dev resources.",
        Icon: WebIcon,
        color: "text-green-600",
        bgColor: "bg-green-50" // Added background color
    },
    {
        clientType: "Service Business",
        challenge: "Needed a simple CRM to track client projects, communication logs, and assigned tasks.",
        solution: "Built a custom CRM interface using FireCMS collections for clients, projects, and logs with relations.",
        benefit: "Improved project tracking and client communication.",
        Icon: HandymanIcon,
        color: "text-orange-600",
    },
];

export function AgencyClientShowcase() {
    return (
        <Panel color={"dark_gray"}>
            <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
                <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-white">How Agencies Leverage
                    FireCMS</h2>
                <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                    {showcaseData.map((item, index) => (
                        <div key={index}
                             className={`p-6 rounded-lg border ${defaultBorderMixin} flex flex-col`}>
                            <div className="flex items-center mb-4">
                                <item.Icon className={`w-6 h-6 mr-3 ${item.color}`}/>
                                <h3 className="text-xl font-semibold text-white">{item.clientType}</h3>
                            </div>
                            <div className="flex-grow mb-4">
                                <p className="text-sm text-gray-100 mb-2"><b>Challenge:</b> {item.challenge}
                                </p>
                                <p className="text-sm text-white"><b>FireCMS Solution:</b> {item.solution}
                                </p>
                            </div>
                            {/* Replaced emoji with CheckCircleIcon */}
                            <div className={"mt-auto pt-4 border-t flex items-start " + defaultBorderMixin}>
                                <CheckCircleIcon
                                                 className="w-4 h-4 mr-2 text-green-600 flex-shrink-0 mt-0.5"/>
                                <span className="text-sm font-medium text-white">
                                    <b>Result:</b> {item.benefit}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Panel>
    );
}
