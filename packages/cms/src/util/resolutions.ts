import type { EntityCustomView, EntityCollection } from "@rebasepro/types";
import type { CustomizationController, EntityAction } from "@rebasepro/types";

export function resolveEntityView(
    entityView: string | EntityCustomView<any>,
    contextEntityViews?: EntityCustomView<any>[]
): EntityCustomView<any> | undefined {
    if (typeof entityView === "string") {
        return contextEntityViews?.find((entry) => entry.key === entityView);
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
