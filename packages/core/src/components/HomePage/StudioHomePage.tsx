import React, { useEffect, useMemo } from "react";
import { Container, Typography } from "@rebasepro/ui";
import {
    useCollapsedGroups,
    useCustomizationController,
    useRebaseContext,
    useNavigationStateController
} from "../../hooks";
import { useBreadcrumbsController } from "../../hooks/useBreadcrumbsController";
import {
    CMSAnalyticsEvent,
    CMSView,
    HomePageSection,
    NavigationEntry,
    PluginGenericProps
} from "@rebasepro/types";
import { NavigationCardBinding } from "./NavigationCardBinding";

export function StudioHomePage({
    additionalActions,
    additionalChildrenStart,
    additionalChildrenEnd,
    sections,
    hiddenGroups
}: {
    additionalActions?: React.ReactNode;
    additionalChildrenStart?: React.ReactNode;
    additionalChildrenEnd?: React.ReactNode;
    sections?: HomePageSection[];
    hiddenGroups?: string[];
}) {
    const context = useRebaseContext();
    const customizationController = useCustomizationController();
    const navigationStateController = useNavigationStateController();
    const breadcrumbs = useBreadcrumbsController();

    useEffect(() => {
        breadcrumbs.set({ breadcrumbs: [] });
    }, [breadcrumbs.set]);

    if (!navigationStateController.topLevelNavigation)
        throw Error("Navigation not ready");

    const {
        navigationEntries: rawNavigationEntries,
    } = navigationStateController.topLevelNavigation;

    // Filter to only studio items (exclude "Views" and "Admin" generally)
    const processedGroups = useMemo(() => {
        const entriesByGroup: Record<string, NavigationEntry[]> = {};

        rawNavigationEntries.forEach((e) => {
            if (e.group && e.group !== "Views" && e.group !== "Admin" && !hiddenGroups?.includes(e.group)) {
                (entriesByGroup[e.group] ??= []).push(e);
            }
        });

        return Object.entries(entriesByGroup)
            .map(([name, entries]) => ({
                name,
                entries
            }));
    }, [rawNavigationEntries, hiddenGroups]);

    /* ───────────────────────────────────────────────────────────────
       Plugin extras
       ─────────────────────────────────────────────────────────────── */
    let additionalPluginChildrenStart: React.ReactNode | undefined;
    let additionalPluginChildrenEnd: React.ReactNode | undefined;
    let additionalPluginSections: React.ReactNode | undefined;
    let additionalPluginActions: React.ReactNode | undefined;

    if (customizationController.plugins) {
        const sectionProps: PluginGenericProps = { context };

        additionalPluginSections = (
            <>
                {customizationController.plugins
                    .filter((p) => p.homePage?.includeSection)
                    .map((plugin) => {
                        const section = plugin.homePage!.includeSection!(
                            sectionProps
                        );
                        return (
                            <div key={`plugin_section_${plugin.key}`} className="flex flex-col gap-4 mt-8">
                                <Typography
                                    variant="caption"
                                    color="secondary"
                                    className="px-4 py-2 font-medium uppercase text-sm text-surface-600 dark:text-surface-400"
                                >
                                    {section.title}
                                </Typography>
                                {section.children}
                            </div>
                        );
                    })}
            </>
        );

        additionalPluginChildrenStart = (
            <div className="flex flex-col gap-2">
                {customizationController.plugins
                    .filter((p) => p.homePage?.additionalChildrenStart)
                    .map((plugin, i) => (
                        <div key={`plugin_children_start_${i}`}>
                            {plugin.homePage!.additionalChildrenStart}
                        </div>
                    ))}
            </div>
        );

        additionalPluginChildrenEnd = (
            <div className="flex flex-col gap-2">
                {customizationController.plugins
                    .filter((p) => p.homePage?.additionalChildrenEnd)
                    .map((plugin, i) => (
                        <div key={`plugin_children_end_${i}`}>
                            {plugin.homePage!.additionalChildrenEnd}
                        </div>
                    ))}
            </div>
        );

        // Collect additionalActions from plugins
        additionalPluginActions = (
            <>
                {customizationController.plugins
                    .filter((p) => p.homePage?.additionalActions)
                    .map((plugin, i) => (
                        <React.Fragment key={`plugin_actions_${i}`}>
                            {plugin.homePage!.additionalActions}
                        </React.Fragment>
                    ))}
            </>
        );
    }

    /* ───────────────────────────────────────────────────────────────
       Render
       ─────────────────────────────────────────────────────────────── */
    return (
        <div className="py-2 overflow-auto h-full w-full">
            <Container maxWidth="6xl">
                {/* Search & Actions Area */}
                <div className="w-full sticky py-4 transition-all duration-400 ease-in-out top-0 z-10 flex flex-row gap-4 justify-end">
                    {additionalActions}
                    {additionalPluginActions}
                </div>

                {additionalChildrenStart}
                {additionalPluginChildrenStart}

                <div className="flex flex-col gap-10">
                    {processedGroups.map((groupData) => (
                        <div key={groupData.name} className="flex flex-col gap-4">
                            <Typography
                                variant="caption"
                                color="secondary"
                                className="px-4 py-2 font-medium uppercase text-sm text-surface-600 dark:text-surface-400"
                            >
                                {groupData.name}
                            </Typography>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {groupData.entries.map((entry) => (
                                    <NavigationCardBinding
                                        key={entry.url}
                                        {...entry}
                                        onClick={() => {
                                            let event: CMSAnalyticsEvent = "unmapped_event";
                                            if (entry.type === "collection") event = "home_navigate_to_collection";
                                            else if (entry.type === "view") event = "home_navigate_to_view";
                                            else if (entry.type === "admin") event = "home_navigate_to_admin_view";

                                            context.analyticsController?.onAnalyticsEvent?.(event, { path: entry.slug });
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}

                    <div className="flex flex-col gap-4">
                        <Typography
                            variant="caption"
                            color="secondary"
                            className="px-4 py-2 font-medium uppercase text-sm text-surface-600 dark:text-surface-400"
                        >
                            Workspace Admin
                        </Typography>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <NavigationCardBinding
                                id="users"
                                slug="users"
                                group="Admin"
                                url="/users"
                                name="Users"
                                description="Manage developers & roles in the workspace"
                                view={{ icon: "group" } as Partial<CMSView> as CMSView}
                                type="admin"
                            />

                            <NavigationCardBinding
                                id="roles"
                                slug="roles"
                                group="Admin"
                                url="/roles"
                                name="Roles"
                                description="Manage fine-grained access configurations"
                                view={{ icon: "admin_panel_settings" } as Partial<CMSView> as CMSView}
                                type="admin"
                            />
                        </div>
                    </div>
                </div>

                {additionalPluginSections}

                {sections && sections.map((section) => (
                    <div key={section.key} className="flex flex-col gap-4 mt-8">
                        <h3 className="text-xl font-medium tracking-tight border-b border-surface-200 dark:border-surface-700 pb-2">
                            {section.title}
                        </h3>
                        {section.children}
                    </div>
                ))}

                {additionalPluginChildrenEnd}
                {additionalChildrenEnd}
            </Container>
        </div>
    );
}
