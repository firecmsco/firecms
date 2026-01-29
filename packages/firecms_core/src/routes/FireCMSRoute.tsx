import { Blocker, useBlocker, useLocation } from "react-router";
import { EntityEditView } from "../core/EntityEditView";
import { useNavigationController } from "../hooks";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    getNavigationEntriesFromPath,
    NavigationViewCollectionInternal,
    NavigationViewEntityCustomInternal,
    NavigationViewInternal
} from "../util/navigation_from_path";
import { useBreadcrumbsController } from "../hooks/useBreadcrumbsController";
import { toArray } from "../util/arrays";
import { EntityCollectionView, NotFoundPage } from "../components";
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
        return <EntityCollectionView
            key={`collection_view_${collection.id ?? collection.path}`}
            isSubCollection={false}
            parentCollectionIds={[]}
            fullPath={collection.path}
            fullIdPath={collection.id}
            updateUrl={true}
            {...collection}
            Actions={toArray(collection.Actions)} />
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
            return <EntityCollectionView
                key={`collection_view_${collection.id ?? collection.path}`}
                fullIdPath={collection.id}
                isSubCollection={false}
                parentCollectionIds={[]}
                fullPath={collection.path}
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

    const lastCollectionEntry = navigationEntries.findLast((entry) => entry.type === "collection");

    if (isNew && !lastCollectionEntry) {
        throw new Error("INTERNAL: No collection found in the navigation");
    }

    if (!isNew && !lastEntityEntry) {
        return <NotFoundPage />;
    }

    const collection = isNew ? lastCollectionEntry!.collection : lastEntityEntry!.parentCollection;
    const fullIdPath = isNew ? lastCollectionEntry!.path : lastEntityEntry!.path;
    const collectionPath = navigation.resolveIdsFrom(fullIdPath);
    return <>
        <EntityEditView
            key={collection.id + "_" + (isNew ? "new" : (isCopy ? entityId + "_copy" : entityId))}
            entityId={isNew ? undefined : entityId}
            fullIdPath={fullIdPath}
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
