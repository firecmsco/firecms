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

    const location = useLocation();
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
        currentBreadcrumb
    ];

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

                <Route path={`${url}/:entityId`}>
                    <CMSRoute
                        type={"entity"}
                        collectionPath={collectionPath}
                        view={view}
                        previousBreadcrumbs={breadcrumbs}
                    />
                </Route>

                <Route path={url}>
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

