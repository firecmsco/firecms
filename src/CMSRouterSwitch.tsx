import React from "react";

import { Route, Switch, useLocation } from "react-router-dom";
import "firebase/analytics";
import "firebase/auth";
import "firebase/storage";
import "firebase/firestore";
import { EntityCollection } from "./models";
import { addInitialSlash, buildCollectionPath } from "./routes/navigation";
import { CMSView } from "./CMSAppProps";
import { AdditionalViewRoute, CollectionRoute, HomeRoute } from "./routes";

export function CMSRouterSwitch({ collections, views }: {
    collections: EntityCollection[],
    views?: CMSView[];
}) {

    const location: any = useLocation();
    const mainLocation = location.state && location.state["main_location"] ? location.state["main_location"] : location;

    const firstCollectionPath = buildCollectionPath(collections[0]);

    return (
        <Switch location={mainLocation}>
            {collections
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
            views.map(additionalView => (
                <Route
                    key={"additional_view_" + additionalView.path}
                    path={addInitialSlash(additionalView.path)}
                >
                    <AdditionalViewRoute additionalView={additionalView}/>
                </Route>
            ))}


            <Route
                key={`navigation_home`}>
                <HomeRoute
                    navigation={collections}
                    additionalViews={views}
                />
            </Route>

        </Switch>
    );
}
