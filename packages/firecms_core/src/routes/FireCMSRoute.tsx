import { useLocation } from "react-router";
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
import { UnsavedChangesDialog, useNavigationUnsavedChangesDialog } from "../internal/useUnsavedChangesDialog";

export function FireCMSRoute() {

    const location = useLocation();
    const navigation = useNavigationController();
    const breadcrumbs = useBreadcrumbsController();

    const hash = location.hash;
    const isSidePanel = hash.includes("#side");
    const isNew = hash.includes("#new");

    const firstLoad = useRef(true);
    useEffect(() => {
        if (firstLoad.current) {
            firstLoad.current = false;
            return;
        }
    }, []);

    const pathname = location.pathname;
    const usedPath = navigation.urlPathToDataPath(pathname);

    const navigationEntries = getNavigationEntriesFromPath({
        path: usedPath,
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
            usedPath={usedPath}
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
        usedPath={usedPath}
        navigationEntries={navigationEntries}
        isNew={false}
    />;

}

function EntityFullScreenRoute({
                                   pathname,
                                   usedPath,
                                   navigationEntries,
                                   isNew
                               }: {
    pathname: string;
    usedPath: string;
    navigationEntries: NavigationViewInternal[],
    isNew: boolean
}) {

    const navigation = useNavigationController();
    const navigate = useNavigate();

    // is navigating away blocked
    const [blocked, setBlocked] = useState(false);

    console.log("blocking", blocked)

    const {
        navigationWasBlocked,
        handleOk: handleNavigationOk,
        handleCancel: handleNavigationCancel
    } = useNavigationUnsavedChangesDialog(
        blocked,
        () => setBlocked(false)
    );

    const lastEntityEntry = navigationEntries.findLast((entry) => entry.type === "entity");
    const navigationEntriesAfterEntity = lastEntityEntry ? navigationEntries.slice(navigationEntries.indexOf(lastEntityEntry) + 1) : [];

    const lastCustomView = navigationEntriesAfterEntity.findLast(
        (entry) => entry.type === "custom_view" || entry.type === "collection"
    ) as NavigationViewCollectionInternal<any> | NavigationViewEntityCustomInternal<any> | undefined;

    const entityId = lastEntityEntry?.entityId;

    const urlTab = (lastCustomView && "id" in lastCustomView ? lastCustomView?.id : undefined) ?? lastCustomView?.path;
    const [selectedTab, setSelectedTab] = useState<string | undefined>(urlTab);

    const parentCollectionIds = navigation.getParentCollectionIds(usedPath);
    useEffect(() => {
        if (urlTab !== selectedTab) {
            setSelectedTab(urlTab);
        }
    }, [urlTab]);

    const basePath = entityId
        ? pathname.substring(0, pathname.lastIndexOf(`/${entityId}`))
        : pathname;

    function updateUrl(entityId: string | undefined, newSelectedTab: string | undefined, replace: boolean, isNew: boolean) {
        if (!isNew && (newSelectedTab ?? null) === (selectedTab ?? null)) {
            return;
        }

        if (newSelectedTab) {
            navigate(basePath + `/${entityId}/${newSelectedTab}`, { replace: replace });
        } else {
            navigate(basePath + `/${entityId}`, { replace: replace });
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
    const collectionPath = isNew ? lastCollectionEntry!.path : lastEntityEntry!.path;

    return <>
        <EntityEditView
            key={collection.id + "_" + entityId}
            entityId={entityId}
            collection={collection}
            layout={"full_screen"}
            path={collectionPath}
            selectedTab={selectedTab ?? undefined}
            onValuesModified={setBlocked}
            onUpdate={(params) => {
                updateUrl(params.entityId, params.selectedTab, true, isNew);
            }}
            onTabChange={(params) => {
                updateUrl(params.entityId, params.selectedTab, !isNew, isNew);
                setSelectedTab(params.selectedTab);
            }}
            parentCollectionIds={parentCollectionIds}
        />

        <UnsavedChangesDialog
            open={navigationWasBlocked}
            handleOk={handleNavigationOk}
            handleCancel={handleNavigationCancel}
            body={"You have unsaved changes in this entity. Are you sure you want to leave this page?"}/>

    </>;
}
