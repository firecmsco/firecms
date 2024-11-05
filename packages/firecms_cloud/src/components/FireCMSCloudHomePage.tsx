import React from "react";
import {
    DefaultHomePage,
    IconForView,
    NavigationGroup,
    SmallNavigationCard,
    useCustomizationController,
    useNavigationController
} from "@firecms/core";
import { SubscriptionPlanWidget } from "./subscriptions";
import { ADMIN_VIEWS_CONFIG } from "../utils";

/**
 * Default entry view for the CMS under the path "/"
 * This component takes navigation as an input and renders cards
 * for each entry, including title and description.

 * @group Components
 */
export function FireCMSCloudHomePage() {

    const navigation = useNavigationController();
    const { plugins } = useCustomizationController();

    const pluginActions: React.ReactNode[] = [];
    if (plugins) {
        pluginActions.push(...plugins.map((plugin, i) => (
            <React.Fragment key={plugin.key}>{plugin.homePage?.additionalActions ?? null}</React.Fragment>
        )).filter(Boolean));
    }
    const showSubscriptionWidget = (navigation.collections ?? []).length > 0;
    return <DefaultHomePage
        additionalActions={<> {pluginActions} </>}
        additionalChildrenStart={showSubscriptionWidget
            ? <SubscriptionPlanWidget showForPlans={["free"]}/>
            : undefined}
        additionalChildrenEnd={
            <NavigationGroup group={"ADMIN"}>
                <div className={"grid grid-cols-12 gap-2"}>
                    {ADMIN_VIEWS_CONFIG.map((view) => <div className={"col-span-12 sm:col-span-6 lg:col-span-4"}
                                                           key={`nav_${view.path}`}>
                        <SmallNavigationCard
                            name={view.name}
                            url={view.path}
                            icon={<IconForView collectionOrView={view}
                                               className={"text-surface-400 dark:text-surface-600"}/>}/>
                    </div>)}
                </div>
            </NavigationGroup>
        }/>;
}
