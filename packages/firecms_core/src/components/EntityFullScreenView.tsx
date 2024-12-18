import { useLocation, useParams } from "react-router";
import { EntityCollection } from "../types";
import { EntityEditView } from "../core/EntityEditView";
import { useResolvedNavigationFrom } from "../hooks";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export function EntityFullScreenView({
                                         fullPath,
                                         collection

                                     }: {
    fullPath: string
    collection: EntityCollection
}) {

    const navigate = useNavigate();
    const location = useLocation();
    const {
        id,
        "*": allSegments
    } = useParams();

    const urlTab = allSegments === "" ? undefined : allSegments;
    const [selectedTab, setSelectedTab] = useState<string | undefined>(urlTab);

    useEffect(() => {
        if (urlTab !== selectedTab) {
            setSelectedTab(urlTab);
        }
    }, [urlTab]);

    const pathname = location.pathname;

    const basePath = pathname.substring(0, pathname.lastIndexOf(`/${id}`));

    // console.log({
    //     basePath,
    //     pathname,
    //     selectedTab,
    //     id,
    //     urlTab
    // })

    const navigationFrom = useResolvedNavigationFrom({ path: fullPath + "/" + id + "/" + (urlTab ?? "") });
    // const navigationFrom = useResolvedNavigationFrom({ path: fullPath + "/" + id + "/" + (urlTab ?? "") });
    console.log("navigationFrom", navigationFrom);

    if (!id) return null;

    function updateUrl(newSelectedTab: string | undefined) {
        console.log("params.selectedTab", newSelectedTab);
        console.log("selectedTab", selectedTab);
        if ((newSelectedTab ?? null) === (selectedTab ?? null)) {
            return;
        }

        if (newSelectedTab) {
            navigate(basePath + `/${id}/${newSelectedTab}`);
        } else {
            navigate(basePath + `/${id}`);
        }
    }

    return <EntityEditView entityId={id}
                           collection={collection}
                           layout={"full_screen"}
                           path={fullPath}
                           selectedTab={selectedTab ?? undefined}
                           onTabChange={(params) => {
                               updateUrl(params.selectedTab);
                               setSelectedTab(params.selectedTab);
                           }}
                           parentCollectionIds={[]} // TODO
    />;
}
