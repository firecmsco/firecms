import React, { useEffect, useMemo } from "react";
import { Container } from "@firecms/ui";
import {
    useCollapsedGroups,
    useCustomizationController,
    useFireCMSContext,
    useNavigationStateController
} from "../../hooks";
import { useBreadcrumbsController } from "../../hooks/useBreadcrumbsController";
import {
    CMSAnalyticsEvent,
    HomePageSection,
    NavigationEntry,
    PluginGenericProps
} from "@firecms/types";
import { NavigationGroup } from "./NavigationGroup";
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
    const context = useFireCMSContext();
    const customizationController = useCustomizationController();
    const navigationController = useNavigationStateController();
    const breadcrumbs = useBreadcrumbsController();

    useEffect(() => {
        breadcrumbs.set({ breadcrumbs: [] });
    }, [breadcrumbs]);

    if (!navigationController.topLevelNavigation)
        throw Error("Navigation not ready");

    const {
        navigationEntries: rawNavigationEntries,
    } = navigationController.topLevelNavigation;

    // Filter to only studio items (exclude "Views" and "Admin" generally)
    const processedGroups = useMemo(() => {
        const entriesByGroup: Record<string, NavigationEntry[]> = {};

        rawNavigationEntries.forEach((e) => {
            if (e.group && e.group !== "Views" && e.group !== "Admin") {
                (entriesByGroup[e.group] ??= []).push(e);
            }
        });

        return Object.entries(entriesByGroup)
            .map(([name, entries]) => ({
                name,
                entries
            }))
            .filter(g => !hiddenGroups?.includes(g.name));
    }, [rawNavigationEntries, hiddenGroups]);

    const groupNames = useMemo(() => processedGroups.map(item => item.name), [processedGroups]);
    const { isGroupCollapsed, toggleGroupCollapsed } = useCollapsedGroups(groupNames, "home");

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
                            <NavigationGroup
                                group={section.title}
                                key={`plugin_section_${plugin.key}`}
                            >
                                {section.children}
                            </NavigationGroup>
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

                <div className="flex flex-col gap-4">
                    {processedGroups.map((groupData, groupIndex) => (
                        <NavigationGroup
                            key={`group-${groupIndex}`}
                            group={groupData.name}
                            collapsed={isGroupCollapsed(groupData.name)}
                            onToggleCollapsed={() => toggleGroupCollapsed(groupData.name)}
                        >
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
                        </NavigationGroup>
                    ))}
                </div>

                {additionalPluginSections}

                {sections && sections.map((section) => (
                    <NavigationGroup
                        key={section.key}
                        group={section.title}
                    >
                        {section.children}
                    </NavigationGroup>
                ))}

                {additionalPluginChildrenEnd}
                {additionalChildrenEnd}
            </Container>
        </div>
    );
}
