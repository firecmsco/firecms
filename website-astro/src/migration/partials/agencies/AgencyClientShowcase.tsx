import React from "react";
import { Panel } from "../general/Panel";
import { defaultBorderMixin } from "../styles";
import { AppSettingsAltIcon, CheckCircleIcon, HandymanIcon, StorefrontIcon, WebIcon } from "@firecms/ui";

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
