import React from "react";

import { Route, Routes, useLocation } from "react-router-dom";
import { CMSView } from "../types";
import { DefaultHomePage, EntityCollectionView, ErrorBoundary, NotFoundPage } from "../components";
import { useNavigationController } from "../hooks";
import { toArray } from "../util/arrays";

/**
 * @group Components
 */
export type NavigationRoutesProps = {
    /**
     * In case you need to override the home page
     */
    HomePage?: React.ComponentType;

    customRoutes?: React.ReactNode[]

};

/**
 * This component is in charge of rendering
 * all the related routes (entity collection root views, custom views
 * or the home route) related to a {@link NavigationController}.
 * This component needs a parent {@link FireCMS}
 *
 * @constructor
 * @group Components
 */

export const NavigationRoutes = React.memo<NavigationRoutesProps>(
    function NavigationRoutes({
                                  HomePage = DefaultHomePage,
                                  customRoutes
                              }: NavigationRoutesProps) {

        const location = useLocation();
        const navigation = useNavigationController();

        if (!navigation)
            return <></>;

        const state = location.state as any;

        /**
         * The location can be overridden if `base_location` is set in the
         * state field of the current location. This can happen if you open
         * a side entity, like `products`, from a different one, like `users`
         */
        const baseLocation = state && state.base_location ? state.base_location : location;

        const cmsViews: React.ReactNode[] = [];
        if (navigation.views) {
            navigation.views.forEach((cmsView) => {
                if (Array.isArray(cmsView.path))
                    cmsViews.push(...cmsView.path.map(path => buildCMSViewRoute(path, cmsView)));
                else
                    cmsViews.push(buildCMSViewRoute(cmsView.path, cmsView));
            });
        }

        // we reorder collections so that nested paths are included first
        const sortedCollections = [...(navigation.collections ?? [])]
            .sort((a, b) => b.path.length - a.path.length);

        const collectionRoutes = sortedCollections
            .map((collection) => {
                    const urlPath = navigation.buildUrlCollectionPath(collection.id ?? collection.path);
                    return <Route path={urlPath + "/*"}
                                  key={`navigation_${collection.id ?? collection.path}`}
                                  element={
                                      <ErrorBoundary>
                                          <EntityCollectionView
                                              key={`collection_view_${collection.id ?? collection.path}`}
                                              isSubCollection={false}
                                              parentCollectionIds={[]}
                                              fullPath={collection.id ?? collection.path}
                                              {...collection}
                                              Actions={toArray(collection.Actions)}/>
                                      </ErrorBoundary>
                                  }/>;
                }
            );

        const homeRoute = (
            <Route path={"/"}
                   element={<HomePage/>}/>
        );

        const notFoundRoute = <Route path={"*"}
                                     element={
                                         <NotFoundPage/>
                                     }/>;

        return (
            <Routes location={baseLocation}>

                {collectionRoutes}

                {cmsViews}

                {homeRoute}

                {notFoundRoute}

                {customRoutes}

            </Routes>
        );
    });

const buildCMSViewRoute = (path: string, cmsView: CMSView) => {
    return <Route
        key={"navigation_view_" + path}
        path={path}
        element={cmsView.view}
    />;
};
