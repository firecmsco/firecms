import React from "react";
import type { EntityCustomView, EntityCollection } from "@rebasepro/types";
import type { CustomizationController, EntityAction } from "@rebasepro/types";
import { EntityHistoryView } from "../components/history";
import { HistoryIcon } from "@rebasepro/ui";

/**
 * Built-in entity views that are resolved by token name.
 * These are always available without needing to be registered
 * in the customization controller's entityViews array.
 */
const BUILTIN_ENTITY_VIEWS: Record<string, EntityCustomView> = {
    "__rebase_history": {
        key: "__rebase_history",
        name: "History",
        tabComponent: React.createElement(HistoryIcon, { size: "small" }),
        Builder: EntityHistoryView,
        position: "end"
    }
};

export function resolveEntityView(
    entityView: string | EntityCustomView<any>,
    contextEntityViews?: EntityCustomView<any>[]
): EntityCustomView<any> | undefined {
    if (typeof entityView === "string") {
        // Check built-in views first, then user-registered views
        return BUILTIN_ENTITY_VIEWS[entityView]
            ?? contextEntityViews?.find((entry) => entry.key === entityView);
    } else {
        return entityView;
    }
}

export function resolveEntityAction<M extends Record<string, any>>(
    entityAction: string | EntityAction<M>,
    contextEntityActions?: EntityAction<M>[]
): EntityAction<M> | undefined {
    if (typeof entityAction === "string") {
        return contextEntityActions?.find((entry) => entry.key === entityAction);
    } else {
        return entityAction;
    }
}

export function resolvedSelectedEntityView<M extends Record<string, any>>(
    customViews: (string | EntityCustomView<M>)[] | undefined,
    customizationController: CustomizationController,
    selectedTab?: string,
    _canEdit?: boolean
) {
    const resolvedEntityViews = customViews
        ? customViews
              .map((e) => resolveEntityView(e, (customizationController as unknown as { entityViews?: EntityCustomView[] }).entityViews))
              .filter(Boolean) as EntityCustomView[]
        : [];

    const selectedEntityView = resolvedEntityViews.find((e) => e.key === selectedTab);
    const selectedSecondaryForm =
        customViews &&
        resolvedEntityViews
            .filter((e) => e.includeActions)
            .find((e) => e.key === selectedTab);
    return {
        resolvedEntityViews,
        selectedEntityView,
        selectedSecondaryForm,
    };
}
