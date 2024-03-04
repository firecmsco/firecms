import React from "react";

import { Route, Routes } from "react-router-dom";
import { CMSView } from "../types";
import { DefaultHomePage, EntityCollectionView, ErrorBoundary, NotFoundPage } from "../components";
import { useNavigationController, useSideDialogsController } from "../hooks";
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

        const sideDialogsController = useSideDialogsController();

        const navigation = useNavigationController();

        if (!navigation)
            return <></>;

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
            <Route path={"/"} element={<HomePage/>}/>
        );

        const notFoundRoute = <Route path={"*"} element={<NotFoundPage/>}/>;

        console.log("sideDialogsController.basePath", sideDialogsController.basePath)
        return (
            <Routes location={sideDialogsController.basePath}>

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
