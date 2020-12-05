import React from "react";

import { Redirect, Route, Switch, useLocation } from "react-router-dom";
import "firebase/analytics";
import "firebase/auth";
import "firebase/storage";
import "firebase/firestore";
import { EntityCollectionView } from "./models";
import { addInitialSlash, buildCollectionPath } from "./routes/navigation";
import { CMSRoute } from "./routes/CMSRoute";
import { AdditionalView } from "./CMSAppProps";

export function CMSRouterSwitch({ navigation, additionalViews }: {
    navigation: EntityCollectionView[],
    additionalViews?: AdditionalView[];
}) {

    const location = useLocation();
    const mainLocation = location.state && location.state["main_location"] ? location.state["main_location"] : location;

    const firstCollectionPath = buildCollectionPath(navigation[0].relativePath);

    return (
        <Switch location={mainLocation}>

            {navigation.map(entityCollectionView => (
                    <Route
                        path={buildCollectionPath(entityCollectionView.relativePath)}
                        key={`navigation_${entityCollectionView.relativePath}`}>
                        <CMSRoute
                            type={"collection"}
                            collectionPath={entityCollectionView.relativePath}
                            view={entityCollectionView}
                        />
                    </Route>
                )
            )}

            {additionalViews &&
            additionalViews.map(additionalView => (
                <Route
                    key={"additional_view_" + additionalView.path}
                    path={addInitialSlash(additionalView.path)}
                >
                    {additionalView.view}
                </Route>
            ))}

            <Redirect to={firstCollectionPath}/>

        </Switch>
    );
}
