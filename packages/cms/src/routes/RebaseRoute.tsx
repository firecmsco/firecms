import type { EntityCollection } from "@rebasepro/types";
import { Blocker, useBlocker, useLocation } from "react-router";
import { EntityEditView } from "../components/EntityEditView";
import { useCollectionRegistryController, useUrlController } from "@rebasepro/core";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useBreadcrumbsController } from "@rebasepro/core";
import { EntityCollectionView } from "../components";
import { NotFoundPage } from "@rebasepro/core";
import { UnsavedChangesDialog } from "@rebasepro/core";
;
import {
    getNavigationEntriesFromPath,
    NavigationViewCollectionInternal, NavigationViewEntityCustomInternal,
    NavigationViewInternal,
    toArray
} from "@rebasepro/common";

export function RebaseRoute() {

    const location = useLocation();
    const collectionRegistry = useCollectionRegistryController();
    const urlController = useUrlController();
    const breadcrumbs = useBreadcrumbsController();

    const hash = location.hash;
    const isSidePanel = hash.includes("#side");
    const isNew = hash.includes("#new") || hash.includes("#new_side");
    const isCopy = hash.includes("#copy");

    const pathname = location.pathname;
    const navigationPath = urlController.urlPathToDataPath(pathname);

    const navigationEntries = getNavigationEntriesFromPath({
        path: navigationPath,
        collections: collectionRegistry.collections ?? []
    });

    useEffect(() => {
        const lastEntry = navigationEntries[navigationEntries.length - 1];
        const isViewingCollection = lastEntry?.type === "collection";

        breadcrumbs.set({
            breadcrumbs: navigationEntries.map((entry, index) => {
                const isLastEntry = index === navigationEntries.length - 1;

                if (entry.type === "entity") {
                    return ({
                        title: String(entry.entityId),
                        url: urlController.buildUrlCollectionPath(entry.path)
                        // count: undefined (not applicable for entities)
                    });
                } else if (entry.type === "custom_view") {
                    return ({
                        title: entry.view.name,
                        url: urlController.buildUrlCollectionPath(entry.path)
                        // count: undefined (not applicable for custom views)
                    });
                } else if (entry.type === "collection") {
                    // Only show count badge (loading state) when viewing this collection directly
                    // Don't show count for parent collections when viewing an entity
                    const showCount = isLastEntry && isViewingCollection;
                    return ({
                        title: entry.collection.name,
                        url: urlController.buildUrlCollectionPath(entry.path),
                        id: entry.path,
                        ...(showCount ? { count: null } : {}) // null = loading, undefined = no badge
                    });
                } else {
                    throw new Error("Unexpected navigation entry type");
                }
            })
        });
    }, [navigationEntries.map(entry => entry.path).join(",")]);

    if (isNew) {
        return <EntityFullScreenRoute
            pathname={pathname}
            navigationEntries={navigationEntries}
            isNew={true}
            isCopy={false}
        />;
    }

    if (navigationEntries.length === 1 && navigationEntries[0].type === "collection") {
        let collection: EntityCollection<any> | undefined;
        collection = collectionRegistry.getCollection(navigationEntries[0].id);
        if (!collection)
            collection = collectionRegistry.getCollection(navigationEntries[0].slug);
        if (!collection)
            return null;
        return <EntityCollectionView
            key={`collection_view_${collection.slug}`}
            parentCollectionIds={[]}
            path={collection.slug}
            updateUrl={true}
            {...collection}
            Actions={toArray(collection.Actions)} />
    }

    if (isSidePanel) {
        const lastCollectionEntry = [...navigationEntries].reverse().find((entry) => entry.type === "collection");
        if (lastCollectionEntry) {
            let collection: EntityCollection<any> | undefined;
            const firstEntry = navigationEntries[0] as NavigationViewCollectionInternal<any>;
            collection = collectionRegistry.getCollection(firstEntry.id);
            if (!collection)
                collection = collectionRegistry.getCollection(firstEntry.slug);
            if (!collection)
                return null;
            return <EntityCollectionView
                key={`collection_view_${collection.slug}`}
                parentCollectionIds={[]}
                path={collection.slug}
                updateUrl={true}
                {...collection}
                Actions={toArray(collection.Actions)} />;
        }
    }

    return <EntityFullScreenRoute
        pathname={pathname}
        navigationEntries={navigationEntries}
        isNew={isNew}
        isCopy={isCopy}
    />;

}

function getSelectedTabFromUrl(isNew: boolean, lastCustomView: NavigationViewCollectionInternal<any> | NavigationViewEntityCustomInternal<any> | undefined) {
    if (isNew) {
        return undefined;
    } else if (lastCustomView) {
        if (lastCustomView.type === "custom_view") {
            return lastCustomView.view.key;
        } else if (lastCustomView.type === "collection") {
            return lastCustomView.id ?? lastCustomView.slug;
        }
    }
    return undefined;
}

function EntityFullScreenRoute({
    pathname,
    navigationEntries,
    isNew,
    isCopy
}: {
    pathname: string;
    navigationEntries: NavigationViewInternal[],
    isNew: boolean,
    isCopy: boolean
}) {

    const collectionRegistry = useCollectionRegistryController();
    const urlController = useUrlController();
    const navigate = useNavigate();

    const navigationPath = urlController.urlPathToDataPath(pathname);

    // is navigating away blocked
    const blocked = useRef(false);

    const lastEntityEntry = [...navigationEntries].reverse().find((entry) => entry.type === "entity");
    const navigationEntriesAfterEntity = lastEntityEntry ? navigationEntries.slice(navigationEntries.indexOf(lastEntityEntry) + 1) : [];

    const lastCustomView = [...navigationEntriesAfterEntity].reverse().find(
        (entry) => entry.type === "custom_view" || entry.type === "collection"
    ) as NavigationViewCollectionInternal<EntityCollection> | NavigationViewEntityCustomInternal<EntityCollection> | undefined;

    const entityId = lastEntityEntry && "entityId" in lastEntityEntry ? lastEntityEntry.entityId : undefined;

    const urlTab = getSelectedTabFromUrl(isNew, lastCustomView);
    const [selectedTab, setSelectedTab] = useState<string | undefined>(urlTab);

    const parentCollectionIds = collectionRegistry.getParentCollectionIds(navigationPath);
    useEffect(() => {
        if (urlTab !== selectedTab) {
            setSelectedTab(urlTab);
        }
    }, [urlTab]);

    const basePath = !entityId || isNew
        ? pathname
        : pathname.substring(0, pathname.lastIndexOf(`/${entityId}`));

    const entityPath = basePath + `/${entityId}`;

    let blocker: Blocker | undefined = undefined;
    try {
        blocker = useBlocker(({
            nextLocation
        }) => {
            if (nextLocation.pathname.startsWith(entityPath))
                return false;
            return blocked.current;
        });
    } catch (e) {
        // console.warn("Blocker not available, navigation will not be blocked");
    }

    const lastCollectionEntry = [...navigationEntries].reverse().find((entry) => entry.type === "collection");

    if (isNew && !lastCollectionEntry) {
        throw new Error("INTERNAL: No collection found in the navigation");
    }

    if (!isNew && !lastEntityEntry) {
        return <NotFoundPage />;
    }

    const collection = isNew
        ? (lastCollectionEntry && "collection" in lastCollectionEntry ? lastCollectionEntry.collection : undefined)!
        : (lastEntityEntry && "parentCollection" in lastEntityEntry ? lastEntityEntry.parentCollection : undefined)!;
    const fullIdPath = isNew ? lastCollectionEntry!.slug : lastEntityEntry!.slug;
    const collectionPath = urlController.resolveDatabasePathsFrom(fullIdPath);
    return <>
        <EntityEditView
            key={collection.slug + "_" + (isNew ? "new" : (isCopy ? entityId + "_copy" : entityId))}
            entityId={isNew ? undefined : entityId}
            collection={collection}
            layout={"full_screen"}
            path={collectionPath}
            copy={isCopy}
            selectedTab={selectedTab ?? undefined}
            onValuesModified={(modified) => blocked.current = modified}
            onSaved={(params) => {
                const newSelectedTab = params.selectedTab;
                const newEntityId = params.entityId;
                if (newSelectedTab) {
                    navigate(`${basePath}/${newEntityId}/${newSelectedTab}`, { replace: true });
                } else {
                    navigate(`${basePath}/${newEntityId}`, { replace: true });
                }
            }}
            onTabChange={(params) => {
                setSelectedTab(params.selectedTab);
                if (isNew) {
                    return;
                }
                const newSelectedTab = params.selectedTab;
                if (newSelectedTab) {
                    navigate(`${basePath}/${entityId}/${newSelectedTab}`, { replace: true });
                } else {
                    navigate(`${basePath}/${entityId}`, { replace: true });
                }
            }}
            parentCollectionIds={parentCollectionIds}
        />

        <UnsavedChangesDialog
            open={blocker?.state === "blocked"}
            handleOk={() => blocker?.proceed?.()}
            handleCancel={() => blocker?.reset?.()}
            body={"You have unsaved changes in this entity."} />

    </>;
}
