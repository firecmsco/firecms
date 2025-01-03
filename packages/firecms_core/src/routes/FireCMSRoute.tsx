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
import { EntityCollectionView } from "../components";
import { UnsavedChangesDialog } from "../components/UnsavedChangesDialog";

export function FireCMSRoute() {

    const location = useLocation();
    const navigation = useNavigationController();
    const breadcrumbs = useBreadcrumbsController();

    const hash = location.hash;
    const isSidePanel = hash.includes("#side");
    const isNew = hash.includes("#new") || hash.includes("#new_side");

    const pathname = location.pathname;
    const navigationPath = navigation.urlPathToDataPath(pathname);

    const navigationEntries = getNavigationEntriesFromPath({
        path: navigationPath,
        collections: navigation.collections ?? []
    });

    useEffect(() => {
        breadcrumbs.set({
            breadcrumbs: navigationEntries.map(entry => {
                if (entry.type === "entity") {
                    return ({
                        title: entry.entityId,
                        url: navigation.buildUrlCollectionPath(entry.fullPath)
                    });
                } else if (entry.type === "custom_view") {
                    return ({
                        title: entry.view.name,
                        url: navigation.buildUrlCollectionPath(entry.fullPath)
                    });
                } else if (entry.type === "collection") {
                    return ({
                        title: entry.collection.name,
                        url: navigation.buildUrlCollectionPath(entry.fullPath)
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
        />;
    }

    if (navigationEntries.length === 1 && navigationEntries[0].type === "collection") {
        const collection = navigation.getCollection(navigationEntries[0].path);
        if (!collection)
            return null;
        return <EntityCollectionView
            key={`collection_view_${collection.id ?? collection.path}`}
            isSubCollection={false}
            parentCollectionIds={[]}
            fullPath={collection.id}
            updateUrl={true}
            {...collection}
            Actions={toArray(collection.Actions)}/>
    }

    if (isSidePanel) {
        const lastCollectionEntry = navigationEntries.findLast((entry) => entry.type === "collection");
        if (lastCollectionEntry) {
            const collection = navigation.getCollection(lastCollectionEntry.path);
            if (!collection)
                return null;
            return <EntityCollectionView
                key={`collection_view_${collection.id ?? collection.path}`}
                isSubCollection={false}
                parentCollectionIds={[]}
                fullPath={collection.id}
                updateUrl={true}
                {...collection}
                Actions={toArray(collection.Actions)}/>;
        }
    }

    return <EntityFullScreenRoute
        pathname={pathname}
        navigationEntries={navigationEntries}
        isNew={isNew}
    />;

}

function EntityFullScreenRoute({
                                   pathname,
                                   navigationEntries,
                                   isNew
                               }: {
    pathname: string;
    navigationEntries: NavigationViewInternal[],
    isNew: boolean
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

    const urlTab = isNew ? undefined : (lastCustomView && "id" in lastCustomView ? lastCustomView?.id : undefined) ?? lastCustomView?.path;
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
        console.warn("Blocker not available, navigation will not be blocked");
    }

    function updateUrl(entityId: string | undefined, newSelectedTab: string | undefined, replace: boolean, path: string, isNew: boolean) {

        console.log("Updating url", {
            entityId,
            newSelectedTab,
            replace,
            basePath,
            path,
            isNew
        });

        if (!isNew && (newSelectedTab ?? null) === (selectedTab ?? null)) {
            return;
        }

        if (isNew) {
            navigate(`${basePath}/${entityId}`, { replace: replace });
            return;
        }

        if (newSelectedTab) {
            navigate(`${basePath}/${entityId}/${newSelectedTab}`, { replace: replace });
        } else {
            navigate(`${basePath}/${entityId}`, { replace: replace });
        }

    }

    const lastCollectionEntry = navigationEntries.findLast((entry) => entry.type === "collection");

    if (isNew && !lastCollectionEntry) {
        throw new Error("No collection found in the navigation");
    }

    if (!isNew && !lastEntityEntry) {
        throw new Error("No entity found in the navigation");
    }

    const collection = isNew ? lastCollectionEntry!.collection : lastEntityEntry!.parentCollection;
    const collectionPath = navigation.resolveIdsFrom(isNew ? lastCollectionEntry!.path : lastEntityEntry!.path);

    return <>
        <EntityEditView
            key={collection.id + "_" + (isNew ? "new" : entityId)}
            entityId={isNew ? undefined : entityId}
            collection={collection}
            layout={"full_screen"}
            path={collectionPath}
            selectedTab={selectedTab ?? undefined}
            onValuesModified={(modified) => blocked.current = modified}
            onSaved={(params) => {
                updateUrl(params.entityId, params.selectedTab, true, params.path, isNew);
            }}
            onTabChange={(params) => {
                updateUrl(params.entityId, params.selectedTab, !isNew, params.path, isNew);
                setSelectedTab(params.selectedTab);
            }}
            parentCollectionIds={parentCollectionIds}
        />

        <UnsavedChangesDialog
            open={blocker?.state === "blocked"}
            handleOk={() => blocker?.proceed?.()}
            handleCancel={() => blocker?.reset?.()}
            body={"You have unsaved changes in this entity."}/>

    </>;
}
