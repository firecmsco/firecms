import {
    AuthController,
    CMSView,
    CMSViewsBuilder,
    DataSource,
    EntityCollection,
    EntityCollectionsBuilder,
    RebasePlugin,
    User
} from "@rebasepro/types";
import { canReadCollection } from "@rebasepro/common";

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
    dataSource: DataSource,
    plugins: RebasePlugin[] | undefined
): Promise<EntityCollection[]> {
    let resolvedCollections: EntityCollection[] = [];
    if (typeof collections === "function") {
        resolvedCollections = await collections({
            user: authController.user,
            authController,
            dataSource
        });
    } else if (Array.isArray(collections)) {
        resolvedCollections = collections;
    }

    if (plugins) {
        for (const plugin of plugins) {
            if (plugin.collection?.modifyCollection) {
                resolvedCollections = applyPluginModifyCollection(resolvedCollections, plugin.collection.modifyCollection);
            }

            if (plugin.collection?.injectCollections) {
                resolvedCollections = plugin.collection.injectCollections(resolvedCollections ?? []);
            }
        }
    }

    resolvedCollections = filterOutNotAllowedCollections(resolvedCollections, authController);
    return resolvedCollections;
}

export async function resolveCMSViews(
    baseViews: CMSView[] | CMSViewsBuilder | undefined,
    authController: AuthController,
    dataSource: DataSource,
    plugins?: RebasePlugin[]
) {
    let resolvedViews: CMSView[] = [];
    if (typeof baseViews === "function") {
        resolvedViews = await baseViews({
            user: authController.user,
            authController,
            dataSource
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
