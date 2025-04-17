import React from "react";
import Layout from "@theme/Layout";
import { Hero } from "../partials/general/Hero";
import { Panel } from "../partials/general/Panel";
import { TwoColumns } from "../partials/general/TwoColumns";
import Head from "@docusaurus/Head";
import { defaultBorderMixin } from "../partials/styles";
import { TechSplash } from "../partials/home/TechSplash";
import HeroButtons from "../partials/home/HeroButtons";
import { Companies } from "../partials/home/Companies";
import { EnterpriseFeatures } from "../partials/enterprise/EnterpriseFeatures";
import { QuotesSection } from "../partials/Quotes";
import ProTeaser from "../partials/home/ProTeaser";

function StartupsPage() {
    return (
        <Layout
            title={"For Startups - FireCMS"}
            description="FireCMS helps startups move fast and scale content management without the technical overhead">
            <Head>
                <meta property="og:title" content="FireCMS for Startups - Firestore/Firebase headless CMS"/>
                <meta property="og:description"
                      content="FireCMS helps startups move fast and scale content management without the technical overhead"/>
                <meta property="og:image" content="/img/firecms_logo.svg"/>
            </Head>

            <div className="flex flex-col min-h-screen">
                <main className="flex-grow">
                    <Hero
                        title={
                            <>
                                <span className="block lg:inline">Move Fast, Scale Smart</span>
                            </>
                        }
                        subtitle={
                            <>
                                <p>
                                    Get your startup&#39;s admin panel and content management up and running <b>in
                                    hours, not weeks</b>.
                                    Focus on building your product while we handle the backend.
                                </p>
                            </>
                        }
                    />

                    <Panel color={"light"} includePadding={true}>
                        <div className="max-w-5xl mx-auto text-center mb-12">
                            <h2 className="text-3xl font-bold mb-6">Built for Startup Speed</h2>
                            <p className="text-xl">
                                When you're racing against the clock and burning through runway,
                                you need tools that accelerate development without compromising quality.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                            <div className={"p-6 rounded-xl border shadow-sm " + defaultBorderMixin}>
                                <h3 className="text-xl font-bold mb-3">Launch in Days</h3>
                                <p className="text-gray-700">
                                    Set up your entire content management system in minutes, not weeks.
                                    No backend development required.
                                </p>
                            </div>
                            <div className={"p-6 rounded-xl border shadow-sm " + defaultBorderMixin}>
                                <h3 className="text-xl font-bold mb-3">Scale with Demand</h3>
                                <p className="text-gray-700">
                                    From MVP to unicorn - FireCMS scales automatically with your user base
                                    without infrastructure headaches.
                                </p>
                            </div>
                            <div className={"p-6 rounded-xl border shadow-sm " + defaultBorderMixin}>
                                <h3 className="text-xl font-bold mb-3">No code/low-code</h3>
                                <p className="text-gray-700">
                                    Do more with your engineering resources. Customize your admin panel
                                    with code or use our low-code options to get started quickly.
                                </p>
                            </div>
                        </div>
                    </Panel>

                    <Panel color={"white"}>
                        <TwoColumns
                            reverseSmall={false}
                            right={
                                <div className="p-4">
                                    <div className="aspect-video bg-gray-100 rounded-xl border overflow-hidden">
                                        {/* Image placeholder - replace with startup-focused screenshot */}
                                        <div className="h-full flex items-center justify-center bg-gray-200">
                                            <span className="text-gray-500">Startup Dashboard Preview</span>
                                        </div>
                                    </div>
                                </div>
                            }
                            left={
                                <div className="p-4">
                                    <div className="flex items-center mb-3">
                                        <h3 className="m-0 ">
                                            Perfect for Limited Resources
                                        </h3>
                                    </div>
                                    <p className="text-xl md:text-2xl">
                                        Startups don&#39;t have the luxury of dedicated CMS teams.
                                        FireCMS gives you enterprise-grade content management without the enterprise
                                        price tag or complexity.
                                    </p>
                                    <p className="text-xl">
                                        Your small technical team can focus on core product features while still
                                        delivering
                                        powerful admin tools to your operations team.
                                    </p>
                                </div>
                            }
                        />
                    </Panel>

                    <Panel color={"lighter"}>
                        <TwoColumns
                            reverseSmall={true}
                            left={
                                <div className="p-4">
                                    <div className="aspect-video bg-gray-100 rounded-xl border overflow-hidden">
                                        {/* Image placeholder - replace with pivot/flexibility screenshot */}
                                        <div className="h-full flex items-center justify-center bg-gray-200">
                                            <span className="text-gray-500">Schema Editor Preview</span>
                                        </div>
                                    </div>
                                </div>
                            }
                            right={
                                <div className="p-4">
                                    <div className="flex items-center mb-3">
                                        <h3 className="m-0 ">
                                            Built for Pivots
                                        </h3>
                                    </div>
                                    <p className="text-xl md:text-2xl">
                                        Startups pivot. Your CMS should keep up. FireCMS makes it easy to adjust
                                        your data models as your business evolves.
                                    </p>
                                    <p className="text-xl">
                                        Change your data schema, add new content types, or restructure your entire
                                        information architecture without rebuilding from scratch.
                                    </p>
                                </div>
                            }
                        />
                    </Panel>

                    <Panel color={"white"}>
                        <div className="max-w-5xl mx-auto py-16 px-4">
                            <h2 className="text-3xl font-bold mb-8 text-center">Startup Success Stories</h2>
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className={"p-6 rounded-xl border " + defaultBorderMixin}>
                                    <h3 className="text-xl font-bold mb-3">From MVP to Series A</h3>
                                    <p className="mb-4">
                                        &#34;FireCMS helped us launch our content platform MVP in just two weeks. As we
                                        raised our
                                        Series A and scaled to thousands of users, it grew with us seamlessly.&#34;
                                    </p>
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
                                        <div>
                                            <p className="font-bold m-0">Sarah Chen</p>
                                            <p className="text-sm text-gray-600 m-0">CTO, ContentScale</p>
                                        </div>
                                    </div>
                                </div>

                                <div className={"p-6 rounded-xl border " + defaultBorderMixin}>
                                    <h3 className="text-xl font-bold mb-3">Extending the Runway</h3>
                                    <p className="mb-4">
                                        &#34;We saved at least $150K in development costs by using FireCMS instead of
                                        building
                                        our admin tools from scratch. That&#39;s another 3 months of runway for our
                                        startup.&#34;
                                    </p>
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
                                        <div>
                                            <p className="font-bold m-0">Michael Rodriguez</p>
                                            <p className="text-sm text-gray-600 m-0">Founder, LaunchFast</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Panel>

                    <QuotesSection/>
                    <Companies/>

                    <Panel color={"gray"}>
                        <div className="max-w-5xl mx-auto py-16 px-4">
                            <div className="text-center mb-12">
                                <h2 className="text-3xl font-bold mb-4">Startup-Friendly Features</h2>
                                <p className="text-xl">Everything you need, nothing you don&#39;t.</p>
                            </div>

                            <div className="grid md:grid-cols-3 gap-8">
                                <div className={"p-6 rounded-xl border " + defaultBorderMixin}>
                                    <h3 className="text-xl font-bold mb-3">Firebase Integration</h3>
                                    <p>
                                        Built on Firebase&#39;s reliable infrastructure, giving you enterprise-grade
                                        uptime and security without the enterprise price tag.
                                    </p>
                                </div>
                                <div className={"p-6 rounded-xl border  " + defaultBorderMixin}>
                                    <h3 className="text-xl font-bold mb-3">No Server Management</h3>
                                    <p>
                                        Zero server infrastructure to manage. Focus on building features instead
                                        of maintaining backend systems.
                                    </p>
                                </div>
                                <div className={"p-6 rounded-xl border " + defaultBorderMixin}>
                                    <h3 className="text-xl font-bold mb-3">Schema Editor</h3>
                                    <p>
                                        Visual schema building means even non-technical founders can adjust data
                                        models without developer intervention.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Panel>

                    <TechSplash/>


                    <EnterpriseFeatures/>

                    <Panel color={"white"} includePadding={true}>
                        <HeroButtons/>
                    </Panel>

                    <ProTeaser/>
                </main>
            </div>
        </Layout>
    );
}

export default StartupsPage;
