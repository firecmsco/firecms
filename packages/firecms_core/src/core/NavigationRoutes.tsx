import React from "react";

import { Route, Routes, useLocation } from "react-router-dom";
import { CMSView } from "../types";
import { DefaultHomePage, ErrorBoundary, NotFoundPage } from "../components";
import { useNavigationController } from "../hooks";
import { FireCMSRoute } from "../routes/FireCMSRoute";
import { CustomCMSRoute } from "../routes/CustomCMSRoute";
import { HomePageRoute } from "../routes/HomePageRoute";

/**
 * @group Components
 */
export type NavigationRoutesProps = {
    /**
     * In case you need to override the home page
     */
    homePage?: React.ReactNode;

    children?: React.ReactNode | React.ReactNode[]

};

/**
 * This component is in charge of rendering
 * all the related routes (entity collection root views, custom views
 * or the home route) related to a {@link NavigationController}.
 * This component needs a parent {@link FireCMS}
 *
 * @group Components
 */
export const NavigationRoutes = React.memo<NavigationRoutesProps>(
    function NavigationRoutes({
                                  homePage = <DefaultHomePage/>,
                                  children
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
        if (navigation.adminViews) {
            navigation.adminViews.forEach((cmsView) => {
                if (Array.isArray(cmsView.path))
                    cmsViews.push(...cmsView.path.map(path => buildCMSViewRoute(path, cmsView)));
                else
                    cmsViews.push(buildCMSViewRoute(cmsView.path, cmsView));
            });
        }

        const urlPath = navigation.buildUrlCollectionPath("");
        const collectionRoute = <Route path={urlPath + "/*"}
                                       key={`navigation_entity`}
                                       element={
                                           <ErrorBoundary>
                                               <FireCMSRoute/>
                                           </ErrorBoundary>
                                       }/>

        const homeRoute = (
            <Route path={"/"}
                   element={<HomePageRoute>{homePage}</HomePageRoute>}/>
        );

        const notFoundRoute = <Route path={"*"}
                                     element={
                                         <NotFoundPage/>
                                     }/>;

        return (
            <Routes location={baseLocation}>

                {collectionRoute}

                {cmsViews}

                {homeRoute}

                {notFoundRoute}

                {children}

            </Routes>
        );
    });

const buildCMSViewRoute = (path: string, cmsView: CMSView) => {
    return <Route
        key={"navigation_view_" + path}
        path={path}
        element={<CustomCMSRoute cmsView={cmsView}/>}
    />;
};
