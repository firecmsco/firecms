import React from "react";
import Layout from "@theme/Layout";
import Head from "@docusaurus/Head";

// @ts-ignore
import UsersImage from "@site/static/img/users_table.png";
// @ts-ignore
import WidgetsImage from "@site/static/img/widgets.png";

import {
    AccountTreeIcon,
    AdminPanelSettingsIcon,
    ArticleIcon,
    BuildIcon,
    CloudOffIcon,
    CodeIcon,
    EditIcon,
    ExtensionIcon,
    GroupIcon,
    ManageAccountsIcon,
    RocketLaunchIcon,
    SchemaIcon,
    SettingsApplicationsIcon,
    ShoppingCartIcon,
    StorageIcon,
    SyncAltIcon,
    SyncIcon,
    TrendingUpIcon,
    TuneIcon
} from "@firecms/ui";

// Your existing partial imports
import { Hero } from "../partials/general/Hero";
import { Panel } from "../partials/general/Panel";
import { TwoColumns } from "../partials/general/TwoColumns";
import { defaultBorderMixin } from "../partials/styles";
import HeroButtons from "../partials/home/HeroButtons";
import { StartupLogos } from "../partials/home/StartupLogos";
import { QuotesSection } from "../partials/Quotes";
import ProTeaser from "../partials/home/ProTeaser";
import { ManageYour } from "../partials/home/ManageYour";
import { ScreenshotsMarquee } from "../partials/pro/ProInfo";
import { UsageExamples } from "../partials/UsageExamples";

// Remove the IconPlaceholder component definition

function StartupsPage() {
    return (
        <Layout
            title={"FireCMS for Startups: Build Admin Panels & CMS Faster"}
            description="Launch Firebase/MongoDB admin panels & CMS in hours, not weeks. Save developer resources, focus on your core product, and scale smarter with FireCMS."
        >
            <Head>
                <meta property="og:title" content="FireCMS for Startups - Move Fast, Scale Smart"/>
                <meta property="og:description"
                      content="The open-source Headless CMS and Admin Panel builder for startups using Firebase or MongoDB. Build powerful back-office tools 10x faster."/>
                <meta property="og:image" content="/img/firecms_logo.svg"/>
            </Head>

            <div className="flex flex-col min-h-screen">
                <main className="flex-grow">
                    {/* Section 1: Hero */}
                    <Hero
                        title={
                            <>
                                <span className="block lg:inline">Move Fast, Scale Smart</span>
                            </>
                        }
                        subtitleColor={"gray"}
                        subtitle={
                            <>
                                <p className="text-xl md:text-2xl mb-4">
                                    Get your startup&#39;s admin panel and content management up <b>in
                                    hours, not weeks</b>. Focus on your product, we handle your back-office.
                                </p>
                            </>
                        }
                    />

                    <StartupLogos/>

                    <ManageYour/>

                    {/* Section 2: Startup Challenge - Icon Added */}
                    <Panel color={"lighter"}>

                        <div className="p-4">
                            <div className="flex items-center mb-4">
                                <GroupIcon className="mr-3 text-blue-600"/>
                                <h3 className="m-0 text-3xl font-bold">
                                    Limited Resources? Perfect Fit.
                                </h3>
                            </div>
                            <p className="text-xl md:text-2xl mb-4">
                                Startups juggle time, budget, and dev power. Building internal tools drains
                                focus from your core product. Generic tools often fall short or get pricey.
                            </p>
                            <p className="text-lg">
                                FireCMS gives you enterprise-grade tooling without the overhead. Empower your
                                small team to deliver powerful admin interfaces while engineers build what
                                matters most.
                            </p>
                        </div>


                        <div
                            className="rounded-xl border overflow-hidden shadow-md mt-8 mb-24">
                            <img
                                src={UsersImage}
                                alt="Screenshot of FireCMS Admin Panel managing User Data"
                                className="h-full w-full object-cover"
                            />
                        </div>

                    </Panel>


                    {/* Section 3: Startup Velocity - Icons Added */}
                    <Panel color={"light"} includePadding={true}>
                        <div className="max-w-5xl mx-auto text-center mb-12">
                            <h2 className="text-3xl font-bold mb-4">Built for Startup Speed</h2>
                            <p className="text-xl">
                                Accelerate development without sacrificing quality. FireCMS is designed for velocity:
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-24">
                            {/* Card 1: Launch */}
                            <div className={"p-6 rounded-xl border shadow-sm bg-white " + defaultBorderMixin}>
                                <RocketLaunchIcon className="w-10 h-10 mb-3 text-green-600"/>
                                <h3 className="text-xl font-bold mb-2">Launch in minutes</h3>
                                <p className="text-gray-700">
                                    Set up powerful CMS/admin panels rapidly via UI or schema. No backend coding needed
                                    for Firebase/MongoDB.
                                </p>
                            </div>
                            {/* Card 2: Scale */}
                            <div className={"p-6 rounded-xl border shadow-sm bg-white " + defaultBorderMixin}>
                                <TrendingUpIcon className="w-10 h-10 mb-3 text-indigo-600"/>
                                <h3 className="text-xl font-bold mb-2">Scale with Demand</h3>
                                <p className="text-gray-700">
                                    From MVP to unicorn, FireCMS scales effortlessly on Firebase/MongoDB&#39;s
                                    serverless
                                    infrastructure. No ops headaches.
                                </p>
                            </div>
                            {/* Card 3: Flexibility */}
                            <div className={"p-6 rounded-xl border shadow-sm bg-white " + defaultBorderMixin}>
                                <TuneIcon className="w-10 h-10 mb-3 text-purple-600"/>
                                <h3 className="text-xl font-bold mb-2">No/Low-Code Flexibility</h3>
                                <p className="text-gray-700">
                                    Use low-code options for speed, or customize deeply with React. Empower non-tech
                                    teams to manage data.
                                </p>
                            </div>
                        </div>

                    </Panel>

                    <UsageExamples/>

                    {/* Section 4: Adaptability - Icon Added */}
                    <Panel color={"lighter"}>
                        <TwoColumns
                            reverseSmall={true}
                            left={
                                <div
                                    className="rounded-xl border overflow-hidden shadow-md">
                                    <img
                                        src={WidgetsImage}
                                        alt="Screenshot of FireCMS Admin Panel managing Widgets"
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                            }
                            right={
                                <div className="p-4">
                                    <div className="flex items-center mb-4">
                                        {/* Replaced Icon */}
                                        <SyncAltIcon className="mr-3 text-pink-600"/>
                                        <h3 className="m-0 text-3xl font-bold">
                                            Built for Pivots
                                        </h3>
                                    </div>
                                    <p className="text-xl md:text-2xl mb-4">
                                        Startups evolve. Your tools should too. FireCMS makes adapting your data models
                                        easy.
                                    </p>
                                    <ul className="text-lg space-y-2 list-disc list-inside">
                                        <li><b>Change schemas, add content types,</b> or restructure without rebuilding.
                                        </li>
                                        <li>Adapts to your <b>existing database structure</b> - great for ongoing
                                            projects.
                                        </li>
                                        <li>Headless architecture <b>decouples backend/frontend </b>for flexibility
                                            (web,
                                            mobile, multi-channel).
                                        </li>
                                        <li>Allows independent frontend/backend development workflows.</li>
                                    </ul>
                                </div>
                            }
                        />
                    </Panel>

                    {/* Testimonials & Companies */}
                    <QuotesSection/>

                    {/* Section 5: Startup-Friendly Features - Icons Added */}
                    <Panel color={"gray"}>
                        <div className="max-w-5xl mx-auto py-16 px-4">
                            <div className="text-center mb-12">
                                <h2 className="text-3xl font-bold mb-4">Startup-Friendly Features</h2>
                                <p className="text-xl">Everything you need, nothing you don&#39;t.</p>
                            </div>

                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Feature Items with Icons */}
                                <div className={"p-5 rounded-lg border bg-gray-900 " + defaultBorderMixin}>
                                    <div className="flex items-start space-x-3">
                                        <StorageIcon className="w-6 h-6 text-white flex-shrink-0 mt-1"/>
                                        <div>
                                            <h3 className="text-lg font-semibold mb-1">Firebase/MongoDB Native</h3>
                                            <p className="text-sm text-gray-100">Leverages their real-time sync,
                                                security, and scalability directly.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className={"p-5 rounded-lg border bg-gray-900 " + defaultBorderMixin}>
                                    <div className="flex items-start space-x-3">
                                        <CloudOffIcon className="w-6 h-6 text-white flex-shrink-0 mt-1"/>
                                        <div>
                                            <h3 className="text-lg font-semibold mb-1">Zero Server Management</h3>
                                            <p className="text-sm text-gray-100">Focus on features, not infrastructure
                                                (with Firebase/MongoDB).</p>
                                        </div>
                                    </div>
                                </div>
                                <div className={"p-5 rounded-lg border bg-gray-900 " + defaultBorderMixin}>
                                    <div className="flex items-start space-x-3">
                                        {/* Note: If SchemaIcon isn't available, use EditNoteIcon or similar */}
                                        <SchemaIcon className="w-6 h-6 text-white flex-shrink-0 mt-1"/>
                                        <div>
                                            <h3 className="text-lg font-semibold mb-1">Schema Editor & Inference</h3>
                                            <p className="text-sm text-gray-100">Visual building & auto-detection adapt
                                                to your data fast.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className={"p-5 rounded-lg border bg-gray-900 " + defaultBorderMixin}>
                                    <div className="flex items-start space-x-3">
                                        <EditIcon className="w-6 h-6 text-white flex-shrink-0 mt-1"/>
                                        <div>
                                            <h3 className="text-lg font-semibold mb-1">Powerful Editing Tools</h3>
                                            <p className="text-sm text-gray-100">Spreadsheet & form views, file storage,
                                                references, and more.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className={"p-5 rounded-lg border bg-gray-900 " + defaultBorderMixin}>
                                    <div className="flex items-start space-x-3">
                                        <AdminPanelSettingsIcon className="w-6 h-6 text-white flex-shrink-0 mt-1"/>
                                        <div>
                                            <h3 className="text-lg font-semibold mb-1">Role-Based Access Control</h3>
                                            <p className="text-sm text-gray-100">Configure views and permissions per
                                                user role easily.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className={"p-5 rounded-lg border bg-gray-900 " + defaultBorderMixin}>
                                    <div className="flex items-start space-x-3">
                                        <ExtensionIcon className="w-6 h-6 text-white flex-shrink-0 mt-1"/>
                                        <div>
                                            <h3 className="text-lg font-semibold mb-1">Flexible Customization</h3>
                                            <p className="text-sm text-gray-100">Add custom fields, logic, hooks, and
                                                full React views.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className={"p-5 rounded-lg border bg-gray-900 " + defaultBorderMixin}>
                                    <div className="flex items-start space-x-3">
                                        <AccountTreeIcon className="w-6 h-6 text-white flex-shrink-0 mt-1"/>
                                        <div>
                                            <h3 className="text-lg font-semibold mb-1">Subcollection Support</h3>
                                            <p className="text-sm text-gray-100">Seamlessly manage nested data
                                                structures.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className={"p-5 rounded-lg border bg-gray-900 " + defaultBorderMixin}>
                                    <div className="flex items-start space-x-3">
                                        <SyncIcon className="w-6 h-6 text-white flex-shrink-0 mt-1"/>
                                        <div>
                                            <h3 className="text-lg font-semibold mb-1">Real-Time Updates</h3>
                                            <p className="text-sm text-gray-100">Live data sync across the CMS for
                                                collaboration.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className={"p-5 rounded-lg border bg-gray-900 " + defaultBorderMixin}>
                                    <div className="flex items-start space-x-3">
                                        <CodeIcon className="w-6 h-6 text-white flex-shrink-0 mt-1"/>
                                        <div>
                                            <h3 className="text-lg font-semibold mb-1">Open-Source Core</h3>
                                            <p className="text-sm text-gray-100">Transparency, community, and no vendor
                                                lock-in for essentials.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Panel>

                    <div className={"relative bg-gray-900 text-gray-200 py-16"}>
                        <ScreenshotsMarquee/>
                    </div>

                    {/* Section 6: More Than Just a CMS - Icons Added to list */}
                    <Panel color={"white"} includePadding={true}>
                        <div className="max-w-5xl mx-auto text-center py-12 px-4">
                            <h2 className="text-3xl font-bold mb-6">More Than Just a CMS</h2>
                            <p className="text-xl mb-8">
                                Extend FireCMS to build the custom internal tools your startup needs:
                            </p>
                            <ul className="text-left mx-auto max-w-2xl text-lg space-y-4">
                                <li className="flex items-start">
                                    <BuildIcon className="w-5 h-5 mr-3 text-blue-500 flex-shrink-0 mt-1"/>
                                    <span><b>Internal Tools:</b> Tailored dashboards for support, ops, sales, or data admin on your backend.</span>
                                </li>
                                <li className="flex items-start">
                                    <ArticleIcon className="w-5 h-5 mr-3 text-green-500 flex-shrink-0 mt-1"/>
                                    <span><b>Headless Content:</b> Manage content for web/mobile apps, marketing sites, blogs, docs.</span>
                                </li>
                                <li className="flex items-start">
                                    <ManageAccountsIcon className="w-5 h-5 mr-3 text-purple-500 flex-shrink-0 mt-1"/>
                                    <span><b>User Management:</b> View, edit, and manage user profiles and permissions.</span>
                                </li>
                                <li className="flex items-start">
                                    <ShoppingCartIcon className="w-5 h-5 mr-3 text-red-500 flex-shrink-0 mt-1"/>
                                    <span><b>Product/E-commerce Data:</b> Manage catalogs, variants, pricing, inventory easily.</span>
                                </li>
                                <li className="flex items-start">
                                    <SettingsApplicationsIcon
                                        className="w-5 h-5 mr-3 text-yellow-500 flex-shrink-0 mt-1"/>
                                    <span><b>App Configuration:</b> Control settings, feature flags, or A/B tests via a UI.</span>
                                </li>
                            </ul>
                            <p className="text-md mt-8 text-gray-600">
                                Sensible defaults meet powerful customization.
                            </p>
                        </div>
                    </Panel>

                    {/* HeroButtons */}
                    <Panel color={"light"} includePadding={true}>
                        <HeroButtons/>
                    </Panel>

                    {/* ProTeaser */}
                    <ProTeaser
                        // description="Need self-hosting and full customization? FireCMS PRO offers deep extensibility. Prefer a managed solution? Explore FireCMS Cloud."
                        // proLink="/pro"
                        // cloudLink="https://app.firecms.co"
                    />

                </main>
            </div>
        </Layout>
    );
}

export default StartupsPage;
