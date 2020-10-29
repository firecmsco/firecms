import React from "react";
import { EntityCollectionView, EntitySchema } from "../models";
import { BreadcrumbEntry, removeInitialSlash } from "./navigation";
import { Route, Switch, useParams, useRouteMatch } from "react-router-dom";
import { EntityFormRoute } from "./EntityFormRoute";
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

    const breadcrumbs: BreadcrumbEntry[] = [
        ...previousBreadcrumbs,
        currentBreadcrumb];


    return (

        <React.Fragment>
            {type === "collection" && <Switch>

                <Route path={`${path}/new`}>
                    <CMSRoute
                        type={"entity"}
                        collectionPath={collectionPath}
                        view={view}
                        previousBreadcrumbs={breadcrumbs}
                    />
                </Route>

                <Route path={`${path}/:entityId`}>
                    <CMSRoute
                        type={"entity"}
                        collectionPath={collectionPath}
                        view={view}
                        previousBreadcrumbs={breadcrumbs}
                    />
                </Route>

                <Route path={path}>
                    <CollectionRoute
                        collectionPath={collectionPath}
                        view={view}
                        breadcrumbs={breadcrumbs}
                    />
                </Route>


            </Switch>}

            {type === "entity" && <Switch>
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
