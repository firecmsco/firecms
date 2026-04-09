import type { HomePageSection, PluginGenericProps } from "@rebasepro/types";
import React, { useEffect } from "react";
import { ArrowForwardIcon, Card, cls, Container, Typography } from "@rebasepro/ui";
import { IconForView, useRebaseContext, useRestoreScroll, useSlot } from "@rebasepro/core";
import { useNavigate } from "react-router-dom";
import { useBreadcrumbsController } from "../../index";

/* ═══════════════════════════════════════════════════════════════
   Static studio tool definitions
   ═══════════════════════════════════════════════════════════════ */

interface StudioTool {
    path: string;
    name: string;
    description: string;
    icon: string;
}

interface StudioSection {
    label: string;
    dotColor: string;
    iconColor: string;
    tools: StudioTool[];
}

const SECTIONS: StudioSection[] = [
    {
        label: "Database",
        dotColor: "bg-blue-400",
        iconColor: "text-blue-400",
        tools: [
            { path: "/sql", name: "SQL Console", description: "Execute raw SQL queries directly against your database", icon: "terminal" },
            { path: "/js", name: "JS Console", description: "Run JavaScript with the Rebase SDK in a live sandbox", icon: "code" },
            { path: "/rls", name: "RLS Policies", description: "Configure Row Level Security for fine-grained data access", icon: "security" },
        ],
    },
    {
        label: "Schema & Data",
        dotColor: "bg-violet-400",
        iconColor: "text-violet-400",
        tools: [
            { path: "/schema", name: "Collections", description: "Define and manage your data model and collection schemas", icon: "view_list" },
            { path: "/storage", name: "Storage", description: "Browse, upload, and manage files in your storage bucket", icon: "cloud" },
        ],
    },
    {
        label: "Administration",
        dotColor: "bg-amber-400",
        iconColor: "text-amber-400",
        tools: [
            { path: "/users", name: "Users", description: "Manage developers and assign roles in your workspace", icon: "group" },
            { path: "/roles", name: "Roles", description: "Create and configure fine-grained access permissions", icon: "admin_panel_settings" },
        ],
    },
];

/* ═══════════════════════════════════════════════════════════════ */

export function StudioHomePage({
    additionalActions,
    additionalChildrenStart,
    additionalChildrenEnd,
    sections,
    hiddenGroups,
}: {
    additionalActions?: React.ReactNode;
    additionalChildrenStart?: React.ReactNode;
    additionalChildrenEnd?: React.ReactNode;
    sections?: HomePageSection[];
    hiddenGroups?: string[];
}) {
    const context = useRebaseContext();
    const breadcrumbs = useBreadcrumbsController();
    const navigate = useNavigate();

    useEffect(() => {
        breadcrumbs.set({ breadcrumbs: [] });
    }, [breadcrumbs.set]);

    const { containerRef } = useRestoreScroll();

    const sectionProps: PluginGenericProps = { context };
    const pluginChildrenStart = useSlot("home.children.start", sectionProps);
    const pluginChildrenEnd = useSlot("home.children.end", sectionProps);
    const pluginActions = useSlot("home.actions", sectionProps);

    return (
        <div ref={containerRef} className="py-2 overflow-auto h-full w-full">
            <Container maxWidth="6xl">

                {(additionalActions || pluginActions) && (
                    <div className="w-full sticky py-4 transition-all duration-400 ease-in-out top-0 z-10 flex flex-row gap-4 justify-end">
                        {additionalActions}
                        {pluginActions}
                    </div>
                )}

                {additionalChildrenStart}
                {pluginChildrenStart}

                {/* ── Tool sections ── */}
                <div className="flex flex-col gap-8 pt-2">
                    {SECTIONS.map((section) => (
                        <section key={section.label} aria-label={section.label}>
                            {/* Section header */}
                            <Typography
                                variant="caption"
                                component="h2"
                                color="secondary"
                                className="py-2 font-medium uppercase text-sm text-surface-600 dark:text-surface-400"
                            >
                                {section.label}
                            </Typography>

                            {/* Card grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
                                {section.tools.map((tool) => (
                                    <Card
                                        key={tool.path}
                                        onClick={() => {
                                            navigate(tool.path);
                                            context.analyticsController?.onAnalyticsEvent?.(
                                                "home_navigate_to_view",
                                                { path: tool.path }
                                            );
                                        }}
                                        className={cls(
                                            "h-full px-4 py-2.5 cursor-pointer transition-all duration-200 ease-in-out",
                                            "hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary/5"
                                        )}
                                    >
                                        <div className="flex flex-col items-start h-full">
                                            <div className="grow w-full">
                                                {/* Icon */}
                                                <div className={cls("h-6 flex items-center", section.iconColor)}>
                                                    <IconForView
                                                        collectionOrView={{ slug: tool.path, name: tool.name, icon: tool.icon }}
                                                        size="small"
                                                    />
                                                </div>

                                                {/* Title */}
                                                <Typography
                                                    gutterBottom
                                                    variant="subtitle1"
                                                    className="mt-1 font-semibold"
                                                    component="h2"
                                                >
                                                    {tool.name}
                                                </Typography>

                                                {/* Description */}
                                                <Typography variant="caption" color="secondary" component="div">
                                                    {tool.description}
                                                </Typography>
                                            </div>

                                            {/* Arrow */}
                                            <div style={{ alignSelf: "flex-end" }}>
                                                <div className="p-2">
                                                    <ArrowForwardIcon className="text-primary" size="small" />
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>

                {/* ── SDK Quick Start ── */}
                <div className="mt-10 mb-6">
                    <div className="flex items-center mb-1">
                        <Typography
                            variant="caption"
                            component="h2"
                            color="secondary"
                            className="py-2 font-medium uppercase text-sm text-surface-600 dark:text-surface-400"
                        >
                            Quick Start
                        </Typography>
                    </div>

                    <Typography variant="body2" color="secondary" className="mb-4 max-w-2xl">
                        Generate a fully-typed SDK from your collections with{" "}
                        <code className="text-emerald-400 font-mono text-xs bg-emerald-400/10 px-1.5 py-0.5 rounded">
                            npx rebase generate-sdk
                        </code>
                        {" "}and start querying your data with full TypeScript autocompletion.
                    </Typography>

                    <div className="rounded-lg border border-surface-200/40 dark:border-surface-700/40 bg-white dark:bg-surface-950 overflow-hidden">
                        {/* Title bar */}
                        <div className="flex items-center justify-between px-4 py-2.5 border-b border-surface-200/40 dark:border-surface-700/40 bg-surface-50 dark:bg-surface-900/80">
                            <div className="flex items-center gap-2.5">
                                <div className="flex gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
                                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400/60" />
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/60" />
                                </div>
                                <span className="text-xs font-mono text-surface-400 dark:text-surface-500 ml-1">
                                    app.ts
                                </span>
                            </div>
                            <span className="text-xs font-mono text-surface-400 dark:text-surface-500">
                                TypeScript
                            </span>
                        </div>

                        {/* Syntax-highlighted code */}
                        <div className="px-5 py-4 overflow-x-auto text-[13px] leading-6 font-mono">
                            <SyntaxHighlightedSnippet />
                        </div>
                    </div>
                </div>

                {/* ── Extra sections from props ── */}
                {sections?.map((s) => (
                    <div key={s.key} className="my-10">
                        <Typography
                            variant="caption"
                            component="h2"
                            color="secondary"
                            className="p-4 py-2 rounded font-medium uppercase text-sm text-surface-600 dark:text-surface-400"
                        >
                            {s.title}
                        </Typography>
                        <div className="mt-4">{s.children}</div>
                    </div>
                ))}

                {pluginChildrenEnd}
                {additionalChildrenEnd}
            </Container>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   Hand-crafted syntax-highlighted code snippet.
   Uses inline spans with Tailwind color classes to avoid
   pulling in a syntax highlighting library.
   ═══════════════════════════════════════════════════════════════ */

function SyntaxHighlightedSnippet() {
    const kw = "text-violet-400";       // keywords
    const str = "text-emerald-400";     // strings
    const typ = "text-amber-300";       // types
    const fn = "text-blue-400";          // functions
    const cm = "text-surface-500 italic"; // comments
    const op = "text-surface-400";       // operators / punctuation
    const tx = "text-surface-200";       // plain text

    return (
        <pre className="m-0 whitespace-pre">
            <span className={kw}>import</span>
            <span className={tx}>{" { "}</span>
            <span className={fn}>createRebaseClient</span>
            <span className={tx}>{" } "}</span>
            <span className={kw}>from</span>
            <span className={tx}> </span>
            <span className={str}>'@rebasepro/client'</span>
            <span className={op}>;</span>
            {"\n"}

            <span className={kw}>import</span>
            <span className={tx}> </span>
            <span className={kw}>type</span>
            <span className={tx}>{" { "}</span>
            <span className={typ}>Database</span>
            <span className={tx}>{" } "}</span>
            <span className={kw}>from</span>
            <span className={tx}> </span>
            <span className={str}>'./database.types'</span>
            <span className={op}>;</span>
            {"\n\n"}

            <span className={kw}>const</span>
            <span className={tx}> rebase </span>
            <span className={op}>= </span>
            <span className={fn}>createRebaseClient</span>
            <span className={op}>{"<"}</span>
            <span className={typ}>Database</span>
            <span className={op}>{">("}</span>
            <span className={tx}>{"{"}</span>
            {"\n"}
            <span className={tx}>{"    baseUrl"}</span>
            <span className={op}>: </span>
            <span className={str}>'http://localhost:3001'</span>
            <span className={op}>,</span>
            {"\n"}
            <span className={tx}>{"}"}</span>
            <span className={op}>);</span>
            {"\n\n"}

            <span className={cm}>{"// Fully typed — autocompletion for tables and columns"}</span>
            {"\n"}
            <span className={kw}>const</span>
            <span className={tx}>{" { "}</span>
            <span className={tx}>data</span>
            <span className={op}>: </span>
            <span className={tx}>users</span>
            <span className={tx}>{" } "}</span>
            <span className={op}>= </span>
            <span className={kw}>await</span>
            <span className={tx}> rebase</span>
            <span className={op}>.</span>
            <span className={tx}>data</span>
            <span className={op}>.</span>
            <span className={tx}>users</span>
            <span className={op}>.</span>
            <span className={fn}>find</span>
            <span className={op}>();</span>
            {"\n"}

            <span className={kw}>const</span>
            <span className={tx}>{" { "}</span>
            <span className={tx}>data</span>
            <span className={op}>: </span>
            <span className={tx}>posts</span>
            <span className={tx}>{" } "}</span>
            <span className={op}>= </span>
            <span className={kw}>await</span>
            <span className={tx}> rebase</span>
            <span className={op}>.</span>
            <span className={tx}>data</span>
            <span className={op}>.</span>
            <span className={fn}>collection</span>
            <span className={op}>(</span>
            <span className={str}>'posts'</span>
            <span className={op}>)</span>
            <span className={op}>.</span>
            <span className={fn}>find</span>
            <span className={op}>();</span>
        </pre>
    );
}
