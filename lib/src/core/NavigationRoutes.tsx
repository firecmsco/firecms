import React, { PropsWithChildren } from "react";

import { Route, Routes, useLocation } from "react-router-dom";
import { CMSView } from "../types";
import {
    EntityCollectionView,
    FireCMSHomePage,
    NotFoundPage
} from "./components";
import {
    useBreadcrumbsContext,
    useFireCMSContext,
    useNavigationContext
} from "../hooks";
import { toArray } from "./util/arrays";
import equal from "react-fast-compare"

/**
 * @category Components
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
 * or the home route) related to a {@link NavigationContext}.
 * This component needs a parent {@link FireCMS}
 *
 * @constructor
 * @category Components
 */

export const NavigationRoutes = React.memo<NavigationRoutesProps>(
    function NavigationRoutes({
                                  HomePage = FireCMSHomePage,
                                  customRoutes
                              }: NavigationRoutesProps) {

        const location = useLocation();
        const navigation = useNavigationContext();

        const context = useFireCMSContext();
        const plugins = context.plugins ?? [];

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
                    const urlPath = navigation.buildUrlCollectionPath(collection.alias ?? collection.path);
                    const allActions:React.ComponentType<any>[] = [];
                    if (plugins) {
                        plugins.forEach(plugin => {
                            if (plugin.collections?.CollectionActions) {
                                allActions.push(...toArray(plugin.collections?.CollectionActions));
                            }
                        });
                    }
                    allActions.push(...toArray(collection.Actions));
                    return <Route path={urlPath + "/*"}
                                  key={`navigation_${collection.alias ?? collection.path}`}
                                  element={
                                      <RouteWrapper
                                          path={urlPath}
                                          title={collection.name}
                                          type={"collection"}>
                                          <EntityCollectionView
                                              key={`collection_view_${collection.alias ?? collection.path}`}
                                              isSubCollection={false}
                                              fullPath={collection.alias ?? collection.path}
                                              {...collection}
                                              Actions={allActions}/>
                                      </RouteWrapper>
                                  }/>;
                }
            );

        const homeRoute = (
            <Route path={"/"}
                   element={
                       <RouteWrapper
                           path={navigation.homeUrl}
                           key={"navigation_home"}
                           title={"Home"}
                           type={"home"}>
                           <HomePage/>
                       </RouteWrapper>
                   }/>
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
        element={
            <RouteWrapper
                path={path}
                key={`navigation_${path}`}
                title={cmsView.name}
                type={"view"}>
                {cmsView.view}
            </RouteWrapper>}
    />;
};

interface RouteWrapperProps {
    title: string;
    path: string;
    type: "collection" | "view" | "home";
}

/**
 * This component updates the breadcrumb in the app bar when rendered
 * @param children
 * @param title
 * @param path
 * @param type
 * @constructor
 * @category Components
 */

export const RouteWrapper = React.memo<PropsWithChildren<RouteWrapperProps>>(
    function RouteWrapper({
                              children,
                              title,
                              path,
                              type
                          }
                              : PropsWithChildren<RouteWrapperProps>) {

        const breadcrumbsContext = useBreadcrumbsContext();

        React.useEffect(() => {
            breadcrumbsContext.set({
                breadcrumbs: [{
                    title,
                    url: path
                }]
            });
        }, [path, title]);

        return <>{children}</>;
    }, equal);
