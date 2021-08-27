import React from "react";

import { useLocation } from "react-router-dom";
import { Navigation } from "../models";
import { addInitialSlash, buildCollectionUrlPath } from "./navigation";

import CollectionRoute from "./internal/CollectionRoute";
import CMSViewRoute from "./internal/CMSViewRoute";
import HomeRoute from "./internal/HomeRoute";

export function CMSRouterSwitch({ navigation }: {
    navigation: Navigation
}) {

    const location = useLocation();
    const basePathname = location.state && location.state["base_pathname"] ? location.state["base_pathname"] : location.pathname;

    if (addInitialSlash(basePathname) === "/")
        return <HomeRoute navigation={navigation}/>;

    const matchedCollection = [...navigation.collections]
        // we reorder collections so that nested paths are included first
        .sort((a, b) => b.relativePath.length - a.relativePath.length)
        .find(entityCollection => {
            return addInitialSlash(buildCollectionUrlPath(entityCollection)) === addInitialSlash(basePathname);
        });

    if (matchedCollection) {
        return <CollectionRoute
            key={`col_${matchedCollection.relativePath}`}
            collectionPath={matchedCollection.relativePath}
            collectionConfig={matchedCollection}
        />;
    }
    if (navigation.views) {
        const matchedView = [...navigation.views].find(view => {
            if (Array.isArray(view.path)) {
                const matchedPath = view.path.find((p) => addInitialSlash(p) === addInitialSlash(basePathname));
                return matchedPath !== undefined;
            } else {
                return addInitialSlash(view.path) === addInitialSlash(basePathname);
            }
        });
        if (matchedView) {
            return <CMSViewRoute cmsView={matchedView}/>;
        }
    }
    return <></>;

    // TODO: the following implementation relies on being able to override the location
    // TODO: in react-router
    // const buildCMSViewRoute = (path: string, cmsView: CMSView) => {
    //     return <Route
    //         key={"navigation_view_" + path}
    //         path={addInitialSlash(path)}
    //     >
    //         <CMSViewRoute cmsView={cmsView}/>
    //     </Route>;
    // };
    //
    // let customRoutes: JSX.Element[] = [];
    // if (navigation.views) {
    //     navigation.views.forEach((cmsView) => {
    //         if (Array.isArray(cmsView.path))
    //             customRoutes.push(...cmsView.path.map(path => buildCMSViewRoute(path, cmsView)));
    //         else
    //             customRoutes.push(buildCMSViewRoute(cmsView.path, cmsView));
    //     });
    // }
    // const collectionRoutes = [...collections]
    //     // we reorder collections so that nested paths are included first
    //     .sort((a, b) => b.relativePath.length - a.relativePath.length)
    //     .map(entityCollection => (
    //             <Route
    //                 path={buildCollectionUrlPath(entityCollection)}
    //                 key={`navigation_${entityCollection.relativePath}`}>
    //                 <CollectionRoute
    //                     collectionPath={entityCollection.relativePath}
    //                     collectionConfig={entityCollection}
    //                 />
    //             </Route>
    //         )
    //     );
    // return (
    //     <Routes>
    //
    //         {collectionRoutes}
    //
    //         {customRoutes}
    //
    //         <Route
    //             key={`navigation_home`}>
    //             <HomeRoute
    //                 collections={collections}
    //                 cmsViews={views}
    //             />
    //         </Route>
    //
    //     </Routes>
    // );
}
