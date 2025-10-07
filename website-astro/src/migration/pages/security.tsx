import React from "react";
import Layout from "../components/Layout.tsx";
import Head from "@docusaurus/Head";

// Fix imports for local partials: use named imports if not default
import { Hero } from "../partials/general/Hero";
import { Panel } from "../partials/general/Panel";
import { CTAButtonMixin, CTACaret, CTAOutlinedButtonMixin, defaultBorderMixin } from "../partials/styles";
import { AppLink } from "../AppLink";

import {
    AccountTreeIcon,
    AdminPanelSettingsIcon,
    AppsIcon,
    CheckCircleIcon,
    CloudUploadIcon,
    DataObjectIcon,
    GroupsIcon,
    IntegrationInstructionsIcon,
    MonitorIcon,
    PolicyIcon,
    SecurityIcon,
    StorageIcon,
    VerifiedUserIcon,
    VisibilityIcon,
    VpnKeyIcon
} from "@firecms/ui";

// Placeholder image paths - replace with actual security-related images
// @ts-expect-error
import DataSovereigntyImage from "@site/static/img/demo-botanic-plant-firestore.png";
// @ts-expect-error
import SecurityArchitectureImage from "@site/static/img/firecms-layers.png";

function Security() {
    return (
        <Layout
            title={"Security & Privacy - FireCMS"}
            description="Discover how FireCMS ensures data ownership, privacy, and security through transparent architecture, multi-layered protection, and compliance-ready design."
        >
            <Head>
                <meta property="og:title" content="Security & Privacy - Trust Through Transparency | FireCMS"/>
                <meta property="og:description"
                      content="Learn how FireCMS guarantees data sovereignty, implements multi-layered security, and enables global compliance through its unique architecture."/>
                <meta property="og:image" content="https://firecms.co/img/firecms_logo.svg"/>
            </Head>

            <div className="flex flex-col min-h-screen">
                <main className="flex-grow">
                    {/* Hero Section */}
                    <Hero
                        title={
                            <>
                                <span className="block lg:inline">Trust Through Transparency</span>
                            </>
                        }
                        subtitleColor={"gray"}
                        subtitle={
                            <>
                                <p className="text-xl md:text-2xl mb-4 font-mono uppercase">
                                    Your data is <b>yours</b>. FireCMS is engineered from the ground up to guarantee
                                    absolute data sovereignty, privacy, and security through transparent architecture.
                                </p>
                                <p className="text-base font-mono uppercase">
                                    Trusted by developers at <b>Microsoft</b>, <b>Ikea</b>, and tens of thousands of
                                    startups worldwide.
                                </p>
                            </>
                        }
                    />

                    {/* Core Principles Section */}
                    <Panel color={"light"} includePadding={true}>
                        <div className={"py-12 md:py-16"}>
                            <div className="max-w-5xl mx-auto text-center mb-8">
                                <h2 className="text-3xl font-bold mb-4 uppercase">Our Core Security Principles</h2>
                                <p className="text-xl text-gray-600 font-mono uppercase">
                                    FireCMS is built on three foundational pillars that ensure your data remains secure
                                    and under your control.
                                </p>
                            </div>

                            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-24">
                                <div className={"p-6 rounded-xl border bg-white " + defaultBorderMixin}>
                                    <StorageIcon className="w-8 h-8 mb-4 text-blue-600"/>
                                    <h3 className="text-xl font-bold mb-3">Absolute Data Ownership</h3>
                                    <p className="text-gray-700">
                                        Your data lives exclusively in your own Firebase or MongoDB project.
                                        FireCMS never stores, accesses, or controls your content data.
                                    </p>
                                </div>

                                <div className={"p-6 rounded-xl border bg-white " + defaultBorderMixin}>
                                    <SecurityIcon className="w-8 h-8 mb-4 text-green-600"/>
                                    <h3 className="text-xl font-bold mb-3">Multi-Layered Security</h3>
                                    <p className="text-gray-700">
                                        Enterprise-grade security through shared responsibility: robust application
                                        controls,
                                        world-class infrastructure, and your custom security rules.
                                    </p>
                                </div>

                                <div className={"p-6 rounded-xl border bg-white " + defaultBorderMixin}>
                                    <VisibilityIcon className="w-8 h-8 mb-4 text-purple-600"/>
                                    <h3 className="text-xl font-bold mb-3">Transparency by Design</h3>
                                    <p className="text-gray-700">
                                        Open-source core, clear privacy policies, and transparent architecture.
                                        You can audit every aspect of how FireCMS works.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Panel>

                    {/* Data Sovereignty Deep Dive */}
                    <DataSovereigntySection/>

                    {/* Architecture & Security */}
                    <SecurityArchitectureSection/>

                    {/* Deployment Models */}
                    <DeploymentModelsSection/>

                    {/* Privacy & Compliance */}
                    <PrivacyComplianceSection/>

                    {/* Shared Responsibility Model */}
                    <SharedResponsibilitySection/>

                    {/* Trust Indicators */}
                    <TrustIndicatorsSection/>

                    {/* Call to Action Section */}
                    <CallToActionSection/>

                </main>
            </div>
        </Layout>
    );
}

export default Security;

// Data Sovereignty Section
function DataSovereigntySection() {
    return (
        <Panel color={"gray"}>
            <div className="py-12 md:py-16 max-w-6xl mx-auto px-4 py-12 md:py-16">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="flex items-center mb-4">
                            <StorageIcon className="w-8 h-8 mr-2 mt-2 text-blue-400 flex-shrink-0"/>
                            <h2 className="text-xl font-bold text-white m-0">Your Data, Your Infrastructure</h2>
                        </div>
                        <p className="text-xl text-gray-100 mb-4">
                            Unlike traditional SaaS CMS platforms that ingest and control your data,
                            FireCMS operates as a sophisticated tool that connects directly to <b>your own</b> database.
                        </p>

                        <div className="space-y-8 my-16">
                            <div className="flex items-start space-x-3">
                                <CheckCircleIcon className="w-6 h-6 text-green-400 mt-2 flex-shrink-0"/>
                                <div>
                                    <h4 className="font-semibold text-white">No Data Migration Required</h4>
                                    <p className="text-gray-200 text-sm m-1">
                                        FireCMS adapts to your existing data structure, not the other way around.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <CheckCircleIcon className="w-6 h-6 text-green-400 mt-2 flex-shrink-0"/>
                                <div>
                                    <h4 className="font-semibold text-white">Zero Vendor Lock-in</h4>
                                    <p className="text-gray-200 text-sm m-1">
                                        Stop using FireCMS anytime - your data stays exactly where it is.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <CheckCircleIcon className="w-6 h-6 text-green-400 mt-2 flex-shrink-0"/>
                                <div>
                                    <h4 className="font-semibold text-white">Direct Infrastructure Access</h4>
                                    <p className="text-gray-200 text-sm m-1">
                                        Full control over your Google Cloud or MongoDB Atlas project.
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className={"rounded-xl border overflow-hidden " + defaultBorderMixin}>
                        <img
                            src={DataSovereigntyImage}
                            alt="Diagram showing FireCMS connecting to customer's own Firebase/MongoDB project with data remaining under customer control"
                            className="h-full w-full object-cover"
                        />
                    </div>
                </div>
            </div>
        </Panel>
    );
}

// Security Architecture Section
function SecurityArchitectureSection() {
    return (
        <Panel color={"white"} includePadding={true}>
            <div className="py-12 md:py-16 max-w-6xl mx-auto">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-4 uppercase">Multi-Layered Security Architecture</h2>
                    <p className="text-xl text-gray-600 font-mono uppercase">
                        Security through shared responsibility and defense in depth.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
                    <div className="rounded-xl overflow-hidden p-6 bg-white">
                        <img
                            src={SecurityArchitectureImage}
                            alt="Security architecture diagram showing application layer, infrastructure layer, and database security layers"
                            className="h-full w-full object-cover"
                        />
                    </div>

                    <div className="space-y-6">
                        <div className={"p-5 rounded-lg border " + defaultBorderMixin}>
                            <div className="flex items-center mb-3">
                                <AdminPanelSettingsIcon className="w-6 h-6 mr-3 text-blue-600 flex-shrink-0"/>
                                <h3 className="text-lg font-bold m-0">Application Layer</h3>
                            </div>
                            <p className="text-gray-700 text-sm">
                                Granular role-based access control, dynamic permissions,
                                custom authentication integrations, and App Check protection.
                            </p>
                        </div>

                        <div className={"p-5 rounded-lg border " + defaultBorderMixin}>
                            <div className="flex items-center mb-3">
                                <CloudUploadIcon className="w-6 h-6 mr-3 text-green-600 flex-shrink-0"/>
                                <h3 className="text-lg font-bold m-0">Infrastructure Layer</h3>
                            </div>
                            <p className="text-gray-700 text-sm">
                                Enterprise-grade security from Google Cloud and MongoDB Atlas:
                                encryption, network security, compliance certifications.
                            </p>
                        </div>

                        <div className={"p-5 rounded-lg border " + defaultBorderMixin}>
                            <div className="flex items-center mb-3">
                                <VpnKeyIcon className="w-6 h-6 mr-3 text-purple-600 flex-shrink-0"/>
                                <h3 className="text-lg font-bold m-0">Database Security</h3>
                            </div>
                            <p className="text-gray-700 text-sm">
                                Your custom Firestore/MongoDB security rules enforce access at the data layer.
                                Ultimate control in your hands.
                            </p>
                        </div>
                    </div>
                </div>

                <div className={"p-6 rounded-xl border bg-blue-50 " + defaultBorderMixin}>
                    <h3 className="text-xl font-bold mb-4 text-blue-900">Why This Architecture Matters</h3>
                    <p className="text-blue-800">
                        Unlike proprietary CMS platforms that create their own security abstractions,
                        FireCMS leverages and enhances the battle-tested security models of leading cloud providers.
                        This provides better security, easier compliance, and skills that transfer to your core
                        application development.
                    </p>
                </div>
            </div>
        </Panel>
    );
}

// Deployment Models Section
function DeploymentModelsSection() {
    return (
        <Panel color={"lighter"} includePadding={true}>
            <div className="py-12 md:py-16 max-w-6xl mx-auto">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-4 uppercase">Choose Your Security Posture</h2>
                    <p className="text-xl text-gray-600 font-mono uppercase">
                        Multiple deployment options, same data sovereignty principles.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Self-Hosted */}
                    <div className={"p-8 rounded-xl border bg-white " + defaultBorderMixin}>
                        <div className="flex items-center mb-4">
                            <MonitorIcon className="w-8 h-8 mr-2 mt-2 text-green-600 flex-shrink-0"/>
                            <h3 className="text-2xl font-bold m-0">Self-Hosted</h3>
                        </div>

                        <p className="text-gray-700 mb-4">
                            Ultimate control and transparency. Deploy FireCMS entirely within your own infrastructure.
                        </p>

                        <div className="space-y-4 mb-8">
                            <div className="flex items-start space-x-3">
                                <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0"/>
                                <span className="text-sm text-gray-700 mt-0.5 ">Open-source MIT license available</span>
                            </div>
                            <div className="flex items-start space-x-3">
                                <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0"/>
                                <span
                                    className="text-sm text-gray-700 mt-0.5">Deploy on any static hosting provider</span>
                            </div>
                            <div className="flex items-start space-x-3">
                                <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0"/>
                                <span className="text-sm text-gray-700 mt-0.5">No external dependencies or proprietary servers</span>
                            </div>
                            <div className="flex items-start space-x-3">
                                <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0"/>
                                <span className="text-sm text-gray-700 mt-0.5">Full code auditability</span>
                            </div>
                        </div>

                        <div className={"p-4 rounded-lg bg-green-50 border " + defaultBorderMixin}>
                            <p className="text-green-800 text-sm font-medium">
                                <strong>Best for:</strong> Regulated industries, enterprises with strict security
                                requirements,
                                and teams that need maximum control.
                            </p>
                        </div>
                    </div>

                    {/* FireCMS Cloud */}
                    <div className={"p-8 rounded-xl border bg-white " + defaultBorderMixin}>
                        <div className="flex items-center mb-4">
                            <CloudUploadIcon className="w-8 h-8 mr-2 mt-2  text-blue-600 flex-shrink-0"/>
                            <h3 className="text-2xl font-bold m-0">FireCMS Cloud</h3>
                        </div>

                        <p className="text-gray-700 mb-4">
                            Fully managed convenience without sacrificing data ownership.
                            Your data stays in your Firebase project.
                        </p>

                        <div className="space-y-4 mb-8">
                            <div className="flex items-start space-x-3">
                                <CheckCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0"/>
                                <span className="text-sm text-gray-700 mt-0.5">Service account credentials encrypted with Google Cloud KMS</span>
                            </div>
                            <div className="flex items-start space-x-3">
                                <CheckCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0"/>
                                <span className="text-sm text-gray-700 mt-0.5">Transparent connection mechanism</span>
                            </div>
                            <div className="flex items-start space-x-3">
                                <CheckCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0"/>
                                <span className="text-sm text-gray-700 mt-0.5">Custom React components supported</span>
                            </div>
                            <div className="flex items-start space-x-3">
                                <CheckCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0"/>
                                <span className="text-sm text-gray-700 mt-0.5">Same data sovereignty guarantees</span>
                            </div>
                        </div>

                        <div className={"p-4 rounded-lg bg-blue-50 border " + defaultBorderMixin}>
                            <p className="text-blue-800 text-sm font-medium">
                                <strong>Best for:</strong> Startups and teams prioritizing speed and convenience
                                while maintaining data ownership.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Panel>
    );
}

// Privacy & Compliance Section
function PrivacyComplianceSection() {
    return (
        <Panel color={"gray"}>
            <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center mb-4 justify-center">
                        <PolicyIcon className="w-8 h-8 mr-2 mt-2 text-green-400 flex-shrink-0"/>
                        <h2 className="text-3xl font-bold text-white m-0">Privacy &amp; Compliance Ready</h2>
                    </div>

                    <p className="text-xl text-gray-100 mb-8 text-center">
                        FireCMS&apos;s architecture is designed to simplify your compliance journey
                        under <b>GDPR</b>, <b>CCPA</b>, and other global privacy regulations.
                    </p>

                    <div className="space-y-6 mb-8">
                        <div className={"p-5 rounded-lg border bg-gray-800 " + defaultBorderMixin}>
                            <div className="flex items-center">
                                <VerifiedUserIcon className="w-6 h-6 mr-3 text-green-400 flex-shrink-0"/>
                                <h5 className="font-bold text-white m-0">You Are the Data Controller</h5>
                            </div>
                            <p className="text-gray-200 text-sm my-1">
                                Under GDPR and CCPA, you maintain direct control and legal responsibility
                                for your end-user data, with Google/MongoDB as processors.
                            </p>
                        </div>

                        <div className={"p-5 rounded-lg border bg-gray-800 " + defaultBorderMixin}>
                            <div className="flex items-center">
                                <IntegrationInstructionsIcon className="w-6 h-6 mr-3 text-blue-400 flex-shrink-0"/>
                                <h5 className="font-bold text-white m-0">Simplified Data Subject Requests</h5>
                            </div>
                            <p className="text-gray-200 text-sm my-1">
                                Fulfill access, correction, and deletion requests directly in your database
                                using the FireCMS interface - no third-party mediation required.
                            </p>
                        </div>

                        <div className={"p-5 rounded-lg border bg-gray-800 " + defaultBorderMixin}>
                            <div className="flex items-center">
                                <StorageIcon className="w-6 h-6 mr-3 text-purple-400 flex-shrink-0"/>
                                <h5 className="font-bold text-white m-0">Data Residency Control</h5>
                            </div>
                            <p className="text-gray-200 text-sm my-1">
                                Choose your Firebase or MongoDB Atlas region to meet specific
                                geographical data residency requirements.
                            </p>
                        </div>
                    </div>
                </div>

                <div className={"max-w-4xl mx-auto mt-12 p-6 rounded-xl bg-gray-800 "}>
                    <h3 className="text-xl font-bold mb-4 text-white">Compliance Inheritance</h3>
                    <p className="text-gray-100 mb-4">
                        By building on Google Cloud and MongoDB Atlas, your FireCMS applications inherit
                        extensive compliance certifications:
                    </p>
                    <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-200">
                        <ul className="space-y-1">
                            <li>• ISO 27001, SOC 1/2/3</li>
                            <li>• HIPAA (MongoDB Atlas)</li>
                            <li>• PCI DSS</li>
                        </ul>
                        <ul className="space-y-1">
                            <li>• FedRAMP Moderate</li>
                            <li>• EU-US Data Privacy Framework</li>
                            <li>• Industry-specific certifications</li>
                        </ul>
                    </div>
                </div>
            </div>
        </Panel>
    );
}

// Shared Responsibility Section
function SharedResponsibilitySection() {
    return (
        <Panel color={"white"} includePadding={true}>
            <div className="max-w-6xl mx-auto py-12 md:py-16">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-4 uppercase">Shared Responsibility Model</h2>
                    <p className="text-xl text-gray-600 font-mono uppercase">
                        Clear division of security responsibilities for maximum protection.
                    </p>
                </div>

                <div className="overflow-x-auto mb-8">
                    <table className={"w-full border rounded-lg table-fixed " + defaultBorderMixin}>
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="p-4 text-left font-bold w-1/6">Security Domain</th>
                            <th className="p-4 text-left font-bold text-blue-600 w-1/4">Your Responsibility</th>
                            <th className="p-4 text-left font-bold text-green-600 w-1/4">FireCMS Provides</th>
                            <th className="p-4 text-left font-bold text-purple-600 w-1/3">Infrastructure (Google/MongoDB)</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-500 divide-opacity-30 dark:divide-slate-500 dark:divide-opacity-30">
                        <tr>
                            <td className="p-4 font-medium">Data Access Control</td>
                            <td className="p-4 text-sm">Write &amp; maintain security rules</td>
                            <td className="p-4 text-sm">RBAC system, permission builders</td>
                            <td className="p-4 text-sm">Rule enforcement at database level</td>
                        </tr>
                        <tr className="bg-gray-50">
                            <td className="p-4 font-medium">User Authentication</td>
                            <td className="p-4 text-sm">Configure auth providers</td>
                            <td className="p-4 text-sm">Firebase Auth integration, custom authenticators</td>
                            <td className="p-4 text-sm">Secure, scalable authentication service</td>
                        </tr>
                        <tr>
                            <td className="p-4 font-medium">Data Encryption</td>
                            <td className="p-4 text-sm">Optional client-side encryption</td>
                            <td className="p-4 text-sm">TLS/SSL connections</td>
                            <td className="p-4 text-sm">Encryption at rest and in transit</td>
                        </tr>
                        <tr className="bg-gray-50">
                            <td className="p-4 font-medium">Network Security</td>
                            <td className="p-4 text-sm">Configure firewalls, VPC settings</td>
                            <td className="p-4 text-sm">App Check integration</td>
                            <td className="p-4 text-sm">VPCs, DDoS protection, secure networking</td>
                        </tr>
                        <tr>
                            <td className="p-4 font-medium">Compliance</td>
                            <td className="p-4 text-sm">Act as Data Controller</td>
                            <td className="p-4 text-sm">Compliance-enabling tools</td>
                            <td className="p-4 text-sm">Certified infrastructure (ISO, SOC, etc.)</td>
                        </tr>
                        </tbody>
                    </table>
                </div>

                <div className={"p-6 rounded-xl border bg-green-50 " + defaultBorderMixin}>
                    <h3 className="text-xl font-bold mb-4 text-green-900">Why This Model Works</h3>
                    <p className="text-green-800">
                        This shared responsibility approach gives you the flexibility to implement security controls
                        that match your specific requirements, while leveraging enterprise-grade infrastructure
                        security from day one. You get the best of both worlds: control and convenience.
                    </p>
                </div>
            </div>
        </Panel>
    );
}

// Trust Indicators Section
function TrustIndicatorsSection() {
    return (
        <Panel color={"lighter"} includePadding={true}>
            <div className="max-w-6xl mx-auto py-12 md:py-16">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-4 uppercase">Trusted by Leading Organizations</h2>
                    <p className="text-xl text-gray-600 font-mono uppercase">
                        Enterprise teams trust FireCMS with their most critical data.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className={"p-6 rounded-xl border bg-white text-center " + defaultBorderMixin}>
                        <GroupsIcon className="w-8 h-8 mx-auto mb-3 text-blue-600"/>
                        <h3 className="text-2xl font-bold mb-2">10000+</h3>
                        <p className="my-1 text-gray-700 text-sm">Active Projects</p>
                    </div>

                    <div className={"p-6 rounded-xl border bg-white text-center " + defaultBorderMixin}>
                        <SecurityIcon className="w-8 h-8 mx-auto mb-3 text-green-600"/>
                        <h3 className="text-2xl font-bold mb-2">100%</h3>
                        <p className="my-1 text-gray-700 text-sm">Data Sovereignty</p>
                    </div>

                    <div className={"p-6 rounded-xl border bg-white text-center " + defaultBorderMixin}>
                        <MonitorIcon className="w-8 h-8 mx-auto mb-3 text-purple-600"/>
                        <h3 className="text-2xl font-bold mb-2">99.9%</h3>
                        <p className="my-1 text-gray-700 text-sm">Infrastructure Uptime</p>
                    </div>

                    <div className={"p-6 rounded-xl border bg-white text-center " + defaultBorderMixin}>
                        <VerifiedUserIcon className="w-8 h-8 mx-auto mb-3 text-orange-600"/>
                        <h3 className="text-2xl font-bold mb-2">24/7</h3>
                        <p className="my-1 text-gray-700 text-sm">Security Monitoring</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    <div className={"p-6 rounded-xl border bg-white " + defaultBorderMixin}>
                        <AccountTreeIcon className="w-8 h-8 mb-4 text-blue-600"/>
                        <h3 className="text-xl font-bold mb-3">Open Source Transparency</h3>
                        <p className="my-1 text-gray-700 text-sm mb-4">
                            Full source code available on GitHub. Audit every line, contribute improvements,
                            or fork for custom needs.
                        </p>
                        <div className="flex items-start text-blue-600 text-sm font-medium">
                            <CheckCircleIcon
                                size={"smallest"}
                                className="mr-2 mt-0.5 flex-shrink-0"/>
                            <span>MIT Licensed</span>
                        </div>
                    </div>

                    <div className={"p-6 rounded-xl border bg-white " + defaultBorderMixin}>
                        <DataObjectIcon className="w-8 h-8 mb-4 text-green-600"/>
                        <h3 className="text-xl font-bold mb-3">Battle-Tested Architecture</h3>
                        <p className="my-1 text-gray-700 text-sm mb-4">
                            Built on the same infrastructure that powers Gmail, YouTube, and millions
                            of mission-critical applications worldwide.
                        </p>
                        <div className="flex items-start text-green-600 text-sm font-medium">
                            <CheckCircleIcon
                                size={"smallest"}
                                className="mr-2 mt-0.5 flex-shrink-0"/>
                            <span>Google Cloud Powered</span>
                        </div>
                    </div>

                    <div className={"p-6 rounded-xl border bg-white " + defaultBorderMixin}>
                        <AppsIcon className="w-8 h-8 mb-4 text-purple-600"/>
                        <h3 className="text-xl font-bold mb-3">Enterprise Support</h3>
                        <p className="my-1 text-gray-700 text-sm mb-4">
                            Professional support plans available with SLAs, dedicated channels,
                            and security consultation services.
                        </p>
                        <div className="flex items-start text-purple-600 text-sm font-medium">
                            <CheckCircleIcon
                                size={"smallest"}
                                className="mr-2 mt-0.5 flex-shrink-0"/>
                            <span>24/7 Support Available</span>
                        </div>
                    </div>
                </div>
            </div>
        </Panel>
    );
}

// Call to Action Section
function CallToActionSection() {
    return (
        <Panel color={"dark_gray"} includePadding={true}>
            <div className="max-w-6xl mx-auto text-center py-12 md:py-16">
                <h2 className="text-3xl font-bold text-white mb-4">
                    Ready to Give It a Try?
                </h2>
                <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
                    Experience unmatched security and control. Join industry leaders who trust FireCMS
                    to keep their data sovereign while delivering powerful content management.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                        href="https://demo.firecms.co"
                        className={"px-8 py-3 rounded-lg transition-all duration-200 " + CTAOutlinedButtonMixin}
                        rel="noopener noreferrer"
                        target="_blank"
                    >
                        Try the Demo
                    </a>
                    <a
                        href="https://app.firecms.co"
                        className={CTAButtonMixin + " inline-flex items-center"}
                    >
                        Register for FireCMS Cloud
                        <CTACaret/>
                    </a>
                </div>
            </div>
        </Panel>
    );
}
