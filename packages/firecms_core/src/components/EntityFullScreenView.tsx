import { useLocation } from "react-router";
import { EntityEditView } from "../core/EntityEditView";
import { useNavigationController } from "../hooks";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    getNavigationEntriesFromPath,
    NavigationViewCollectionInternal,
    NavigationViewEntityCustomInternal
} from "../util/navigation_from_path";

export function EntityFullScreenView({
                                         fullPath,
                                     }: {
    fullPath: string
}) {

    const navigate = useNavigate();
    const location = useLocation();
    const navigation = useNavigationController();

    const pathname = location.pathname;
    const usedPath = navigation.urlPathToDataPath(pathname);

    const navigationEntries = getNavigationEntriesFromPath({
        path: usedPath,
        collections: navigation.collections ?? []
    });
    const lastEntityEntry = navigationEntries.findLast((entry) => entry.type === "entity");
    const navigationEntriesAfterEntity = lastEntityEntry ? navigationEntries.slice(navigationEntries.indexOf(lastEntityEntry) + 1) : [];

    const lastCustomView = navigationEntriesAfterEntity.findLast(
        (entry) => entry.type === "custom_view" || entry.type === "collection"
    ) as NavigationViewCollectionInternal<any> | NavigationViewEntityCustomInternal<any> | undefined;

    if (!lastEntityEntry) return null;

    const entityId = lastEntityEntry.entityId;


    const urlTab = (lastCustomView && "id" in lastCustomView ? lastCustomView?.id : undefined) ?? lastCustomView?.path;
    const [selectedTab, setSelectedTab] = useState<string | undefined>(urlTab);

    const parentCollectionIds = navigation.getParentCollectionIds(usedPath);
    useEffect(() => {
        if (urlTab !== selectedTab) {
            setSelectedTab(urlTab);
        }
    }, [urlTab]);

    const basePath = pathname.substring(0, pathname.lastIndexOf(`/${entityId}`));
    console.log({
        fullPath,
        basePath,
        pathname,
        selectedTab,
        entityId,
        urlTab
    });

    function updateUrl(newSelectedTab: string | undefined) {
        if ((newSelectedTab ?? null) === (selectedTab ?? null)) {
            return;
        }

        if (newSelectedTab) {
            navigate(basePath + `/${entityId}/${newSelectedTab}`);
        } else {
            navigate(basePath + `/${entityId}`);
        }
    }

    return <EntityEditView entityId={entityId}
                           collection={lastEntityEntry.parentCollection}
                           layout={"full_screen"}
                           path={lastEntityEntry.path}
                           selectedTab={selectedTab ?? undefined}
                           onTabChange={(params) => {
                               updateUrl(params.selectedTab);
                               setSelectedTab(params.selectedTab);
                           }}
                           parentCollectionIds={parentCollectionIds}
    />;
}
