import React from "react";
import { EntityCollectionView, EntitySchema } from "../models";
import {
    BreadcrumbEntry,
    buildCollectionPath,
    removeInitialSlash
} from "./navigation";
import {
    Route,
    Switch,
    useHistory,
    useLocation,
    useParams,
    useRouteMatch
} from "react-router-dom";
import { EntityFormRoute } from "./EntityFormRoute";
import { CollectionRoute } from "./CollectionRoute";
import { EntityDetailRoute } from "./EntityDetailRoute";
import { useSelectedEntityContext } from "../selected_entity_controller";
import { fetchEntity } from "../firebase";

interface CMSRouteProps<S extends EntitySchema> {
    view: EntityCollectionView<S>;
    type: CMSRouteType;
    collectionPath: string;
    previousBreadcrumbs?: BreadcrumbEntry[];
}

export type CMSRouteType = "collection" | "entity";

export function CMSRoute<S extends EntitySchema>({
                                                     view,
                                                     collectionPath,
                                                     type,
                                                     previousBreadcrumbs = []
                                                 }: CMSRouteProps<S>) {

    const entityId: string = useParams()["entityId"];

    const location = useLocation();
    const history = useHistory();
    const { path, url } = useRouteMatch();

    const currentBreadcrumb = type === "entity" ? {
        title: entityId ? entityId : "New",
        url,
        view
    } : {
        title: view.name,
        url: url,
        view
    };

    const entityUrlMatch = useRouteMatch({
        path: `${path}/:entityId`,
        exact: true
    });
    const selectedEntityContext = useSelectedEntityContext();
    if (entityUrlMatch && !selectedEntityContext.isOpen) {
        /**
         * In case we have an entity path but the lateral dialog is not open
         * we load the collection view and then open the dialog
         */
        history.replace(buildCollectionPath(collectionPath));
        fetchEntity(collectionPath, entityUrlMatch.params["entityId"], view.schema)
            .then(entity => selectedEntityContext.open({
                entity,
                schema: view.schema,
                subcollections: view.subcollections
            }));
    }

    const breadcrumbs: BreadcrumbEntry[] = [
        ...previousBreadcrumbs,
        currentBreadcrumb];

    const thisLocation = location.state ? location.state["main_location"] : location;

    return (

        <React.Fragment>
            {type === "collection" && <Switch location={thisLocation}>

                <Route path={`${path}/new`}>
                    <CMSRoute
                        type={"entity"}
                        collectionPath={collectionPath}
                        view={view}
                        previousBreadcrumbs={breadcrumbs}
                    />
                </Route>

                <Route path={`${path}/:entityId/edit`}>
                    <CMSRoute
                        type={"entity"}
                        collectionPath={collectionPath}
                        view={view}
                        previousBreadcrumbs={breadcrumbs}
                    />
                </Route>

                {/*<Route path={`${path}/:entityId`}>*/}
                {/*    <CMSRoute*/}
                {/*        type={"entity"}*/}
                {/*        collectionPath={collectionPath}*/}
                {/*        view={view}*/}
                {/*        previousBreadcrumbs={breadcrumbs}*/}
                {/*    />*/}
                {/*</Route>*/}

                <Route path={path}>
                    <CollectionRoute
                        collectionPath={collectionPath}
                        view={view}
                        breadcrumbs={breadcrumbs}
                    />
                </Route>


            </Switch>}

            {type === "entity" && <Switch location={thisLocation}>
                {view.subcollections && view.subcollections.map(entityCollectionView => (
                        <Route
                            path={`${path}/${removeInitialSlash(entityCollectionView.relativePath)}`}
                            key={`navigation_sub_${entityCollectionView.relativePath}`}>
                            <CMSRoute
                                type={"collection"}
                                collectionPath={`${collectionPath}/${entityId}/${removeInitialSlash(entityCollectionView.relativePath)}`}
                                view={entityCollectionView}
                                previousBreadcrumbs={breadcrumbs}
                            />
                        </Route>
                    )
                )}
                <Route path={path}>
                    <EntityFormRoute
                        collectionPath={collectionPath}
                        view={view}
                        breadcrumbs={breadcrumbs}
                    />
                </Route>
            </Switch>}

        </React.Fragment>
    );
}


interface SideCMSRouteProps<S extends EntitySchema> {
    view: EntityCollectionView<S>;
    collectionPath: string;
    type: CMSRouteType;
}

export function SideCMSRoute<S extends EntitySchema>({
                                                         view,
                                                         collectionPath,
                                                         type
                                                     }: SideCMSRouteProps<S>) {

    const entityId: string = useParams()["entityId"];

    const location = useLocation();
    const { path, url } = useRouteMatch();

    return (

        <React.Fragment>
            {type === "collection" && <Switch location={location}>

                <Route path={`${path}/:entityId`}>
                    <SideCMSRoute
                        type={"entity"}
                        collectionPath={collectionPath}
                        view={view}
                    />
                </Route>

            </Switch>}


            {type === "entity" && <Switch location={location}>
                {view.subcollections && view.subcollections.map(entityCollectionView => (
                        <Route
                            path={`${path}/${removeInitialSlash(entityCollectionView.relativePath)}`}
                            key={`navigation_sub_${entityCollectionView.relativePath}`}>
                            <SideCMSRoute
                                type={"collection"}
                                collectionPath={`${collectionPath}/${entityId}/${removeInitialSlash(entityCollectionView.relativePath)}`}
                                view={entityCollectionView}
                            />
                        </Route>
                    )
                )}

                <Route path={path}>
                    <EntityDetailRoute
                        collectionPath={collectionPath}
                        view={view}
                    />
                </Route>
            </Switch>}

        </React.Fragment>
    );
}

