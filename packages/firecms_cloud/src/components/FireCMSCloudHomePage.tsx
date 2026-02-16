import React from "react";
import {
    DefaultHomePage,
    IconForView,
    NavigationGroup,
    SmallNavigationCard,
    useNavigationController
} from "@firecms/core";
import { Paywall, SubscriptionPlanWidget } from "./subscriptions";
import { ADMIN_VIEWS_CONFIG } from "../utils";
import { useProjectConfig } from "../hooks";
import { CenteredView } from "@firecms/ui";

/**
 * Default entry view for the CMS under the path "/"
 * This component takes navigation as an input and renders cards
 * for each entry, including title and description.

 * @group Components
 */
export function FireCMSCloudHomePage() {

    const navigation = useNavigationController();
    const {
        isTrialOver,
    } = useProjectConfig();

    const showSubscriptionWidget = (navigation.collections ?? []).length > 0;

    if (isTrialOver) {
        return <CenteredView>
            <Paywall trialOver={isTrialOver} />
        </CenteredView>;
    }
    // Note: DefaultHomePage already collects additionalActions from plugins internally,
    // so we don't need to pass them here (that would cause duplicate buttons)
    return <DefaultHomePage
        additionalChildrenStart={showSubscriptionWidget
            ? <SubscriptionPlanWidget />
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
                                className={"text-surface-400 dark:text-surface-600"} />} />
                    </div>)}
                </div>
            </NavigationGroup>
        } />;
}
