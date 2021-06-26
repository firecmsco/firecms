import React from "react";

import { Route, Switch, useLocation } from "react-router-dom";
import { EntityCollection } from "../models";
import { addInitialSlash, buildCollectionPath } from "./navigation";
import { CMSView } from "./CMSAppProps";

import { default as CollectionRoute } from "./components/CollectionRoute";
import { default as CMSViewRoute } from "./components/CMSViewRoute";
import { default as HomeRoute } from "./components/HomeRoute";

export function CMSRouterSwitch({ collections, views }: {
    collections: EntityCollection[],
    views?: CMSView[];
}) {

    const location: any = useLocation();
    const mainLocation = location.state && location.state["main_location"] ? location.state["main_location"] : location;

    function buildCMSViewRoute(path: string, cmsView: CMSView) {
        return <Route
            key={"navigation_view_" + path}
            path={addInitialSlash(path)}
        >
            <CMSViewRoute cmsView={cmsView}/>
        </Route>;
    }

    let customRoutes: JSX.Element[] = [];
    if (views) {
        views.forEach((cmsView) => {
            if (Array.isArray(cmsView.path))
                customRoutes.push(...cmsView.path.map(path => buildCMSViewRoute(path, cmsView)));
            else
                customRoutes.push(buildCMSViewRoute(cmsView.path, cmsView));
        });
    }

    return (
        <Switch location={mainLocation}>
            {[...collections]
                // we reorder collections so that nested paths are included first
                .sort((a, b) => b.relativePath.length - a.relativePath.length)
                .map(entityCollection => (
                        <Route
                            path={buildCollectionPath(entityCollection)}
                            key={`navigation_${entityCollection.relativePath}`}>
                            <CollectionRoute
                                collectionPath={entityCollection.relativePath}
                                view={entityCollection}
                            />
                        </Route>
                    )
                )}

            {customRoutes}

            <Route
                key={`navigation_home`}>
                <HomeRoute
                    navigation={collections}
                    cmsViews={views}
                />
            </Route>

        </Switch>
    );
}
