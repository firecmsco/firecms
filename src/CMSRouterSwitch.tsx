import React from "react";

import { Route, Switch, useLocation } from "react-router-dom";
import { EntityCollection } from "./models";
import { addInitialSlash, buildCollectionPath } from "./routes/navigation";
import { CMSView } from "./CMSAppProps";
import { CMSViewRoute, CollectionRoute, HomeRoute } from "./routes";

export function CMSRouterSwitch({ collections, views }: {
    collections: EntityCollection[],
    views?: CMSView[];
}) {

    const location: any = useLocation();
    const mainLocation = location.state && location.state["main_location"] ? location.state["main_location"] : location;

    function buildCMSViewRoute(path: string, cmsView: CMSView) {
        return <Route
            key={"additional_view_" + path}
            path={addInitialSlash(path)}
        >
            <CMSViewRoute cmsView={cmsView}/>
        </Route>;
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

            {views &&
            views.map(cmsView => {
                if (Array.isArray(cmsView.path))
                    return <>{cmsView.path.map(path => buildCMSViewRoute(path, cmsView))}</>;
                return buildCMSViewRoute(cmsView.path, cmsView);
            })}


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
