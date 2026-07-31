import { Blocker, useBlocker, useLocation } from "react-router";
import React, { useEffect, useRef, useState } from "react";
import { useNavigationController } from "../hooks";
import { useNavigate } from "react-router-dom";
import {
    getNavigationEntriesFromPath,
    NavigationViewCollectionInternal,
    NavigationViewEntityCustomInternal,
    NavigationViewInternal
} from "../util/navigation_from_path";
import { useBreadcrumbsController } from "../hooks/useBreadcrumbsController";
import { toArray } from "../util/arrays";
import { addInitialSlash, encodeEntityId } from "../util/navigation_utils";
import { shouldBlockEntityNavigation } from "../util/navigation_blocking";
import { NotFoundPage } from "../components";
import { lazyEager } from "../util/lazy_eager";

const EntityEditView = lazyEager<typeof import("../core/EntityEditView")["EntityEditView"]>(() => import("../core/EntityEditView"), "EntityEditView");
const EntityCollectionView = lazyEager<typeof import("../components/EntityCollectionView/EntityCollectionView")["EntityCollectionView"]>(() => import("../components/EntityCollectionView/EntityCollectionView"), "EntityCollectionView");
import { UnsavedChangesDialog } from "../components/UnsavedChangesDialog";
import { EntityCollection } from "../types";

export function FireCMSRoute() {

    const location = useLocation();
    const navigation = useNavigationController();
    const breadcrumbs = useBreadcrumbsController();

    const hash = location.hash;
    const isSidePanel = hash.includes("#side");
    const isNew = hash.includes("#new") || hash.includes("#new_side");
    const isCopy = hash.includes("#copy");

    const pathname = location.pathname;
    const navigationPath = navigation.urlPathToDataPath(pathname);

    const navigationEntries = getNavigationEntriesFromPath({
        path: navigationPath,
        collections: navigation.collections ?? []
    });

    useEffect(() => {
        const lastEntry = navigationEntries[navigationEntries.length - 1];
        const isViewingCollection = lastEntry?.type === "collection";

        breadcrumbs.set({
            breadcrumbs: navigationEntries.map((entry, index) => {
                const isLastEntry = index === navigationEntries.length - 1;

                if (entry.type === "entity") {
                    return ({
                        title: entry.entityId,
                        url: navigation.buildUrlCollectionPath(entry.fullPath)
                        // count: undefined (not applicable for entities)
                    });
                } else if (entry.type === "custom_view") {
                    return ({
                        title: entry.view.name,
                        url: navigation.buildUrlCollectionPath(entry.fullPath)
                        // count: undefined (not applicable for custom views)
                    });
                } else if (entry.type === "collection") {
                    // Only show count badge (loading state) when viewing this collection directly
                    // Don't show count for parent collections when viewing an entity
                    const showCount = isLastEntry && isViewingCollection;
                    return ({
                        title: entry.collection.name,
                        url: navigation.buildUrlCollectionPath(entry.fullPath),
                        id: entry.fullPath,
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
        collection = navigation.getCollectionById(navigationEntries[0].id);
        if (!collection)
            collection = navigation.getCollection(navigationEntries[0].path);
        if (!collection)
            return null;
        return <React.Suspense fallback={null}>
            <EntityCollectionView
                key={`collection_view_${collection.id ?? collection.path}`}
                isSubCollection={false}
                parentCollectionIds={[]}
                fullPath={collection.path}
                pathSegments={navigationEntries[0].pathSegments}
                fullIdPath={collection.id}
                updateUrl={true}
                {...collection}
                Actions={toArray(collection.Actions)} />
        </React.Suspense>;
    }

    if (isSidePanel) {
        const lastCollectionEntry = navigationEntries.findLast((entry) => entry.type === "collection");
        if (lastCollectionEntry) {
            let collection: EntityCollection<any> | undefined;
            const firstEntry = navigationEntries[0] as NavigationViewCollectionInternal<any>;
            collection = navigation.getCollectionById(firstEntry.id);
            if (!collection)
                collection = navigation.getCollection(firstEntry.path);
            if (!collection)
                return null;
            return <React.Suspense fallback={null}>
                <EntityCollectionView
                    key={`collection_view_${collection.id ?? collection.path}`}
                    fullIdPath={collection.id}
                    isSubCollection={false}
                    parentCollectionIds={[]}
                    fullPath={collection.path}
                    pathSegments={firstEntry.pathSegments}
                    updateUrl={true}
                    {...collection}
                    Actions={toArray(collection.Actions)} />
            </React.Suspense>;
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
            return lastCustomView.id ?? lastCustomView.path;
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

    const navigation = useNavigationController();
    const navigate = useNavigate();

    const navigationPath = navigation.urlPathToDataPath(pathname);

    // is navigating away blocked
    const blocked = useRef(false);

    const lastEntityEntry = navigationEntries.findLast((entry) => entry.type === "entity");
    const navigationEntriesAfterEntity = lastEntityEntry ? navigationEntries.slice(navigationEntries.indexOf(lastEntityEntry) + 1) : [];

    const lastCustomView = navigationEntriesAfterEntity.findLast(
        (entry) => entry.type === "custom_view" || entry.type === "collection"
    ) as NavigationViewCollectionInternal<any> | NavigationViewEntityCustomInternal<any> | undefined;

    const entityId = lastEntityEntry?.entityId;

    const urlTab = getSelectedTabFromUrl(isNew, lastCustomView);
    const [selectedTab, setSelectedTab] = useState<string | undefined>(urlTab);

    const parentCollectionIds = navigation.getParentCollectionIds(navigationPath);
    useEffect(() => {
        if (urlTab !== selectedTab) {
            setSelectedTab(urlTab);
        }
    }, [urlTab]);

    const lastCollectionEntry = navigationEntries.findLast((entry) => entry.type === "collection");

    // The entity id reaches the URL escaped AND percent-encoded, so it cannot be located by
    // searching `pathname` for the raw id — that misses for any id needing encoding (a "/",
    // but equally a space or a non-ASCII character). Rebuild the URLs from the navigation
    // entries instead, which already carry the escaped chain in `fullPath`.
    const entityEntryIndex = lastEntityEntry ? navigationEntries.indexOf(lastEntityEntry) : -1;
    const parentCollectionEntry = entityEntryIndex > 0
        ? navigationEntries[entityEntryIndex - 1] as NavigationViewCollectionInternal<any>
        : undefined;

    const buildUrl = (escapedPath: string) => addInitialSlash(navigation.buildUrlCollectionPath(escapedPath));

    const basePath = !entityId || isNew || !parentCollectionEntry
        ? pathname
        : buildUrl(parentCollectionEntry.fullPath);

    const entityPath = lastEntityEntry ? buildUrl(lastEntityEntry.fullPath) : basePath;

    /**
     * Build the URL of an entity in the current collection. `id` is raw, so it is escaped
     * before being joined; `buildUrlCollectionPath` then percent-encodes the whole path.
     */
    const buildEntityUrl = (id: string, tab?: string) => {
        const parentPath = parentCollectionEntry?.fullPath ?? lastCollectionEntry?.fullPath;
        if (!parentPath) return pathname;
        return buildUrl(`${parentPath}/${encodeEntityId(id)}${tab ? "/" + tab : ""}`);
    };

    let blocker: Blocker | undefined = undefined;
    try {
        blocker = useBlocker(({
            currentLocation,
            nextLocation
        }) => shouldBlockEntityNavigation({
            currentLocation,
            nextLocation,
            entityPath,
            basePath,
            blocked: blocked.current
        }));
    } catch (e) {
        // console.warn("Blocker not available, navigation will not be blocked");
    }

    if (isNew && !lastCollectionEntry) {
        throw new Error("INTERNAL: No collection found in the navigation");
    }

    if (!isNew && !lastEntityEntry) {
        return <NotFoundPage />;
    }

    const collection = isNew ? lastCollectionEntry!.collection : lastEntityEntry!.parentCollection;
    // `fullIdPath` is used downstream to build URLs, so it carries the escaped chain;
    // `collectionPath` addresses the datasource, so it is resolved from the raw one.
    const fullIdPath = isNew ? lastCollectionEntry!.fullPath : (parentCollectionEntry?.fullPath ?? lastEntityEntry!.fullPath);
    const collectionPath = navigation.resolveIdsFrom(isNew ? lastCollectionEntry!.path : lastEntityEntry!.path);
    return <>
        <React.Suspense fallback={null}>
            <EntityEditView
                key={collection.id + "_" + (isNew ? "new" : (isCopy ? entityId + "_copy" : entityId))}
                entityId={isNew ? undefined : entityId}
                fullIdPath={fullIdPath}
                pathSegments={isNew ? lastCollectionEntry!.pathSegments : lastEntityEntry!.pathSegments}
                collection={collection}
                layout={"full_screen"}
                path={collectionPath}
                copy={isCopy}
                selectedTab={selectedTab ?? undefined}
                onValuesModified={(modified) => blocked.current = modified}
                onSaved={(params) => {
                    const newEntityId = params.entityId;
                    if (!newEntityId) return;
                    navigate(buildEntityUrl(newEntityId, params.selectedTab), { replace: true });
                }}
                onTabChange={(params) => {
                    setSelectedTab(params.selectedTab);
                    if (isNew || !entityId) {
                        return;
                    }
                    navigate(buildEntityUrl(entityId, params.selectedTab), { replace: true });
                }}
                parentCollectionIds={parentCollectionIds}
            />
        </React.Suspense>

        <UnsavedChangesDialog
            open={blocker?.state === "blocked"}
            handleOk={() => blocker?.proceed?.()}
            handleCancel={() => blocker?.reset?.()}
            body={"You have unsaved changes in this entity."} />

    </>;
}
