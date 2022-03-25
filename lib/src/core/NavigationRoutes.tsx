import React, { PropsWithChildren } from "react";

import { Route, Routes, useLocation } from "react-router-dom";
import { CMSView } from "../models";
import {
    CollectionEditor,
    EntityCollectionView,
    FireCMSHomePage
} from "./components";
import { useNavigationContext } from "../hooks";
import { useBreadcrumbsContext } from "../hooks/useBreadcrumbsContext";
import { NotFoundPage } from "./components/NotFoundPage";

/**
 * @category Components
 */
export type NavigationRoutesProps = {
    /**
     * In case you need to override the home page
     */
    HomePage?: React.ComponentType;
};

/**
 * This component is in charge of taking a {@link Navigation} and rendering
 * all the related routes (entity collection root views, custom views
 * or the home route).
 * This component needs a parent {@link FireCMS}
 *
 * @constructor
 * @category Components
 */
export function NavigationRoutes({ HomePage }: NavigationRoutesProps) {

    const location = useLocation();
    const navigation = useNavigationContext();

    if (!navigation)
        return <></>;

    const state = location.state as any;
    /**
     * The location can be overridden if `base_location` is set in the
     * state field of the current location. This can happen if you open
     * a side entity, like `products`, from a different one, like `users`
     */
    const baseLocation = state && state.base_location ? state.base_location : location;

    const buildCMSViewRoute = (path: string, cmsView: CMSView) => {
        return <Route
            key={"navigation_view_" + path}
            path={path}
            element={
                <BreadcrumbUpdater
                    path={path}
                    key={`navigation_${path}`}
                    title={cmsView.name}>
                    {cmsView.view}
                </BreadcrumbUpdater>}
        />;
    };

    const customRoutes: JSX.Element[] = [];
    if (navigation.views) {
        navigation.views.forEach((cmsView) => {
            if (Array.isArray(cmsView.path))
                customRoutes.push(...cmsView.path.map(path => buildCMSViewRoute(path, cmsView)));
            else
                customRoutes.push(buildCMSViewRoute(cmsView.path, cmsView));
        });
    }

    // we reorder collections so that nested paths are included first
    const sortedCollections = [...(navigation.collections ?? [])]
        .sort((a, b) => b.path.length - a.path.length);

    const collectionRoutes = sortedCollections
        .map((collection) => {
                const urlPath = navigation.buildUrlCollectionPath(collection.path);
                return <Route path={urlPath + "/*"}
                              key={`navigation_${collection.path}`}
                              element={
                                  <BreadcrumbUpdater
                                      path={urlPath}
                                      title={collection.name}>
                                      <EntityCollectionView
                                          fullPath={collection.path}
                                          collection={collection}/>
                                  </BreadcrumbUpdater>
                              }/>;
            }
        );

    const collectionEditRoutes = (navigation.collections?.filter((c) => c.editable) ?? [])
        .map((collection) => {
                const urlPath = navigation.buildUrlEditCollectionPath({
                    path: collection.path
                });
                return <Route path={urlPath + "/*"}
                              key={`navigation_${collection.path}`}
                              element={
                                  <BreadcrumbUpdater
                                      path={urlPath}
                                      title={collection.name}>
                                      <CollectionEditor path={collection.path}/>
                                  </BreadcrumbUpdater>
                              }/>;
            }
        );

    const homeRoute = (
        <Route path={navigation.homeUrl}
               element={
                   <BreadcrumbUpdater
                       path={navigation.homeUrl}
                       key={"navigation_home"}
                       title={"Home"}>
                       {HomePage ? <HomePage/> : <FireCMSHomePage/>}
                   </BreadcrumbUpdater>
               }/>
    );

    const notFoundRoute = <Route path={"*"}
                                 element={
                                     <NotFoundPage/>
                                 }/>;

    return (
        <Routes location={baseLocation}>

            {collectionEditRoutes}

            {collectionRoutes}

            {customRoutes}

            {homeRoute}

            {notFoundRoute}

        </Routes>
    );
}


interface BreadcrumbRouteProps {
    title: string;
    path: string;
}

/**
 * This component updates the breadcrumb in the app bar when rendered
 * @param children
 * @param title
 * @param path
 * @constructor
 * @category Components
 */
function BreadcrumbUpdater({
                               children,
                               title,
                               path
                           }
                               : PropsWithChildren<BreadcrumbRouteProps>) {

    const breadcrumbsContext = useBreadcrumbsContext();
    React.useEffect(() => {
        breadcrumbsContext.set({
            breadcrumbs: [{
                title: title,
                url: path
            }]
        });
    }, [path, title]);

    return <>{children}</>;
}
