import React, { PropsWithChildren } from "react";

import { Route, Routes, useLocation } from "react-router-dom";
import { CMSView, Navigation } from "../models";
import { EntityCollectionView, FireCMSHomePage } from "./components";
import { useNavigation } from "../hooks";
import { useBreadcrumbsContext } from "../hooks/useBreadcrumbsContext";

/**
 * @category Components
 */
export type NavigationRoutesProps = {
    /**
     * In case you need to override the home page
     */
    HomePage?: React.ComponentType;
    basePath?: string;
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
export function NavigationRoutes({ HomePage, basePath }: NavigationRoutesProps) {

    const location = useLocation();
    const navigationContext = useNavigation();
    const navigation = navigationContext.navigation;

    if (!navigation)
        return <></>;

    /**
     * The location can be overridden if `base_location` is set in the
     * state field of the current location. This can happen if you open
     * a side entity, like `products`, from a different one, like `users`
     */
    const baseLocation = location.state && location.state["base_location"] ? location.state["base_location"] : location;

    const customRoutes: JSX.Element[] = [];
    if (navigation.views) {
        const buildCMSViewRoute = (path: string, cmsView: CMSView) => {
            return <Route
                key={"navigation_view_" + path}
                path={basePath + "/" + path}
                element={
                    <BreadcrumbUpdater
                        path={path}
                        key={`navigation_${path}`}
                        title={cmsView.name}>
                        {cmsView.view}
                    </BreadcrumbUpdater>}
            />;
        };

        navigation.views.forEach((cmsView) => {
            if (Array.isArray(cmsView.path))
                customRoutes.push(...cmsView.path.map(path => buildCMSViewRoute(path, cmsView)));
            else
                customRoutes.push(buildCMSViewRoute(cmsView.path, cmsView));
        });
    }

    const collectionRoutes = [...navigation.collections]
        // we reorder collections so that nested paths are included first
        .sort((a, b) => b.path.length - a.path.length)
        .map(entityCollection => {
                const urlPath = navigationContext.buildCollectionPath(entityCollection.path);
                return (
                    <Route path={urlPath + "/*"}
                           key={`navigation_${entityCollection.path}`}
                           element={
                               <BreadcrumbUpdater
                                   path={urlPath}
                                   title={entityCollection.name}>
                                   <EntityCollectionView
                                       key={`collection_table_${entityCollection.path}`}
                                       path={entityCollection.path}
                                       collection={entityCollection}/>
                               </BreadcrumbUpdater>
                           }/>
                );
            }
        );

    const homeRoute =
        <Route path={"/"}
               element={
                   <BreadcrumbUpdater
                       path={"/"}
                       key={`navigation_home`}
                       title={"Home"}>
                       {HomePage ? <HomePage/> : <FireCMSHomePage/>}
                   </BreadcrumbUpdater>
               }/>;

    return (
        <Routes location={baseLocation}>

            {collectionRoutes}

            {customRoutes}

            {homeRoute}

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
    }, [path]);

    return <> {children}</>;
}
