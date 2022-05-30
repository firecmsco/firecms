import React, { PropsWithChildren } from "react";

import { Route, Routes, useLocation } from "react-router-dom";
import { CMSView } from "../models";
import { FireCMSHomePage, NotFoundPage } from "./components";
import {
    useBreadcrumbsContext,
    useFireCMSContext,
    useNavigationContext
} from "../hooks";

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
 * This component is in charge of rendering
 * all the related routes (entity collection root views, custom views
 * or the home route) related to a {@link NavigationContext}.
 * This component needs a parent {@link FireCMS}
 *
 * @constructor
 * @category Components
 */
export function NavigationRoutes({ HomePage = FireCMSHomePage }: NavigationRoutesProps) {

    const location = useLocation();
    const navigation = useNavigationContext();

    const context = useFireCMSContext();
    const EntityCollectionViewComponent = context.EntityCollectionViewComponent;

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
                const urlPath = navigation.buildUrlCollectionPath(collection.alias ?? collection.path);
                return <Route path={urlPath + "/*"}
                              key={`navigation_${collection.alias ?? collection.path}`}
                              element={
                                  <BreadcrumbUpdater
                                      path={urlPath}
                                      title={collection.name}>
                                      <EntityCollectionViewComponent
                                          isSubCollection={false}
                                          fullPath={collection.alias ?? collection.path}
                                          {...collection}/>
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
                       <HomePage/>
                   </BreadcrumbUpdater>
               }/>
    );

    const notFoundRoute = <Route path={"*"}
                                 element={
                                     <NotFoundPage/>
                                 }/>;

    return (
        <Routes location={baseLocation}>

            {collectionRoutes}

            {customRoutes}

            {homeRoute}

            {notFoundRoute}

        </Routes>
    );
}

interface BreadcrumbUpdaterProps {
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
                               : PropsWithChildren<BreadcrumbUpdaterProps>) {

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
