import React, { PropsWithChildren } from "react";

import { Route, Routes, useLocation } from "react-router-dom";
import { CMSView, Navigation } from "../models";
import { EntityCollectionView, FireCMSHomePage } from "./components";
import { useNavigation } from "../hooks";
import { useBreadcrumbsContext } from "../hooks/useBreadcrumbsContext";
import { NotFoundPage } from "./components/NotFoundPage";
import { CollectionEditor } from "./components/SchemaEditor/CollectionEditor";
import { EntityCollectionRoute } from "./components/EntityCollectionRoute";
import { SchemaEditorPersistence } from "./components/SchemaEditor/SchemaEditorPersistence";
import { useSchemaRegistry } from "../hooks/useSchemaRegistry";

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
    const navigationContext = useNavigation();
    const schemaRegistry = useSchemaRegistry();
    const navigation = navigationContext.navigation;

    if (!navigation)
        return <></>;

    const state = location.state as any;
    /**
     * The location can be overridden if `base_location` is set in the
     * state field of the current location. This can happen if you open
     * a side entity, like `products`, from a different one, like `users`
     */
    const baseLocation = state && state["base_location"] ? state["base_location"] : location;

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
                const urlPath = navigationContext.buildUrlCollectionPath(collection.path);
                return <Route path={urlPath + "/*"}
                              key={`navigation_${collection.path}`}
                              element={
                                  <BreadcrumbUpdater
                                      path={urlPath}
                                      title={collection.name}>
                                      <EntityCollectionView
                                          path={collection.path}
                                          collection={collection}
                                          editable={false}/>
                                  </BreadcrumbUpdater>
                              }/>;
            }
        );


    const sortedStoredCollections = [...(navigation.storedCollections ?? [])]
        .sort((a, b) => b.path.length - a.path.length);

    const storedCollectionRoutes = sortedStoredCollections
        .map((collection) => {
                const urlPath = navigationContext.buildUrlCollectionPath(collection.path);
                return <Route path={urlPath + "/*"}
                              key={`navigation_${collection.path}`}
                              element={
                                  <BreadcrumbUpdater
                                      path={urlPath}
                                      title={collection.name}>
                                      <EntityCollectionRoute
                                          path={collection.path}
                                          collection={collection}/>
                                  </BreadcrumbUpdater>
                              }/>;
            }
        );

    const collectionEditRoutes = (navigation.storedCollections ?? [])
        .map((collection) => {
                const urlPath = navigationContext.buildUrlEditCollectionPath({
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

    const schemasEditRoutes = (schemaRegistry.schemas ?? [])
        .map((schema) => {
                const urlPath = navigationContext.buildUrlEditSchemaPath({
                    id: schema.id
                });
                return <Route path={urlPath + "/*"}
                              key={`navigation_${schema.id}`}
                              element={
                                  <BreadcrumbUpdater
                                      path={urlPath}
                                      title={"Schema editor"}>
                                      <SchemaEditorPersistence schemaId={schema.id}/>
                                  </BreadcrumbUpdater>
                              }/>;
            }
        );

    const newCollectionPath = navigationContext.buildUrlEditCollectionPath({});
    const addNewCollectionRoute = (
        <Route path={newCollectionPath + "/*"}
               key={`navigation_new`}
               element={
                   <BreadcrumbUpdater
                       path={newCollectionPath}
                       title={`New collection`}>
                       <CollectionEditor/>
                   </BreadcrumbUpdater>
               }/>
    );

    const homeRoute = (
        <Route path={navigationContext.homeUrl}
               element={
                   <BreadcrumbUpdater
                       path={navigationContext.homeUrl}
                       key={`navigation_home`}
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

            {schemasEditRoutes}

            {collectionRoutes}

            {storedCollectionRoutes}

            {addNewCollectionRoute}

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
    }, [path]);

    return <> {children}</>;
}
