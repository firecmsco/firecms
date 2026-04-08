import type { CMSView, CMSViewsBuilder, EntityCollection, EntityCustomView, RebasePlugin } from "@rebasepro/types";
import { AuthController, DataDriver,  User, RebaseData } from "@rebasepro/types";
import type { EntityCollectionsBuilder } from "@rebasepro/types";
import { canReadCollection } from "@rebasepro/common";

/**
 * Auto-inject the "History" tab into any collection that has `history: true`.
 * Skips if the collection already has an entity view named "History".
 */
function injectHistoryViews(collections: EntityCollection[]): EntityCollection[] {
    return collections.map((collection) => {
        let modified = collection;

        if (collection.history) {
            const existing = (collection.entityViews ?? []) as (string | EntityCustomView)[];
            const alreadyHasHistory = existing.some(
                v => typeof v === "object" && v.name === "History"
            );

            if (!alreadyHasHistory) {
                modified = {
                    ...collection,
                    entityViews: [...existing, "__rebase_history"]
                };
            }
        }

        // Recurse into subcollections
        if (modified.subcollections) {
            const originalSubcollections = modified.subcollections;
            return {
                ...modified,
                subcollections: () => injectHistoryViews(originalSubcollections() ?? [])
            };
        }

        return modified;
    });
}

export function filterOutNotAllowedCollections(resolvedCollections: EntityCollection[], authController: AuthController<User>): EntityCollection[] {
    return resolvedCollections
        .filter((c) => canReadCollection(c, authController))
        .map((c) => {
            if (!c.subcollections) return c;
            return {
                ...c,
                subcollections: () => filterOutNotAllowedCollections(c.subcollections?.() ?? [], authController)
            }
        });
}

export function applyPluginModifyCollection(resolvedCollections: EntityCollection[], modifyCollection: (collection: EntityCollection) => EntityCollection) {
    return resolvedCollections.map((collection: EntityCollection): EntityCollection => {
        const modifiedCollection = modifyCollection(collection);
        if (modifiedCollection.subcollections) {
            return {
                ...modifiedCollection,
                subcollections: () => applyPluginModifyCollection(modifiedCollection.subcollections?.() ?? [], modifyCollection)
            } satisfies EntityCollection;
        }
        return modifiedCollection;
    });
}

export async function resolveCollections(
    collections: undefined | EntityCollection[] | EntityCollectionsBuilder<any>,
    authController: AuthController,
    data: RebaseData,
    plugins: RebasePlugin[] | undefined
): Promise<EntityCollection[]> {
    let resolvedCollections: EntityCollection[] = [];
    if (typeof collections === "function") {
        resolvedCollections = await collections({
            user: authController.user,
            authController,
            data
        });
    } else if (Array.isArray(collections)) {
        resolvedCollections = collections;
    }

    if (plugins) {
        for (const plugin of plugins) {
            if (plugin.hooks?.modifyCollection) {
                resolvedCollections = applyPluginModifyCollection(resolvedCollections, plugin.hooks.modifyCollection);
            }

            if (plugin.hooks?.injectCollections) {
                resolvedCollections = plugin.hooks.injectCollections(resolvedCollections ?? []);
            }
        }
    }

    // Auto-inject history views for collections with history: true
    resolvedCollections = injectHistoryViews(resolvedCollections);

    resolvedCollections = filterOutNotAllowedCollections(resolvedCollections, authController);
    return resolvedCollections;
}

export async function resolveCMSViews(
    baseViews: CMSView[] | CMSViewsBuilder | undefined,
    authController: AuthController,
    data: RebaseData,
    plugins?: RebasePlugin[]
) {
    let resolvedViews: CMSView[] = [];
    if (typeof baseViews === "function") {
        resolvedViews = await baseViews({
            user: authController.user,
            authController,
            data
        });
    } else if (Array.isArray(baseViews)) {
        resolvedViews = baseViews;
    }

    // Inject views from plugins
    if (plugins) {
        for (const plugin of plugins) {
            if (plugin.views && plugin.views.length > 0) {
                resolvedViews = [...resolvedViews, ...plugin.views];
            }
        }
    }

    return resolvedViews;
}
