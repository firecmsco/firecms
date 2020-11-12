import React from "react";
import { EntityCollectionView, EntitySchema } from "../models";
import { BreadcrumbEntry, removeInitialSlash } from "./navigation";
import {
    Route,
    Switch,
    useLocation,
    useParams,
    useRouteMatch
} from "react-router-dom";
import EntityFormRoute from "./EntityFormRoute";
import { CollectionRoute } from "./CollectionRoute";

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
    const { path, url } = useRouteMatch();

    const thisType = location.state && location.state["main_location"] ? "collection" : type;
    const thisLocation = location.state ? location.state["main_location"] : location;
    const thisPath = location.state ? location.state["main_path"] : path;
    const thisUrl = location.state ? location.state["main_url"] : url;

    const currentBreadcrumb = thisType === "entity" ? {
        title: entityId ? entityId : "New",
        url,
        view
    } : {
        title: view.name,
        url: url,
        view
    };

    const breadcrumbs: BreadcrumbEntry[] = [
        ...previousBreadcrumbs,
        currentBreadcrumb
    ];

    return (

        <React.Fragment>
            {thisType === "collection" && <Switch location={thisLocation}>

                <Route path={`${thisPath}/new`}>
                    <CMSRoute
                        type={"entity"}
                        collectionPath={collectionPath}
                        view={view}
                        previousBreadcrumbs={breadcrumbs}
                    />
                </Route>

                <Route path={`${thisPath}/:entityId`}>
                    <CMSRoute
                        type={"entity"}
                        collectionPath={collectionPath}
                        view={view}
                        previousBreadcrumbs={breadcrumbs}
                    />
                </Route>

                <Route path={thisPath}>
                    <CollectionRoute
                        collectionPath={collectionPath}
                        view={view}
                        breadcrumbs={breadcrumbs}
                    />
                </Route>


            </Switch>}

            {thisType === "entity" && <Switch location={thisLocation}>
                {view.subcollections && view.subcollections.map(entityCollectionView => (
                        <Route
                            path={`${url}/${removeInitialSlash(entityCollectionView.relativePath)}`}
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
                <Route path={thisPath}>
                    <EntityFormRoute
                        key={`form-route-${path}-${entityId ? entityId : "new"}`}
                        collectionPath={collectionPath}
                        view={view}
                        breadcrumbs={breadcrumbs}
                        context={"main"}
                    />
                </Route>
            </Switch>}

        </React.Fragment>
    );
}

